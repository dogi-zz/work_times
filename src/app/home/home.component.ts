import {Component, ElementRef, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren} from '@angular/core';
import {addMonth, getDaysOfMonth, getNextMonth, Month} from '../tools/date.tools';
import {ShiftCodeService} from '../services/shift-code-service';
import {AppComponent} from '../app.component';
import {Subscription} from 'rxjs';
import {DataService} from '../services/data-service';
import {PdfService} from '../services/pdf.service';
import {ShiftInputComponent} from '../commons/shift-input.component';
import {ICalService} from '../services/i-cal.service';


interface DayEntry {
  day: number;
  shiftCode: string;
  shifts: string[];
  shiftEntryCharts: { from: number, to: number, left: string, width: string }[];
}

@Component({
  selector: 'app-home',
  template: `

    <h1>
      <span>Arbeitszeiten</span>
      <div class="button" (click)="exportICal()"><span class="material-symbols-outlined">event</span><span class="label">iCal</span></div>
      <div class="button" (click)="exportPdf()"><span class="material-symbols-outlined">picture_as_pdf</span><span class="label">Drucken</span></div>
      <div class="button" (click)="uploadData()" *ngIf="dataService.canUpload"><span class="material-symbols-outlined">upload</span></div>
      <div class="button" (click)="downloadData()" *ngIf="dataService.canUpload"><span class="material-symbols-outlined">download</span></div>
      <div class="button" (click)="openConfigSettings()"><span class="material-symbols-outlined">settings</span></div>
    </h1>
    <div class="month-input">
      <div class="button" (click)="addMonth(-1)"><span class="material-symbols-outlined">chevron_left</span></div>
      <div class="text">{{ month|monthToString }}</div>
      <div class="button" (click)="addMonth(1)"><span class="material-symbols-outlined">chevron_right</span></div>
    </div>

    <div class="day-time-inputs">
      <div class="day-time-input-line" *ngFor="let day of dayEntries; let idx = index" [class.weekend]="(day.day | dayToString : month : 'weekend')">
        <div class="week">{{ day.day | dayToString : month : 'week' }}</div>
        <div class="day">{{ day.day | dayToString : month : 'date' }}</div>
        <div class="input">
          <app-shift-input #dayInput [(shiftCode)]="day.shiftCode" (shiftCodeChange)="applyValue(day)" (enterPressed)="onEnter(idx)"></app-shift-input>
        </div>
        <div class="output-strings">
          <app-shift *ngFor="let shift of day.shifts" [shiftCode]="shift"></app-shift>
        </div>
        <div class="output-chart">
          <div class="output-chart-item" *ngFor="let chart of  day.shiftEntryCharts" [ngStyle]="chart"></div>
        </div>
      </div>
    </div>


    <ng-template #inputShift>
      <app-input-shift (onTimeSet)="saveShiftTime($event)"></app-input-shift>
    </ng-template>

    <ng-template #configSettings>
      <div class="config-settings">
        <app-config-data></app-config-data>
        <app-config-json-bin></app-config-json-bin>
      </div>
    </ng-template>
  `,
  styles: [`
    @import (reference) "../../styles/commons";

    .config-settings {
      height: calc(70vh - 50px);
      overflow-y: auto;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChildren('dayInput') private dayInput: QueryList<ShiftInputComponent>;

  @ViewChild('inputShift') private inputShift: TemplateRef<ElementRef<HTMLElement>>;
  @ViewChild('configSettings') private configSettings: TemplateRef<ElementRef<HTMLElement>>;


  public month: Month;
  public dayEntries: DayEntry[];


  private newShiftCode: string;
  private newShiftRes: () => void;

  private checkEntrySubscription: Subscription;
  private loadSubscription: Subscription;

  constructor(
    private appComponent: AppComponent,
    private pdfService: PdfService,
    private iCalService: ICalService,
    public shiftCodeService: ShiftCodeService,
    public dataService: DataService,
  ) {
    console.info(this)
  }

  private save() {
    this.dataService.saveLocalData(this.month, this.dayEntries.map(dayEntry => {
      return {day: dayEntry.day, shiftCode: dayEntry.shiftCode}
    }));
  }

  private load() {
    const oldEntries = this.dataService.getLocalData(this.month);
    this.dayEntries.forEach(dayEntry => {
      const oldEntry = oldEntries.find(e => e.day === dayEntry.day);
      if (oldEntry) {
        dayEntry.shiftCode = oldEntry.shiftCode;
      }
    })
    this.checkEntries();
  }

  ngOnInit() {
    this.month = getNextMonth()
    this.updateMonth();
    this.checkEntrySubscription = this.shiftCodeService.allShifts.subscribe(() => {
      this.checkEntries();
    })
    this.loadSubscription = this.dataService.loadData.subscribe(()=>this.load());
  }

  ngOnDestroy() {
    this.loadSubscription.unsubscribe();
    this.checkEntrySubscription.unsubscribe();
  }

  public addMonth(amount: number) {
    this.month = addMonth(this.month, amount)
    console.info(this.month)
    this.updateMonth();
  }

  private updateMonth() {
    this.dayEntries = getDaysOfMonth(this.month).map(day => {
      return {
        day,
        shiftCode: '',
        shifts: [],
        shiftEntryCharts: [],
      }
    })
    this.load();
  }

  private checkEntries() {
    this.dayEntries.forEach(async dayEntry => {
      dayEntry.shifts = [];
      const {shifts, unknown} = this.shiftCodeService.getShiftCodes(dayEntry.shiftCode)
      dayEntry.shifts = [...shifts, ...unknown];
    });

    const {min, max, times} = this.shiftCodeService.convertToShiftEntries(this.dayEntries.map(d => d.shifts))
    const ratio = max - min;
    this.dayEntries.forEach((dayEntry, idx) => {
      dayEntry.shiftEntryCharts = [];
      times[idx].forEach(([fromTime, toTime]) => {
        const fromRatio = (fromTime - min) / ratio;
        const toRatio = (toTime - min) / ratio;
        dayEntry.shiftEntryCharts.push({from: fromTime, to: toTime, left: `${fromRatio * 100}%`, width: `${(toRatio - fromRatio) * 100}%`})
      })
    })

  }

  onEnter(idx: number) {
    if (idx + 1 < this.dayInput.length) {
      this.dayInput.get(idx + 1).dayInput.nativeElement.focus();
    }
  }

  async applyValue(day: DayEntry) {
    const {shifts, unknown} = this.shiftCodeService.getShiftCodes(day.shiftCode);
    day.shifts = [...shifts, ...unknown];
    day.shiftCode = day.shifts.join(',')
    for (const newShiftCode of unknown) {
      await this.addShiftEntry(newShiftCode)
    }
    this.shiftCodeService.addShiftCombination(day.shiftCode);
    this.checkEntries();
    this.save();
  }

  public async addShiftEntry(shiftCode: string): Promise<void> {
    return new Promise<void>(res => {
      this.newShiftCode = shiftCode;
      this.newShiftRes = res;
      this.appComponent.modalPanel.openModal(`Zeiten für ${shiftCode} eingeben`, this.inputShift).then(() => {
        this.newShiftRes();
        this.newShiftCode = null;
        this.newShiftRes = null;
      })
    })
  }

  saveShiftTime($event: { fromTime: [number, number], toTime: [number, number] }) {
    this.shiftCodeService.addShiftTime({
      shiftCode: this.newShiftCode,
      ...$event,
    })
    this.appComponent.modalPanel.closeModal();
  }


  openConfigSettings() {
    this.appComponent.modalPanel.openModal('Schichten verwalten', this.configSettings).then(() => {

    })
  }


  uploadData() {
    if (confirm('Daten auf den Server hochladen?')) {
      this.dataService.saveToBin();
    }
  }

  downloadData() {
    if (confirm('Lokale Daten überschreiben?')) {
      this.dataService.loadFromBin();
    }
  }

  public exportPdf() {
    this.pdfService.exportPdf(this.month, this.dayEntries.map(d => ({
      day: d.day,
      shifts: d.shifts.map(s => this.shiftCodeService.getShiftStringSync(s) || s),
      charts: d.shiftEntryCharts.map(c => ({from: c.from, to: c.to, left: parseFloat(c.left) / 100, width: parseFloat(c.width) / 100}))
    })));
  }

  public exportICal() {
    this.iCalService.exportICal(this.month, this.dayEntries.map(d => ({
      day: d.day,
      times: d.shifts.map(s => this.shiftCodeService.getShiftTimes(s)),
    })));
  }
}
