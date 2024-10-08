import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MonthToStringPipe} from './month-to-string.pipe';
import {ModalPanelComponent} from './modal-panel.component';
import {TimeInputComponent} from './time-input.component';
import {DayToStringPipe} from './day-to-string.pipe';


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
  ],
  exports: [
    CommonModule,
    FormsModule,

    MonthToStringPipe,
    DayToStringPipe,

    ModalPanelComponent,
    TimeInputComponent,
  ],
  providers: []

})
export class CommonsModule {
}

