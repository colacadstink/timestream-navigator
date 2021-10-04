import {Component, Input, OnInit} from '@angular/core';
import {Event, EventlinkClient, Timer} from 'spirit-link';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-event-clock',
  templateUrl: './event-clock.component.html',
  styleUrls: ['./event-clock.component.less']
})
export class EventClockComponent implements OnInit {
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
  @Input() public showCode = false;

  private _timeLeft = 0;
  private _endDate: Date | null = null;
  private curTimerId?: string;
  private timerSub?: Subscription;

  public eventInfo?: Event;
  public isTimerRunning = false;

  public get msRemaining() {
    if(this.isTimerRunning) {
      if(this._endDate) {
        return (this._endDate?.getTime() || 0) - Date.now();
      } else {
        return 0;
      }
    } else {
      return this._timeLeft;
    }
  }

  public get minSecString() {
    if(this.eventInfo?.status === 'SCHEDULED') {
      return '__:__';
    }
    if(this.eventInfo?.status === 'ENDED' || this.eventInfo?.status === 'CANCELLED') {
      return 'Over';
    }

    const msRemaining = this.msRemaining;
    const isNegative = msRemaining < 0;
    const totalSec = Math.abs(Math.floor(msRemaining / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec - (min * 60);
    let minStr = min.toString()
    while(minStr.length < 2) {
      minStr = `0${minStr}`;
    }
    let secStr = sec.toString();
    while(secStr.length < 2) {
      secStr = `0${secStr}`;
    }
    return `${isNegative?'-':''}${minStr}:${secStr}`;
  }

  public get activeClass() {
    if(this.eventInfo?.status === 'SCHEDULED') {
      return 'is-scheduled';
    }
    if(this.eventInfo?.status === 'ENDED' || this.eventInfo?.status === 'CANCELLED') {
      return 'is-over';
    }

    return (this.msRemaining <= 999 ? 'is-negative' : '')
  }

  constructor(
    private eventlink: EventlinkClient
  ) { }

  public ngOnInit() {
    this.loadEventInfo();

    this.eventlink.subscribeToCurrentRound(this.event.id).subscribe((round) => {
      console.log(round);
      if(round.timerID) {
        this.eventlink.getTimerInfo(round.timerID).then((timer) => {
          this.updateTimer(timer);
        });
        if(this.curTimerId !== round.timerID) {
          this.curTimerId = round.timerID;
          this.timerSub?.unsubscribe();
          this.timerSub = this.eventlink.subscribeToTimer(this.curTimerId).subscribe((timer) => {
            this.updateTimer(timer);
          });
        }
      }
    });
  }

  public loadEventInfo(refresh = false) {
    this.eventlink.getEventInfo(this.event.id, (refresh ? 'network-only' : undefined)).then((info) => {
      this.eventInfo = info;
      this.curTimerId = info.gameState?.currentRound?.timerID || undefined;
      if(this.curTimerId) {
        this.eventlink.getTimerInfo(this.curTimerId).then((timer) => {
          this.updateTimer(timer);
        });
        this.timerSub?.unsubscribe();
        this.timerSub = this.eventlink.subscribeToTimer(this.curTimerId).subscribe((timer) => {
          this.updateTimer(timer);
        });
      }
    });
  }

  private updateTimer(timer: Timer) {
    const now = Date.now();

    this._timeLeft = timer.durationMs || 0;
    this.isTimerRunning = timer.state === 'RUNNING';
    if(this.isTimerRunning) {
      const endTime = new Date(timer.durationStartTime).getTime() + (timer.durationMs || 0);
      this._timeLeft = endTime - new Date(timer.serverTime).getTime();
      this._endDate = new Date(now + this._timeLeft);

      const idleLoop = () => {
        if(this.isTimerRunning) {
          setTimeout(idleLoop, 200);
        }
      };
      setTimeout(idleLoop, 200);
    } else {
      this._endDate = null;
    }
  }
}
