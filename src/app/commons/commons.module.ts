import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MonthToStringPipe} from './month-to-string.pipe';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    MonthToStringPipe,
  ],
  exports: [
    CommonModule,
    FormsModule,

    MonthToStringPipe,
  ],
})
export class CommonsModule {
}

