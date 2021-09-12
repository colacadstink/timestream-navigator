import {Component, HostListener, OnInit} from '@angular/core';
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
  public dashboard: TimestreamNavigatorWidget[] = [];
  public quietMode = false;

  public options: GridsterConfig = {
    draggable: {
      enabled: true,
      delayStart: 100,
    },
    resizable: {
      enabled: true,
    },
    minCols: 4,
    minRows: 4,
  };

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

  @HostListener('window:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent) {
    if(event.key === 'Escape') {
      this.quietMode = !this.quietMode;
    }
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

  public removeItem(item: TimestreamNavigatorWidget) {
    // This happens in a setTimeout so that gridster doesn't leave a preview behind:
    // https://github.com/tiberiuzuld/angular-gridster2/issues/516#issuecomment-515536410
    setTimeout(() => {
      this.dashboard.splice(this.dashboard.indexOf(item), 1);
    });
  }
}
