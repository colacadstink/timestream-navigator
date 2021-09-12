import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {EventlinkClient, Role} from 'spirit-link';
import {CurrentUserInfoService} from '../../services/current-user-info.service';

@Component({
  selector: 'app-log-in-dialog',
  templateUrl: './log-in-dialog.component.html',
  styleUrls: ['./log-in-dialog.component.less']
})
export class LogInDialogComponent {
  public showRolesSelect = false;

  public email = '';
  public password = '';
  public selectedRole?: Role;
  public message = '';
  public isLoading = false;

  public get roles() {
    return this.currentUserInfo.me?.roles || [];
  }

  constructor(
    public dialogRef: MatDialogRef<LogInDialogComponent>,
    public eventlink: EventlinkClient,
    public currentUserInfo: CurrentUserInfoService,
  ) {}

  public login() {
    this.isLoading = true;
    this.eventlink.login(this.email, this.password).then(async () => {
      if(!this.eventlink.wotcAuth) {
        throw new Error('How is wotcAuth not defined yet?');
      }
      await this.eventlink.wotcAuth.authToken;
      this.currentUserInfo.me = await this.eventlink.getMe();
      this.showRolesSelect = true;
      this.message = '';
      this.selectedRole = this.roles[0];
      if(this.roles.length === 1) {
        this.setOrg();
      }
    }).catch((error) => {
      this.message = 'There was an error trying to log in. Check your credentials?';
      console.error(error);
    }).finally(() => {
      this.isLoading = false;
    });
  }

  public setOrg() {
    if(this.selectedRole?.organization) {
      this.currentUserInfo.activeOrg = this.selectedRole?.organization;
      this.dialogRef.close(true);
    }
  }
}
