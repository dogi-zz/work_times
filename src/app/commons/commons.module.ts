import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MonthToStringPipe} from './month-to-string.pipe';
import {ModalPanelComponent} from './modal-panel.component';
import {TimeInputComponent} from './time-input.component';
import {DayToStringPipe} from './day-to-string.pipe';
import {ShiftInputComponent} from './shift-input.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    MonthToStringPipe,
    DayToStringPipe,

    ModalPanelComponent,
    TimeInputComponent,
    ShiftInputComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,

    MonthToStringPipe,
    DayToStringPipe,

    ModalPanelComponent,
    TimeInputComponent,
    ShiftInputComponent,
  ],
  providers: []

})
export class CommonsModule {
}

