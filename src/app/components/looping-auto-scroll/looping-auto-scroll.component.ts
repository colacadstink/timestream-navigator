import {Component, ElementRef, Input, TemplateRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-looping-auto-scroll',
  templateUrl: './looping-auto-scroll.component.html',
  styleUrls: ['./looping-auto-scroll.component.less']
})
export class LoopingAutoScrollComponent {
  @Input()
  public template: TemplateRef<any> | null = null;

  @ViewChild('loopContainer')
  public container: ElementRef<HTMLDivElement> | null = null;

  public get scrollDuration() {
    if(this.container?.nativeElement) {
      const groundToCover = this.container.nativeElement.scrollHeight / 5;
      const pxPerSec = 250;
      return groundToCover / pxPerSec;
    } else {
      return 10;
    }
  }
}

