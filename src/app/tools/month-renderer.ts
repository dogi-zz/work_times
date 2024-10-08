import {jsPDF} from 'jspdf';
import {Month} from './date.tools';
import {MonthToStringPipe} from '../commons/month-to-string.pipe';
import {DayToStringPipe} from '../commons/day-to-string.pipe';

// http://raw.githack.com/MrRio/jsPDF/master/docs/jsPDF.html
const pad2 = (num: number) => num < 10 ? `0${num}` : `${num}`;

const timeToString = (time: number) => {
  const hours = Math.floor(time);
  const minutes = (time - Math.floor(time)) * 60;
  return `${pad2(hours)}:${pad2(Math.round(minutes))}`;
}

export class MonthRenderer {
  constructor(
    public doc: jsPDF,
  ) {

  }

  public perform(month: Month, dayData: { day: number, shifts: string[], charts: { from: number, to: number, left: number, width: number }[] }[]) {
    let positionY = 10;
    let result: { y: number, x: number };

    result = this.drawText(10, positionY, 10, '#238305', 'Arbeitszeiten', 'top');
    positionY = result.y + 5;

    result = this.drawText(result.x + 10, result.y, 7.5, '#238305', new MonthToStringPipe().transform(month), 'bottom');
    positionY = result.y + 10;

    console.info(positionY)

    const pageTop = positionY;
    const pageBottom = 270 - 10;
    const fullHeight = pageBottom - positionY;


    const dayToString = new DayToStringPipe();

    let maxX = 100;

    const rowHeight = fullHeight / dayData.length;
    console.info({rowHeight})
    for (let dayItem of dayData) {
      // this.doc.setDrawColor('#aaaaaa');
      // this.doc.setLineWidth(0.25);
      // this.doc.line(10, positionY, 200, positionY);

      if (dayToString.transform(dayItem.day, month, 'weekend')) {
        this.doc.setFillColor('#d8ecd1')
        this.doc.rect(10, positionY, 190, rowHeight, 'F');
      }

      const textHeight = rowHeight * 0.7;
      const textHeightSmall = rowHeight * 0.5;

      this.drawText(12, positionY + (rowHeight - textHeightSmall) / 2, textHeightSmall, '#333333', dayToString.transform(dayItem.day, month, 'week') as string, 'top');
      result = this.drawText(22, positionY + (rowHeight - textHeight) / 2, textHeight, '#000000', dayToString.transform(dayItem.day, month, 'date') as string, 'top');

      let posX = result.x + 5;
      dayItem.shifts.forEach(shift => {
        result = this.drawText(posX, positionY + (rowHeight - textHeightSmall) / 2, textHeightSmall, '#333333', shift, 'top');
        posX = result.x + 5;
        maxX = Math.max(maxX, posX);
      })

      positionY += rowHeight;
    }

    let chartWidth = 200 - maxX;

    positionY = pageTop
    let allTimes: number[] = [];
    let allTimePositions: number[] = [];
    for (let dayItem of dayData) {
      dayItem.charts.forEach(chartItem => {
        this.doc.setFillColor('#5e7559')
        this.doc.rect(maxX + chartItem.left * chartWidth, positionY + 2, chartItem.width * chartWidth, rowHeight - 4, 'F');
        if (!allTimes.includes(chartItem.from)) {
          allTimes.push(chartItem.from)
          allTimePositions.push(maxX + chartItem.left * chartWidth)
        }
        if (!allTimes.includes(chartItem.to)) {
          allTimes.push(chartItem.to)
          allTimePositions.push(maxX + (chartItem.left + chartItem.width) * chartWidth)
        }
      })
      positionY += rowHeight;
    }

    console.info(allTimes)

    this.doc.setDrawColor('#aaaaaa');
    this.doc.setLineWidth(0.25);
    allTimes.forEach((time, idx) => {
      this.doc.line(allTimePositions[idx], pageTop, allTimePositions[idx], pageBottom);
      result = this.drawText(allTimePositions[idx], pageTop - 2, 3, '#333333', timeToString(time), 'rotate');
    })


    // this.doc.setDrawColor('#000000');
    // this.doc.setLineWidth(1);
    // this.doc.line(0, 0, 10, 10);

  }

  private drawText(positionX: number, positionY: number, size: number, color: string, text: string, placement: 'top' | 'bottom' | 'rotate') {
    this.doc.setTextColor(color);
    // if (font.fontStyle === 'bold') {
    //   this.doc.setFont('UniversCom', 'normal', 'bold');
    // } else if (font.fontStyle === 'italic') {
    //   this.doc.setFont('Zurich', 'italic', 'normal');
    // } else {
    //   this.doc.setFont('UniversCom', 'normal', 'normal');
    // }
    const textHeight = size;
    this.doc.setFontSize(size / 0.3527777778);
    const width = this.doc.getTextWidth(text);

    const options: any = placement === 'rotate' ? {angle: 90, rotationDirection: 1} : {}
    this.doc.text(text, positionX + (placement === 'rotate' ? textHeight / 5 * 2 : 0), positionY + (placement === 'top' ? textHeight : 0), options);
    const y = positionY + textHeight;
    return {y, x: positionX + width};
  }
}
