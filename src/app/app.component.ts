import {Component, HostListener, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LogInDialogComponent} from './dialogs/log-in-dialog/log-in-dialog.component';
import {CurrentUserInfoService} from './services/current-user-info.service';
import {QuietModeService} from './services/quiet-mode.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    public quietMode: QuietModeService,
    public currentUserInfo: CurrentUserInfoService,
  ) {}

  public ngOnInit() {
    this.dialog.open(LogInDialogComponent, {
      width: '300px',
      disableClose: true
    }).afterClosed().subscribe();
  }

  @HostListener('window:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent) {
    if(event.key === 'Escape') {
      this.quietMode.value = !this.quietMode.value;
    }
  }

  public reset() {
    localStorage.clear();
    location.reload();
  }
}
