import {Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ShiftCodeService} from '../services/shift-code-service';
import {Subscription} from 'rxjs';
import {splitShift} from '../tools/string-tools';


@Component({
  selector: 'app-shift-input',
  template: `
    <div class="shift-input">
      <input type="text" #dayInput list="shiftCombinations" [(ngModel)]="shiftCode" (ngModelChange)="filter($event)" (keydown)="onKeyDown($event)" (focus)="onFocus()" (blur)="onBlur()"/>
      <div class="suggestions" *ngIf="suggestionsOpen && actualSuggestions.length">
        <div class="suggestion" *ngFor="let suggestion of actualSuggestions; let idx = index;" [class.hover]="suggestionIndex === idx" (click)="applyValue(suggestion)">{{ idx }}{{ suggestion }}</div>
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
        max-height: 120px;
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

        &:hover, &.hover {
          background: @color-hover-bg;
        }
      }


    `
  ]

})
export class ShiftInputComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('dayInput') public dayInput: ElementRef<HTMLInputElement>;

  @Input() shiftCode: string = null;
  @Output() shiftCodeChange = new EventEmitter<string>();

  @Output() enterPressed = new EventEmitter<void>();

  public suggestionsOpen: boolean;
  public suggestionsSubscription: Subscription;

  public actualSuggestions: string[] = [];
  public suggestionIndex = -1;

  constructor(
    public shiftCodeService: ShiftCodeService,
  ) {
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnDestroy() {
    this.suggestionsSubscription?.unsubscribe();

  }


  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      this.suggestionIndex = Math.min(this.suggestionIndex + 1, this.actualSuggestions.length - 1)
    }
    if (event.key === 'ArrowUp') {
      this.suggestionIndex = Math.max(this.suggestionIndex - 1, 0)
    }
    if (event.key === 'Enter') {
      if (this.suggestionIndex >= 0) {
        this.shiftCode = this.actualSuggestions[this.suggestionIndex];
      }
      this.dayInput.nativeElement.blur()
      this.shiftCodeChange.next(this.shiftCode);
      this.enterPressed.emit();
    }
    if (event.key === 'Escape') {
      this.dayInput.nativeElement.blur();
    }
  }

  filter($event: string) {
    this.suggestionIndex = -1;
    this.suggestionsSubscription?.unsubscribe();
    this.suggestionsSubscription = this.shiftCodeService.allShiftCombinations.subscribe(combinations => {
      this.actualSuggestions = combinations.filter(shiftCode => {
        const parts = splitShift($event)
        return parts.every(part => shiftCode.includes(part));
      });
    })

  }

  applyValue(value: string) {
    this.shiftCode = value;
    this.shiftCodeChange.next(value);
    this.enterPressed.emit();
  }

  onFocus() {
    this.suggestionsOpen = true;
    this.suggestionsSubscription?.unsubscribe();
    this.suggestionsSubscription = this.shiftCodeService.allShiftCombinations.subscribe(combinations => {
      this.actualSuggestions = combinations;
    })
  }

  onBlur() {
    this.suggestionsSubscription?.unsubscribe();
    setTimeout(() => {
      this.shiftCodeChange.next(this.shiftCode);
      this.suggestionsOpen = false;
    }, 100)
  }
}
