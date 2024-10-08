import {Pipe, PipeTransform} from '@angular/core';
import {getDayDate, Month} from '../tools/date.tools';

const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

const pad2 = (num: number) => num < 10 ? `0${num}` : `${num}`;

@Pipe({
  name: 'dayToString',
})
export class DayToStringPipe implements PipeTransform {

  constructor() {
  }

  public transform(day: number, month: Month, type?: 'week' | 'date'|  'weekend' ): string | boolean {
    const date = getDayDate(day, month)
    if (type === 'date'){
      return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}`;
    } else if (type === 'week'){
      return dayNames[date.getDay()];
    } else if (type === 'weekend'){
      return (date.getDay() === 0 || date.getDay() === 6)  ;
    } else {
      return `${dayNames[date.getDay()]}, ${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}`
    }
  }
}

