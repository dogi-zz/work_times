import {Pipe, PipeTransform} from '@angular/core';
import {Month} from '../tools/date.tools';

const monthNames = [ 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember' ]

@Pipe({
  name: 'monthToString',
})
export class MonthToStringPipe implements PipeTransform {

  constructor(
  ) {
  }
  public transform(value: Month): string {
    if ((value ?? null) === null) {
      return null;
    }
    return `${monthNames[value.month]} - ${value.year}`;
  }
}

