import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {
  Event,
  EventlinkClient,
  EventStatus,
  Match,
  Registration,
  ReservationNotificationPayload, Seat,
  Team, TeamStanding
} from 'spirit-link';
import {Subscription} from 'rxjs';
import {QuietModeService} from '../../../services/quiet-mode.service';

/*

Before the event starts, show number of players registered, say hello to new players when they're registered,
 and show who's in the "need to talk to the TO" queue

During the draft, show everyone's seatings by table and seat number.
 (Bonus: Figure out if you should scroll horizontally or vertically by the window size - scroll in the bigger direction)

During normal rounds, show pairings by last name. Table number, player name, result, opponent name.

During a "round confirmed" period, show standings by rank. Player name, points, W-L-D, OMW%
 (Bonus: other tiebreakers, allow for optionally showing/hiding this)

 */

type DisplayState = 'registration' | 'draft' | 'deckConstruction' | 'round' | 'standings' | null;
type MatchByName = {
  table: number,
  name: string,
  result: string,
  opponent: string,
};

@Component({
  selector: 'app-player-seating',
  templateUrl: './player-seating.component.html',
  styleUrls: ['./player-seating.component.less']
})
export class PlayerSeatingComponent implements OnInit, OnDestroy {
  //region @Input() public event: Event
  @Input()
  public get event(): Event {
    throw new Error('Event is required for EventClockComponent');
  };
  public set event(value) {
    Object.defineProperty(this, 'event', {
      value,
      writable: true,
      configurable: true
    });
  }
  //endregion

  private eventStatusSub?: Subscription;
  private subs: Subscription[] = [];

  public eventInfo?: Event;
  public currentDisplayState: DisplayState = null;
  public fontSize = 18;

  // region Registration-specific variables
  public players: Registration[] = [];
  public reservations: ReservationNotificationPayload[] = [];
  // endregion

  // region Deck construction specific variables
  public seatingsByPlayer: Seat[] = [];
  // endregion

  // region Round-specific variables
  public pairingsByPlayer: MatchByName[] = [];
  // endregion

  // region Standings-specific variables
  public standingsByRank: TeamStanding[] = [];
  // endregion

  constructor(
    private eventlink: EventlinkClient,
    public quietMode: QuietModeService,
  ) { }

  public ngOnInit() {
    this.refreshEventInfo();

    this.eventStatusSub = this.eventlink.subscribeToRunningEventStatus(this.event.id).subscribe(() => {
      this.refreshEventInfo();
    });
  }

  public ngOnDestroy() {
    this.eventStatusSub?.unsubscribe();
    this.unsubscribeFromSubs();
  }

  private unsubscribeFromSubs() {
    for(const sub of this.subs) {
      sub.unsubscribe();
    }
    this.subs = [];
  }

