import {Injectable} from '@angular/core';
import {MonthRenderer} from '../tools/month-renderer';
import {Month} from '../tools/date.tools';

declare var jspdf: any;


@Injectable({
  providedIn: 'root',
})
export class PdfService {

  constructor() {

  }


  public async downloadPdf(renderer: MonthRenderer): Promise<any> {
    const pdfSrc = new Uint8Array(renderer.doc.output('arraybuffer'));
    const pdfFile = new Blob([pdfSrc], {type: 'application/pdf'});
    const url = window.URL.createObjectURL(pdfFile);
    window.open(url);
  }


  public async exportPdf(month: Month, dayData: {day: number,shifts: string[], charts: {from: number, to: number, left: number, width: number}[]}[]): Promise<any> {
    console.info(new jspdf.jsPDF())
    const renderer = new MonthRenderer(new jspdf.jsPDF());
    renderer.perform(month, dayData);

    this.downloadPdf(renderer);
  }

}
