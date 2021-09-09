import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {EventlinkClient} from 'spirit-link';

@Component({
  selector: 'app-log-in-dialog',
  templateUrl: './log-in-dialog.component.html',
  styleUrls: ['./log-in-dialog.component.less']
})
export class LogInDialogComponent {
  public email = '';
  public password = '';
  public message = '';

  constructor(
    public dialogRef: MatDialogRef<LogInDialogComponent>,
    public eventlink: EventlinkClient
  ) {}

  public login() {
    this.eventlink.login(this.email, this.password).then(async () => {
      if(!this.eventlink.wotcAuth) {
        throw new Error('How is wotcAuth not defined yet?');
      }
      await this.eventlink.wotcAuth.authToken;
      this.dialogRef.close(true);
    }).catch((error) => {
      this.message = 'There was an error trying to log in. Check your credentials?';
      console.error(error);
    });
  }
}
