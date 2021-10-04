import {Component, Input, OnInit} from '@angular/core';
import {Event, EventlinkClient} from 'spirit-link';

@Component({
  selector: 'app-join-code',
  templateUrl: './join-code.component.html',
  styleUrls: ['./join-code.component.less']
})
export class JoinCodeComponent implements OnInit {
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

  public eventInfo?: Event;

  constructor(
    private eventlink: EventlinkClient
  ) { }

  public ngOnInit() {
    this.eventlink.getEventInfo(this.event.id, 'network-only').then((info) => {
      this.eventInfo = info;
    });
  }
}
