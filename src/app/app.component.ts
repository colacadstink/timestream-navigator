import {Component, OnInit} from '@angular/core';
import {EventlinkClient, User} from 'spirit-link';
import {MatDialog} from '@angular/material/dialog';
import {LogInDialogComponent} from './dialogs/log-in-dialog/log-in-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  public me?: User;

  constructor(
    public eventlink: EventlinkClient,
    private dialog: MatDialog,
  ) {}

  public async ngOnInit() {
    this.dialog.open(LogInDialogComponent, {
      width: '250px',
    }).afterClosed().subscribe(async (result) => {
      console.log(`Login result: ${result}`);
      if(result) {
        this.me = await this.eventlink.getMe();
      }
    });
  }
}
