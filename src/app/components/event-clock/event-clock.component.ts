import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-event-clock',
  templateUrl: './event-clock.component.html',
  styleUrls: ['./event-clock.component.less']
})
export class EventClockComponent implements OnInit {
  @Input()
  public eventId?: string;

  constructor() { }

  ngOnInit(): void {
  }
}
