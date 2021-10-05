import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanPrint'
})
export class HumanPrintPipe implements PipeTransform {
  public transform(value: string): string {
    const unCamel = value.replace(/([A-Z])/g, " $1");
    return unCamel.charAt(0).toUpperCase() + unCamel.slice(1);
  }
}
