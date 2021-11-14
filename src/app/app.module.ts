import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {GridsterModule} from 'angular-gridster2';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {EventlinkClient} from 'spirit-link';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {LogInDialogComponent} from './dialogs/log-in-dialog/log-in-dialog.component';
import {AddNewWidgetDialogComponent} from './dialogs/add-new-widget-dialog/add-new-widget-dialog.component';
import {HumanPrintPipe} from './pipes/human-print.pipe';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {JoinCodeComponent} from './components/widgets/join-code/join-code.component';
import {PlayerSeatingComponent} from './components/widgets/player-seating/player-seating.component';
import {EventClockComponent} from './components/widgets/event-clock/event-clock.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { LoopingAutoScrollComponent } from './components/looping-auto-scroll/looping-auto-scroll.component';

@NgModule({
  declarations: [
    AppComponent,
    EventClockComponent,
    LogInDialogComponent,
    AddNewWidgetDialogComponent,
    JoinCodeComponent,
    PlayerSeatingComponent,
    HumanPrintPipe,
    DashboardComponent,
    LoopingAutoScrollComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    GridsterModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
  ],
  providers: [
    {
      provide: EventlinkClient,
      useValue: new EventlinkClient()
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
