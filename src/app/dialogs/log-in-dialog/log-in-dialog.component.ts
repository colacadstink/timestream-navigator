import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {EventlinkClient, Role, WotcAuth} from 'spirit-link';
import {CurrentUserInfoService} from '../../services/current-user-info.service';

@Component({
  selector: 'app-log-in-dialog',
  templateUrl: './log-in-dialog.component.html',
  styleUrls: ['./log-in-dialog.component.less']
})
export class LogInDialogComponent implements OnInit {
  public showRolesSelect = false;
  public showLoading = true;

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

  public async ngOnInit() {
    const prevWotcAuthJsonString = localStorage.getItem('wotcAuth');
    if(prevWotcAuthJsonString) {
      const prevWotcAuthData = JSON.parse(prevWotcAuthJsonString);
      const wotcAuth = new WotcAuth();
      Object.assign(wotcAuth, prevWotcAuthData);
      this.eventlink.wotcAuth = wotcAuth;

      try {
        await this.eventlink.wotcAuth.authToken;
        await this.eventlink.init();
        this.currentUserInfo.me = await this.eventlink.getMe();
      } catch {
        // Failure is a fine option; stop here, and we'll just continue showing the log in prompt.
        this.eventlink.wotcAuth = new WotcAuth();
        this.showLoading = false;
        return;
      }

      this.showRolesSelect = true;

      const prevOrgID = localStorage.getItem('selectedOrgID');
      if(prevOrgID) {
        this.selectedRole = this.roles.find((role) => role.organization?.id === prevOrgID);
        if(this.selectedRole) {
          this.setOrg();
          return;
        }
      }

      this.selectedRole = this.roles[0];
      if(this.roles.length === 1) {
        this.setOrg();
      }
    }
    this.showLoading = false;
  }

  public login() {
    this.isLoading = true;
    this.eventlink.login(this.email, this.password).then(async () => {
      if(!this.eventlink.wotcAuth) {
        throw new Error('How is wotcAuth not defined yet?');
      }
      await this.eventlink.wotcAuth.authToken;
      localStorage.setItem('wotcAuth', JSON.stringify(this.eventlink.wotcAuth));

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
      localStorage.setItem('selectedOrgID', this.selectedRole?.organization?.id);
      this.dialogRef.close(true);
    }
  }
}
