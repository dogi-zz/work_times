import {Injectable} from '@angular/core';
import {Month} from '../tools/date.tools';
import {MonthToStringPipe} from '../commons/month-to-string.pipe';

declare var jspdf: any;


@Injectable({
  providedIn: 'root',
})
export class ICalService {

  constructor() {

  }


  public async downloadCalFile(month: Month,iCalCode: string): Promise<any> {
    console.info(iCalCode)
    const icalFIle = new Blob([iCalCode], {type: 'text/calendar'});
    const url = window.URL.createObjectURL(icalFIle);

    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `${new MonthToStringPipe().transform(month)}.ics`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private getICalString(date: Date) {
    let string = date.toISOString();
    string = string.substring(0, 19);
    return string.replace(/[-:]/g, '') + 'Z';
  }


  public async exportICal(month: Month, dayData: { day: number, times: { from: [number, number], to: [number, number] }[] }[]): Promise<any> {
    const eventStrings: string[] = [];
    dayData.forEach(day => {
      day.times.forEach((time, idx) => {
        if (time) {
          const fromDateString = this.getICalString(new Date(month.year, month.month, day.day, time.from[0], time.from[1], 0, 0));
          const toDateString = this.getICalString(new Date(month.year, month.month, day.day, time.to[0], time.to[1], 0, 0));


          eventStrings.push([
            'BEGIN:VEVENT',
            `UID:work_times_${month.year}_${month.month}_${day.day}_${idx}_@dogi-zz.github.io`,
            `DTSTART:${fromDateString}`,
            `DTEND:${toDateString}`,
            'SUMMARY:Arbeit',
            // 'DESCRIPTION:Fortsetzung der Team-Besprechung zu Projekt XY',
            // 'LOCATION:Büro A',
            'END:VEVENT',
          ].join('\n'))
        }
      })
    })

    this.downloadCalFile(month, [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//dogi-zz.github.io.work_times//NONSGML Kalender//DE',
      'CALSCALE:GREGORIAN',

      ...eventStrings,

      'END:VCALENDAR',
    ].join('\n'));
  }

}
