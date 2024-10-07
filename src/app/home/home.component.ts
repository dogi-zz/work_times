import {Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren} from '@angular/core';
import {addMonth, getDaysOfMonth, getNextMonth, Month} from '../tools/date.tools';
import {ShiftCodeService, ShiftEntry} from '../services/shift-code-service';
import {AppComponent} from '../app.component';

const MONTH_ENTRY_CODE = 'MONTH_ENTRIES';


const pad2 = (num: number) => num < 10 ? `0${num}` : `${num}`;

interface DayEntry {
  day: number;
  shiftCode: string;
  shiftEntries: ShiftEntry[];
  shiftEntryCharts: {left: string, width: string}[];

  dayString: string;
}

@Component({
  selector: 'app-home',
  template: `

    <h1>
      <span>Arbeitszeiten</span>
      <div class="button"><span class="material-symbols-outlined" (click)="openConfigSettings()">settings</span></div>
    </h1>
    <div class="month-input">
      <div class="button"><span class="material-symbols-outlined" (click)="addMonth(-1)">chevron_left</span></div>
      <div class="text">{{ month|monthToString }}</div>
      <div class="button"><span class="material-symbols-outlined" (click)="addMonth(1)">chevron_right</span></div>
    </div>

    <div class="day-time-inputs">
      <div class="day-time-input-line" *ngFor="let day of dayEntries">
        <div class="day">{{ day.dayString }}</div>
        <div class="input">
          <input type="text" #dayInput list="shiftCombinations" [(ngModel)]="day.shiftCode" (keydown.enter)="onEnter($event)" (blur)="onBlur(day)"/>
        </div>
        <div class="output-strings">
          <span *ngFor="let shiftEntry of day.shiftEntries">{{ shiftEntry.shiftString || shiftEntry.shiftCode }}</span>
        </div>
        <div class="output-chart">
          <div class="output-chart-item" *ngFor="let chart of  day.shiftEntryCharts" [ngStyle]="chart"></div>
        </div>
      </div>
    </div>

    <datalist id="shiftCombinations">
      <option *ngFor="let shift of shiftCodeService.allShiftCombinations" [value]="shift"></option>
    </datalist>


    <ng-template #inputShift>
      <span class="close" (click)="closeShiftTime()">&times;</span>
      <b>Was bedeutet {{ newShift?.shiftCode }}?</b>
      <div class="shift-enter" *ngIf="newShift">
        <div>von</div>
        <input type="number" [(ngModel)]="newShift.fromTime[0]" (ngModelChange)="checkShiftEntry()"/> :
        <input type="number" [(ngModel)]="newShift.fromTime[1]" (ngModelChange)="checkShiftEntry()"/>
        <div>bis</div>
        <input type="number" [(ngModel)]="newShift.toTime[0]" (ngModelChange)="checkShiftEntry()"/> :
        <input type="number" [(ngModel)]="newShift.toTime[1]" (ngModelChange)="checkShiftEntry()"/>

        <div class="spacer"></div>

        <div class="button" [class.disabled]="newShiftError" (click)="applyShiftTime()"><span class="material-symbols-outlined">check</span></div>
      </div>
      <div class="error"> {{ newShiftError }}</div>
    </ng-template>

    <ng-template #configSettings>
      <span class="close" (click)="closeConfigSettings()">&times;</span>
      <div class="config-settings">
        <h2>Schichten</h2>
        <div class="delete-item" *ngFor="let shift of shiftCodeService.allShifts">
          <div class="name">{{ shift.shiftCode }}</div>
          <div class="info">{{ shift.shiftString }}</div>
          <span class="material-symbols-outlined" (click)="shiftCodeService.deleteShift(shift)">delete</span>
        </div>
        <h2>Schicht-Kombinationen</h2>
        <div class="delete-item" *ngFor="let shiftCombination of shiftCodeService.allShiftCombinations">
          <div class="name">{{ shiftCombination }}</div>
          <div class="info"></div>
          <span class="material-symbols-outlined" (click)="shiftCodeService.deleteShiftCombination(shiftCombination)">delete</span>
        </div>
      </div>
    </ng-template>

  `,
})
export class HomeComponent implements OnInit {

  @ViewChildren('dayInput') private dayInput: QueryList<ElementRef<HTMLInputElement>>;

  @ViewChild('inputShift') private inputShift: TemplateRef<ElementRef<HTMLElement>>;
  @ViewChild('configSettings') private configSettings: TemplateRef<ElementRef<HTMLElement>>;


  public month: Month;
  public dayEntries: DayEntry[];


  public newShift: ShiftEntry;
  public newShiftError: string;
  private newShiftRes: (value: ShiftEntry) => void;


  constructor(
    private appComponent: AppComponent,
    public shiftCodeService: ShiftCodeService,
  ) {
    console.info(this)
  }

  private save() {
    const allEntries = JSON.parse(window.localStorage.getItem(MONTH_ENTRY_CODE) || '{}');
    const key = `${this.month.year}-${this.month.month}`;
    allEntries[key] = this.dayEntries.map(dayEntry => {
      return {day: dayEntry.day, shiftCode: dayEntry.shiftCode}
    });
    window.localStorage.setItem(MONTH_ENTRY_CODE, JSON.stringify(allEntries));
  }

