import {Component, OnChanges, SimpleChanges} from '@angular/core';
import {ShiftCodeService} from '../services/shift-code-service';
import {HomeComponent} from './home.component';


@Component({
  selector: 'app-config-data',
  template: `
    <div class="config-settings">
      <h2>Schichten</h2>
      <div class="delete-item" *ngFor="let shift of shiftCodeService.allShifts.value">
        <div class="name">{{ shift.shiftCode }}</div>
        <div class="info">
          <app-shift [shiftCode]=" shift.shiftCode "></app-shift>
        </div>
        <span class="material-symbols-outlined" (click)="shiftCodeService.deleteShift(shift)">delete</span>
      </div>
      <h2>Schicht-Kombinationen</h2>
      <div class="delete-item" *ngFor="let shiftCombination of shiftCodeService.allShiftCombinations.value">
        <div class="name">{{ shiftCombination }}</div>
        <div class="info"></div>
        <span class="material-symbols-outlined" (click)="shiftCodeService.deleteShiftCombination(shiftCombination)">delete</span>
      </div>
    </div>
  `,
  styles: [
    `
      @import (reference) "../../styles/commons";

      .config-settings {
        height: calc(70vh - 50px);
        overflow-y: auto;

        .delete-item {
          display: flex;
          align-items: center;
          margin: 0 10px;
          padding: 5px 10px;

          &:hover {
            background: @color-hover-bg;
          }

          .name {
            width: 100px;
            font-weight: bold;
            color: @color-active-dark;
          }

          .info {
            flex: 1;
          }

          .material-symbols-outlined {
            cursor: pointer;
          }
        }
      }


    `
  ]

})
export class ConfigDataComponent implements OnChanges {


  constructor(
    private homeComponent: HomeComponent,
    public shiftCodeService: ShiftCodeService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {

  }

}
