import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AppComponent} from '../app.component';
import {ShiftCodeService} from '../services/shift-code-service';
import {Observable} from 'rxjs';
import {HomeComponent} from './home.component';


@Component({
  selector: 'app-shift',
  template: `
    <span class="shift-entry" [class.unknown]="!(shiftString|async)" (click)="onClick($event)">{{ (shiftString|async) || shiftCode }}</span>
  `,
  styles: [
    `
      @import (reference) "../../styles/commons";

      .shift-entry{
        .typo-regular();

        &.unknown{
          font-style: italic;
          cursor: pointer;
        }
      }

    `
  ]

})
export class ShiftComponent implements OnChanges{

  @Input()
  shiftCode: string

  public shiftString : Observable<string>;

  constructor(
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    public shiftCodeService: ShiftCodeService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.shiftString = this.shiftCodeService.getShiftString(this.shiftCode)
  }

  onClick($event: MouseEvent) {
    if (!this.shiftCodeService.hasShiftString(this.shiftCode)){
      this.homeComponent.addShiftEntry(this.shiftCode).then();
    }
  }
}