  private load() {
    const allEntries = JSON.parse(window.localStorage.getItem(MONTH_ENTRY_CODE) || '{}');
    const key = `${this.month.year}-${this.month.month}`;
    if (allEntries[key]) {
      this.dayEntries.forEach(dayEntry => {
        const oldEntry = allEntries[key].find(e => e.day === dayEntry.day);
        if (oldEntry) {
          dayEntry.shiftCode = oldEntry.shiftCode;
        }
      })
    }
    this.checkEntries();
  }

  ngOnInit() {
    this.month = getNextMonth()
    this.updateMonth();
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
        dayString: `${pad2(day)}.${pad2(this.month.month + 1)}.`,
        shiftCode: '',
        shiftEntries: [],
        shiftEntryCharts: [],
      }
    })
    this.load();
  }

  private checkEntries(){
    this.dayEntries.forEach(async dayEntry => {
      dayEntry.shiftEntries = [];
      for (const shiftCodeResult of this.shiftCodeService.getShiftCodes(dayEntry.shiftCode)) {
        dayEntry.shiftEntries.push(shiftCodeResult);
      }
    });
    let minTime = 8;
    let maxime = 20;
    this.dayEntries.forEach(dayEntry => {
      dayEntry.shiftEntries.forEach(shiftEntry => {
        if (shiftEntry.shiftString){
          const fromTime = shiftEntry.fromTime[0] + shiftEntry.fromTime[1] / 60;
          const toTime = shiftEntry.toTime[0] + shiftEntry.toTime[1] / 60;
          minTime = Math.min(minTime, fromTime)
          maxime = Math.max(maxime, toTime)
        }
      })
    })
    console.info({minTime, maxime})

    const ratio = maxime - minTime;
    this.dayEntries.forEach(dayEntry => {
      dayEntry.shiftEntryCharts = [];
      dayEntry.shiftEntries.forEach(shiftEntry => {
        if (shiftEntry.shiftString){
          const fromTime = shiftEntry.fromTime[0] + shiftEntry.fromTime[1] / 60;
          const toTime = shiftEntry.toTime[0] + shiftEntry.toTime[1] / 60;
          const fromRatio = (fromTime - minTime) / ratio;
          const toRatio = (toTime - minTime) / ratio;
          dayEntry.shiftEntryCharts.push({left: `${fromRatio * 100}%`, width: `${(toRatio - fromRatio) * 100}%`})
        }
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
    day.shiftEntries = [];
    for (const shiftCodeResult of this.shiftCodeService.getShiftCodes(day.shiftCode)) {
      if (!shiftCodeResult.shiftString) {
        day.shiftEntries.push(await this.addShiftEntry(shiftCodeResult.shiftCode));
      } else {
        day.shiftEntries.push(shiftCodeResult);
      }
    }
    if (day.shiftEntries.length) {
      this.shiftCodeService.addShiftCombination(day.shiftCode);
    }
    this.checkEntries();
    this.save();
  }

  private async addShiftEntry(shiftCode: string): Promise<ShiftEntry> {
    return new Promise<ShiftEntry>(res => {
      this.newShiftRes = res;
      this.newShift = {
        shiftCode,
        fromTime: [null, null],
        toTime: [null, null],
        shiftString: null,
      }
      this.appComponent.openModal(this.inputShift)
      this.checkShiftEntry();
    })
  }

  public checkShiftEntry() {
    this.newShiftError = null;
    if (this.newShift.fromTime[0] === null || this.newShift.fromTime[1] === null) {
      this.newShiftError = 'Bitte eine "Von" Zeit eingeben';
      return;
    }
    if (this.newShift.toTime[0] === null || this.newShift.toTime[1] === null) {
      this.newShiftError = 'Bitte eine "Bis" Zeit eingeben';
      return;
    }

    if (this.newShift.fromTime[0] < 0 || this.newShift.fromTime[0] > 24) {
      this.newShiftError = 'Von (Stunde) passt nicht';
      return;
    }
    if (this.newShift.fromTime[1] < 0 || this.newShift.fromTime[1] >= 60) {
      this.newShiftError = 'Von (Minute) passt nicht';
      return;
    }
    if (this.newShift.toTime[0] < 0 || this.newShift.toTime[0] > 24) {
      this.newShiftError = 'Bis (Stunde) passt nicht';
      return;
    }
    if (this.newShift.toTime[1] < 0 || this.newShift.toTime[1] >= 60) {
      this.newShiftError = 'Bis (Minute) passt nicht';
      return;
    }

    const fromTime = this.newShift.fromTime[0] + this.newShift.fromTime[1];
    const toTime = this.newShift.toTime[0] + this.newShift.toTime[1];
    if (fromTime >= toTime) {
      this.newShiftError = 'Die "Bis" Zeit muss nach der "Von" Zeit sein';
      return;
    }

  }

  applyShiftTime() {
    this.shiftCodeService.addShiftTime(this.newShift);
    const result = this.newShift;
    this.newShift = null;
    this.appComponent.closeModal()
    this.newShiftRes(result);
  }

  closeShiftTime() {
    const shiftCode = this.newShift.shiftCode;
    this.appComponent.closeModal()
    this.newShift = null;
    this.newShiftRes({
      shiftCode,
      fromTime: null,
      toTime: null,
      shiftString: null,
    });
  }

  openConfigSettings(){
    this.appComponent.openModal(this.configSettings)
  }
  closeConfigSettings(){
    this.appComponent.closeModal();
  }
}
