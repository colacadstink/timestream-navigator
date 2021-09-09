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

@NgModule({
  declarations: [
    AppComponent,
    EventClockComponent,
    LogInDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule
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
