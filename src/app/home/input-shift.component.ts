import {AfterViewInit, Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {AppComponent} from '../app.component';
import {ShiftCodeService} from '../services/shift-code-service';
import {HomeComponent} from './home.component';
import {TimeInputComponent} from '../commons/time-input.component';


@Component({
  selector: 'app-input-shift',
  template: `
    <div class="time-input-form">
      <app-time-input #from [label]="'Von'" [startFocus]="true" (onErrorString)="checkError()"></app-time-input>
      <app-time-input #to [label]="'Bis'" [startFocus]="false" (onErrorString)="checkError()"></app-time-input>
    </div>
    <div class="error">{{ errorString }}</div>
    <div class="button-line">
      <button [class.disabled]="!!errorString" (click)="saveTime()">Übernehmen</button>
    </div>
  `,
  styles: [
    `
      .time-input-form {
        margin: 10px 0;
        display: flex;
        gap: 20px;
      }

      .button-line{
        display: flex;
        justify-content: flex-end;
        button{
          padding: 5px 10px;
        }
      }

    `
  ]

})
export class InputShiftComponent implements AfterViewInit {

  @ViewChild('from') private from: TimeInputComponent;
  @ViewChild('to') private to: TimeInputComponent;

  public errorString: string;

  @Output()
  public onTimeSet = new EventEmitter<{
    fromTime: [number, number],
    toTime: [number, number],
  }>

  constructor(
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    public shiftCodeService: ShiftCodeService,
  ) {
    console.info(this)
  }

  ngAfterViewInit() {
    this.checkError();
  }

  checkError() {
    setTimeout(()=>{
      this.errorString = this.from.error || this.to.error;
      if (!this.errorString){
        const fromTime = this.from.value[0] + this.from.value[1] / 60;
        const toTime = this.to.value[0] + this.to.value[1] / 60;
        if (fromTime >= toTime) {
          this.errorString = 'Die "Bis" Zeit muss nach der "Von" Zeit sein';
          return;
        }
      }
    })
  }

  saveTime() {
    this.onTimeSet.emit({
      fromTime: this.from.value,
      toTime: this.to.value,
    })
  }
}
