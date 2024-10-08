import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';


@Component({
  selector: 'app-time-input',
  template: `
    <div class="time-wrapper">
      <div class="label">{{ label }}</div>
      <div class="time-input" [class.error]="!!error" [title]="error">
        <input #from type="number" [(ngModel)]="value[0]" (ngModelChange)="checkTime()" (keydown)="fromKey($event)"/>
        <input #to type="number" [(ngModel)]="value[1]" (ngModelChange)="checkTime()"/>
      </div>
      <!--      <div class="error">{{timeError}}</div>-->
    </div>
  `,
  styles: [
    `
      @import (reference) "../../styles/commons";

      .time-wrapper{
        display: block;
        width: min-content;

        .label{
            .typo-small();
        }

        .time-input{
          border: 1px solid darken(@color-active, 10%);
          border-radius: 10px;
          display: flex;
          overflow: hidden;
          &.error{
            border-color: red;
          }
        }
        input[type="number"] {
          font-size: 20px;
          border-radius: 0;
          border: none;
          padding: 5px;
          width: 50px;
          &:first-child {
            border-right: 1px dotted @color-line-light-gray;
          }
        }
      }

      input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin: 0;
      }

    `
  ]

})
export class TimeInputComponent implements OnChanges, AfterViewInit {

    @ViewChild('from') private from: ElementRef<HTMLInputElement>;
    @ViewChild('to') private to: ElementRef<HTMLInputElement>;


  @Input() label: string;

  @Input() startFocus: boolean;

  @Input() value: [number, number] = [null, 0];
  @Output() valueChange = new EventEmitter<[number, number]>();

  @Output() onErrorString = new EventEmitter<string>();

  public error: string;


  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.checkTime();
  }

  ngAfterViewInit() {
    if (this.startFocus){
      this.from.nativeElement.focus()
    }
  }

  checkTime() {
    this.error = null;
    if (this.value[0] === null || this.value[1] === null) {
      this.error = `Eingabe bei ${this.label} unvollständig`;
      return;
    }

    if (this.value[0] < 0 || this.value[0] > 24) {
      this.error = `Stunde bei ${this.label} fehlerhaft`;
      return;
    }
    if (this.value[1] < 0 || this.value[1] >= 60) {
      this.error = `Minute bei ${this.label} fehlerhaft`;
      return;
    }
    this.valueChange.emit(this.value)
    this.onErrorString.next(this.error);
  }

  fromKey($event: KeyboardEvent) {
    if ($event.key === 'Enter' || $event.key === ':'){
      if (!isNaN(parseInt(this.from.nativeElement.value, 10))){
        this.to.nativeElement.focus();
      }
    }
  }
}
