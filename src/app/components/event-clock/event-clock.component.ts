import {Component, Input, OnInit} from '@angular/core';
import {Event, EventlinkClient, Timer} from 'spirit-link';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-event-clock',
  templateUrl: './event-clock.component.html',
  styleUrls: ['./event-clock.component.less']
})
export class EventClockComponent implements OnInit {
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

  @Input()
  public showCode = false;

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
    const totalSec = Math.floor(this.msRemaining / 1000);
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
    return `${minStr}:${secStr}`;
  }

  constructor(
    private eventlink: EventlinkClient
  ) { }

  public ngOnInit() {
    this.eventlink.getEventInfo(this.event.id).then((info) => {
      this.eventInfo = info;
      console.log(info);
      this.curTimerId = info.gameState?.currentRound?.timerID || undefined;
      if(this.curTimerId) {
        this.eventlink.getTimerInfo(this.curTimerId).then((timer) => {
          this.updateTimer(timer);
        });
        this.timerSub = this.eventlink.subscribeToTimer(this.curTimerId).subscribe((timer) => {
          this.updateTimer(timer);
        }) as any as Subscription; // TODO why????
      }
    });

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
          }) as any as Subscription; // TODO why????
        }
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
      this._endDate = new Date(Date.now() + this._timeLeft);

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
