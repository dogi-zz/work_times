import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ShiftCodeService} from '../services/shift-code-service';
import {map, Observable} from 'rxjs';


@Component({
  selector: 'app-shift-input',
  template: `
    <div class="shift-input">
      <input type="text" #dayInput list="shiftCombinations" [(ngModel)]="shiftCode" (ngModelChange)="filter($event)" (keydown.enter)="onEnter()" (focus)="onFocus()" (blur)="onBlur()"/>
      <div class="suggestions" *ngIf="suggestionsOpen">
        <div class="suggestion" *ngFor="let suggestion of (suggestions|async)" (click)="applyValue(suggestion)">{{ suggestion }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      @import (reference) "../../styles/commons";

      .shift-input {
        position: relative;
      }

      .suggestions {
        position: absolute;
        left: 5px;
        top: 32px;
        max-height: 50px;
        min-width: 100px;

        border-radius: 5px;
        overflow: hidden;

        border: 1px solid @color-active-light;
        background: white;
        z-index: 10;
      }

      .suggestion {
        padding: 5px 10px;
        cursor: pointer;

        &:hover {
          background: @color-hover-bg;
        }
      }


    `
  ]

})
export class ShiftInputComponent implements OnChanges {
  @ViewChild('dayInput') public dayInput: ElementRef<HTMLInputElement>;

  @Input() shiftCode: string = null;
  @Output() shiftCodeChange = new EventEmitter<string>();

  @Output() enterPressed = new EventEmitter<void>();

  public suggestionsOpen: boolean;
  public suggestions: Observable<string[]>;


  constructor(
    public shiftCodeService: ShiftCodeService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {

  }


  onEnter() {
    this.dayInput.nativeElement.blur()
    this.shiftCodeChange.next(this.shiftCode);
    this.enterPressed.emit();
  }

  filter($event: string) {
    console.info("filter", $event)
    this.suggestions = this.shiftCodeService.allShiftCombinations.pipe(map(combinations => combinations.filter(shiftCode => {
      const parts = $event.trim().toLowerCase().split(/[^a-z0-9]+/);
      return parts.every(part => shiftCode.includes(part));
    })));
  }

  applyValue(value: string) {
    console.info("applyValue", value)
    this.shiftCode = value;
    this.shiftCodeChange.next(value);
  }

  onFocus() {
    this.suggestionsOpen = true;
    this.suggestions = this.shiftCodeService.allShiftCombinations;
  }

  onBlur() {
    this.applyValue(this.shiftCode)
    setTimeout(() => {
      this.suggestionsOpen = false;
    }, 100)
  }
}
