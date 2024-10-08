import {Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren} from '@angular/core';
import {addMonth, getDaysOfMonth, getNextMonth, Month} from '../tools/date.tools';
import {ShiftCodeService} from '../services/shift-code-service';
import {AppComponent} from '../app.component';
import {Subscription} from 'rxjs';
import {DataService} from '../services/data-service';


interface DayEntry {
  day: number;
  shiftCode: string;
  shifts: string[];
  shiftEntryCharts: { left: string, width: string }[];
}

@Component({
  selector: 'app-home',
  template: `

    <h1>
      <span>Arbeitszeiten</span>
      <div class="button" (click)="uploadData($event)" *ngIf="dataService.canUpload"><span class="material-symbols-outlined">upload</span></div>
      <div class="button" (click)="openConfigSettings()"><span class="material-symbols-outlined">settings</span></div>
    </h1>
    <div class="month-input">
      <div class="button" (click)="addMonth(-1)"><span class="material-symbols-outlined">chevron_left</span></div>
      <div class="text">{{ month|monthToString }}</div>
      <div class="button" (click)="addMonth(1)"><span class="material-symbols-outlined">chevron_right</span></div>
    </div>

    <div class="day-time-inputs">
      <div class="day-time-input-line" *ngFor="let day of dayEntries" [class.weekend]="(day.day | dayToString : month : 'weekend')">
        <div class="week">{{ day.day | dayToString : month : 'week' }}</div>
        <div class="day">{{ day.day | dayToString : month : 'date' }}</div>
        <div class="input">
          <input type="text" #dayInput list="shiftCombinations" [(ngModel)]="day.shiftCode" (keydown.enter)="onEnter($event)" (blur)="onBlur(day)"/>
        </div>
        <div class="output-strings">
          <app-shift *ngFor="let shift of day.shifts" [shiftCode]="shift"></app-shift>
        </div>
        <div class="output-chart">
          <div class="output-chart-item" *ngFor="let chart of  day.shiftEntryCharts" [ngStyle]="chart"></div>
        </div>
      </div>
    </div>

    <datalist id="shiftCombinations">
      <option *ngFor="let shift of shiftCodeService.allShiftCombinations|async" [value]="shift"></option>
    </datalist>


    <ng-template #inputShift>
      <app-input-shift (onTimeSet)="saveShiftTime($event)"></app-input-shift>
    </ng-template>

    <ng-template #configSettings>
      <app-config-data></app-config-data>
    </ng-template>

  `,
})
export class HomeComponent implements OnInit {

  @ViewChildren('dayInput') private dayInput: QueryList<ElementRef<HTMLInputElement>>;

  @ViewChild('inputShift') private inputShift: TemplateRef<ElementRef<HTMLElement>>;
  @ViewChild('configSettings') private configSettings: TemplateRef<ElementRef<HTMLElement>>;


  public month: Month;
  public dayEntries: DayEntry[];


  private newShiftCode: string;
  private newShiftRes: () => void;

  private checkEntrySubscription: Subscription;

  constructor(
    private appComponent: AppComponent,
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
        dayEntry.shiftEntryCharts.push({left: `${fromRatio * 100}%`, width: `${(toRatio - fromRatio) * 100}%`})
      })
    })

  }

  onEnter($event: any) {
    const input = $event.target as HTMLInputElement;
    const idx = this.dayInput.toArray().findIndex(di => di.nativeElement === input);
    if (idx + 1 < this.dayInput.length) {
      this.dayInput.get(idx + 1).nativeElement.focus();
    }
  }

  async onBlur(day: DayEntry) {
    const {shifts, unknown} = this.shiftCodeService.getShiftCodes(day.shiftCode);
    day.shifts = [...shifts, ...unknown];
    for (const newShiftCode of unknown) {
      await this.addShiftEntry(newShiftCode)
    }
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
      console.info("HIER")
    })
  }


  uploadData($event: MouseEvent) {
    if ($event.ctrlKey){
      this.dataService.exportLink();
    }
    this.dataService.saveToBin();
  }
}
