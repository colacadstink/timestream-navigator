import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Event} from 'spirit-link';
import {
  TimestreamNavigatorWidget,
  TimestreamNavigatorWidgetTypes
} from '../../components/dashboard/dashboard.component';

@Component({
  selector: 'app-add-new-widget-dialog',
  templateUrl: './add-new-widget-dialog.component.html',
  styleUrls: ['./add-new-widget-dialog.component.less']
})
export class AddNewWidgetDialogComponent {
  public readonly widgetTypes = TimestreamNavigatorWidgetTypes;

  public selectedEvent?: Event;
  public widgetType: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddNewWidgetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public events: Event[],
  ) { }

  public addWidget() {
    this.dialogRef.close({
      gridsterItem: {},
      type: this.widgetType,
      event: this.selectedEvent
    } as TimestreamNavigatorWidget);
  }
}
