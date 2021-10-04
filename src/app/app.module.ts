import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { EventClockComponent } from './components/event-clock/event-clock.component';
import {EventlinkClient} from 'spirit-link';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LogInDialogComponent } from './dialogs/log-in-dialog/log-in-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {GridsterModule} from 'angular-gridster2';
import {MatIconModule} from '@angular/material/icon';
import { AddNewWidgetDialogComponent } from './dialogs/add-new-widget-dialog/add-new-widget-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { JoinCodeComponent } from './components/join-code/join-code.component';

@NgModule({
  declarations: [
    AppComponent,
    EventClockComponent,
    LogInDialogComponent,
    AddNewWidgetDialogComponent,
    JoinCodeComponent
  ],
    imports: [
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
    ],
  providers: [
    {
      provide: EventlinkClient,
      useValue: new EventlinkClient()
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
