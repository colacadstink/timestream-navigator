import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Event, EventlinkClient, EventStatus, Registration, ReservationNotificationPayload} from 'spirit-link';
import {Subscription} from 'rxjs';

/*

Before the event starts, show number of players registered, say hello to new players when they're registered,
 and show who's in the "need to talk to the TO" queue

During the draft, show everyone's seatings by table and seat number.
 (Bonus: Figure out if you should scroll horizontally or vertically by the window size - scroll in the bigger direction)

During normal rounds, show pairings by last name. Table number, player name, result, opponent name.

During a "round confirmed" period, show standings by rank. Player name, points, W-L-D, OMW%
 (Bonus: other tiebreakers, allow for optionally showing/hiding this)

 */

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

  // region Registration-specific variables
  public players: Registration[] = [];
  public reservations: ReservationNotificationPayload[] = [];
  // endregion

  constructor(
    private eventlink: EventlinkClient
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
        // There's nothing to do for draft, it just works
      } else if(this.showRoundInfo()) {
        // region Round info setup
        // Listen for results to get reported, and RELOAD THE ENTIRE EVENT AGAIN BECAUSE I DON'T KNOW WHICH MATCH CHANGED
        // TODO Complain to WotC about this
        this.subs.push(this.eventlink.subscribeToGameResultReported(this.event.id).subscribe(() => {
          this.refreshEventInfo();
        }));
        // endregion
      } else if(this.showStandings()) {
        // There's nothing to do for standings, it just works
      } else {
        console.log("I don't know what to do! Was it cancelled? ", this.eventInfo?.status);
        console.log(this.eventInfo);
      }
    });
  }

  public showRegistrationInfo() {
    return this.eventInfo?.status && [EventStatus.Scheduled, EventStatus.Playerregistration].includes(this.eventInfo?.status);
  }

  public showDraftInfo() {
    return this.eventInfo?.status && [EventStatus.Drafting, EventStatus.Deckconstruction].includes(this.eventInfo?.status);
  }

  public showRoundInfo() {
    return this.eventInfo?.status && [EventStatus.Roundready, EventStatus.Roundactive, EventStatus.Running, EventStatus.Ended].includes(this.eventInfo?.status);
  }

  public showStandings() {
    return this.eventInfo?.status && [EventStatus.Roundcertified, EventStatus.Ended].includes(this.eventInfo?.status);
  }

  public getPairingsByPlayer() {
    type MatchByName = {
      table: number,
      name: string,
      result: string,
      opponent: string,
    };

    const matches = this.eventInfo?.gameState?.currentRound?.matches || [];
    const pairings: MatchByName[] = [];
    for(const match of matches) {
      pairings.push({
        table: match.tableNumber || -1,
        name: match.teams[0].name || 'unknown',
        result: `${match.leftTeamWins}-${match.rightTeamWins}`,
        opponent: match.teams[1].name || 'unknown',
      });
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
}