  public refreshEventInfo() {
    this.eventlink.getEventInfo(this.event.id, 'network-only').then((info) => {
      this.eventInfo = info;
      this.unsubscribeFromSubs();

      if(this.showRegistrationInfo()) {
        this.currentDisplayState = 'registration';
        // region Registration setup
        this.players = [...(this.eventInfo.registeredPlayers || [])];
        this.reservations = [...(this.eventInfo.interestedPlayers?.map((player) => {
          return {
            ...player,
            reservationId: player.id,
            eventId: this.event.id,
          } as ReservationNotificationPayload;
        }) || [])];
        console.log(this.eventInfo);
        console.log(this.eventInfo.registeredPlayers);
        console.log(this.eventInfo.interestedPlayers);
        console.log(this.reservations);

        // Listen for new registrations
        this.subs.push(this.eventlink.subscribeToPlayerRegistered(this.event.id).subscribe((reg) => {
          this.players.unshift(reg);
          // IF THE PLAYER WAS INTERESTED AND IS NOW REGISTERED THEY ARE NOT REMOVED FROM THE INTERESTED PLAYER LIST
          const resIndex = this.reservations.findIndex((res) => res.personaId === reg.personaId)
          if(resIndex !== -1) {
            this.reservations.splice(resIndex, 1);
          }
        }));
        // Listen for registration changes, and update the relevant player
        this.subs.push(this.eventlink.subscribeToRegistrationUpdated(this.event.id).subscribe((reg) => {
          const existingPlayer = this.players.find((p) => p.id === reg.registrationId);
          if(existingPlayer) {
            Object.assign(existingPlayer, reg);
          }
        }));
        // Listen for new reservations (joins via event code)
        this.subs.push(this.eventlink.subscribeToEventReserved(this.event.id).subscribe((reservation) => {
          console.log(reservation);
          this.reservations.push(reservation);
        }));
        // When a reservation is removed, remove them from the list
        this.subs.push(this.eventlink.subscribeToEventReserved(this.event.id).subscribe((reservation) => {
          const i = this.reservations.findIndex((r) => r.reservationId === reservation.reservationId);
          if(i !== -1) {
            this.reservations.splice(i, 1);
          }
        }));
        // When a player drops, RELOAD THE ENTIRE EVENT because I cannot reliably match a drop notification to the Registration that was dropped.
        // TODO Yell at WotC about this.
        this.subs.push(this.eventlink.subscribeToTeamDropped(this.event.id).subscribe(() => {
          this.refreshEventInfo();
        }));
        // endregion
      } else if(this.showDraftInfo()) {
        this.currentDisplayState = 'draft';
      } else if(this.showDeckConstructionInfo()) {
        this.currentDisplayState = 'deckConstruction';
        this.seatingsByPlayer =  this.getSeatingsByPlayer();
      } else if(this.showRoundInfo()) {
        this.currentDisplayState = 'round';
        // region Round info setup
        // Listen for results to get reported, and RELOAD THE ENTIRE EVENT AGAIN BECAUSE I DON'T KNOW WHICH MATCH CHANGED
        // TODO Complain to WotC about this
        this.subs.push(this.eventlink.subscribeToGameResultReported(this.event.id).subscribe(() => {
          this.refreshEventInfo();
        }));

        // Cache the pairings by player
        this.pairingsByPlayer = this.getPairingsByPlayer();

        // endregion
      } else if(this.showStandings()) {
        this.currentDisplayState = 'standings';
        this.standingsByRank = this.getStandingsByRank();
      } else {
        this.currentDisplayState = null;
        console.log("I don't know what to do! Was it cancelled? ", this.eventInfo?.status);
        console.log(this.eventInfo);
      }
    });
  }

  // region Event state checking
  private showRegistrationInfo() {
    return this.eventInfo?.status && [EventStatus.Scheduled, EventStatus.Playerregistration].includes(this.eventInfo?.status);
  }

  private showDraftInfo() {
    return this.eventInfo?.status === EventStatus.Drafting;
  }

  private showDeckConstructionInfo() {
    return this.eventInfo?.status === EventStatus.Deckconstruction;
  }

  private showRoundInfo() {
    return this.eventInfo?.status && [EventStatus.Roundready, EventStatus.Roundactive, EventStatus.Running].includes(this.eventInfo?.status);
  }

  private showStandings() {
    return this.eventInfo?.status && [EventStatus.Roundcertified, EventStatus.Ended].includes(this.eventInfo?.status);
  }
  //endregion

  public getTeamName(team: Team) {
    if(!team) {
      return 'n/a';
    }
    if(team.name) {
      return team.name;
    }
    if(team.players && team.players.length === 1) {
      return team.players[0].lastName + ', ' + team.players[0].firstName;
    }
    return 'unknown';
  }

  private getPairingsByPlayer() {
    const matches: Match[] = this.eventInfo?.gameState?.currentRound?.matches || [];
    const pairings: MatchByName[] = [];
    for(const match of matches) {
      pairings.push({
        table: match.tableNumber || -1,
        name: this.getTeamName(match.teams[0]),
        result: `${match.leftTeamWins || 0}-${match.rightTeamWins || 0}`,
        opponent: this.getTeamName(match.teams[1]),
      });
      if(match.teams[1]) {
        pairings.push({
          table: match.tableNumber || -1,
          name: this.getTeamName(match.teams[1]),
          result: `${match.rightTeamWins || 0}-${match.leftTeamWins || 0}`,
          opponent: this.getTeamName(match.teams[0]),
        });
      }
    }
    return pairings.sort((a, b) => {
      if(a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      } else if(a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  private getSeatingsByPlayer() {
    const seats: Seat[] = this.eventInfo?.gameState?.constructedSeats || [];

    return seats.sort((a, b) => {
      if((a.lastName ?? '').toLowerCase() < (b.lastName ?? '').toLowerCase()) {
        return -1;
      } else if((a.lastName ?? '').toLowerCase() > (b.lastName ?? '').toLowerCase()) {
        return 1;
      } else {
        if((a.firstName ?? '').toLowerCase() < (b.firstName ?? '').toLowerCase()) {
          return -1;
        } else if((a.firstName ?? '').toLowerCase() > (b.firstName ?? '').toLowerCase()) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }

  private getStandingsByRank() {
    const standings: TeamStanding[] = this.eventInfo?.gameState?.standings || [];
    return standings;
  }
}
