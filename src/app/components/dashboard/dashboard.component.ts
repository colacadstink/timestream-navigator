import {Component, OnInit} from '@angular/core';
import {EventlinkClient, Event} from 'spirit-link';
import {MatDialog} from '@angular/material/dialog';
import {GridsterConfig, GridsterItem} from 'angular-gridster2';
import {AddNewWidgetDialogComponent} from '../../dialogs/add-new-widget-dialog/add-new-widget-dialog.component';
import {CurrentUserInfoService} from '../../services/current-user-info.service';
import {QuietModeService} from '../../services/quiet-mode.service';

export type TimestreamNavigatorWidget = {
  gridsterItem: GridsterItem,
  event: Event,
} & ({
  type: 'clock',
  showCode: boolean,
} | {
  type: 'joinCode',
} | {
  type: 'playerSeating'
});

export const TimestreamNavigatorWidgetTypes = [
  'clock',
  'joinCode',
  'playerSeating'
];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  public events: Event[] = [];
  public dashboard: TimestreamNavigatorWidget[] = [];

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
    public quietMode: QuietModeService,
  ) {}

  public async ngOnInit() {
    if(this.currentUserInfo.activeOrg) {
      this.events = (await this.eventlink.getUpcomingEvents(this.currentUserInfo.activeOrg.id)).events;
      const prevDashboardStr = localStorage.getItem('dashboard');
      if(prevDashboardStr) {
        this.dashboard = JSON.parse(prevDashboardStr);
      }
    } else {
      this.reset();
    }
  }

  public reset() {
    localStorage.clear();
    location.reload();
  }

  public async addNewWidget() {
    this.dialog.open(AddNewWidgetDialogComponent, {
      data: this.events,
    }).afterClosed().subscribe((result?: TimestreamNavigatorWidget) => {
      if(result) {
        this.dashboard.push(result);
        this.saveDashboard();
      }
    });
  }

  public removeItem(item: TimestreamNavigatorWidget) {
    // This happens in a setTimeout so that gridster doesn't leave a preview behind:
    // https://github.com/tiberiuzuld/angular-gridster2/issues/516#issuecomment-515536410
    setTimeout(() => {
      this.dashboard.splice(this.dashboard.indexOf(item), 1);
      this.saveDashboard();
    });
  }

  public saveDashboard() {
    localStorage.setItem('dashboard', JSON.stringify(this.dashboard));
  }
}
