import {Component, OnInit} from '@angular/core';
import {EventlinkClient, Event} from 'spirit-link';
import {MatDialog} from '@angular/material/dialog';
import {LogInDialogComponent} from './dialogs/log-in-dialog/log-in-dialog.component';
import {CurrentUserInfoService} from './services/current-user-info.service';
import {GridsterConfig, GridsterItem} from 'angular-gridster2';
import {AddNewWidgetDialogComponent} from './dialogs/add-new-widget-dialog/add-new-widget-dialog.component';

export type TimestreamNavigatorWidget = {
  gridsterItem: GridsterItem,
  event: Event,
} & ({
  type: 'clock',
  showCode: boolean,
});

export const TimestreamNavigatorWidgetTypes = [
  'clock',
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  public events: Event[] = [];

  public options: GridsterConfig = {
    draggable: {
      enabled: true,
    },
  };
  public dashboard: TimestreamNavigatorWidget[] = [];

  constructor(
    private dialog: MatDialog,
    public eventlink: EventlinkClient,
    public currentUserInfo: CurrentUserInfoService,
  ) {}

  public ngOnInit() {
    this.dialog.open(LogInDialogComponent, {
      width: '300px',
      disableClose: true
    }).afterClosed().subscribe(async (result) => {
      if(result && this.currentUserInfo.activeOrg?.id) {
        this.events = (await this.eventlink.getUpcomingEvents(this.currentUserInfo.activeOrg.id)).events;
      }
    });
  }

  public async addNewWidget() {
    this.dialog.open(AddNewWidgetDialogComponent, {
      data: this.events,
    }).afterClosed().subscribe((result?: TimestreamNavigatorWidget) => {
      if(result) {
        this.dashboard.push(result);
      }
    });
  }
}
