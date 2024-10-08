import {NgModule} from '@angular/core';
import {CommonsModule} from '../commons/commons.module';
import {HomeComponent} from './home.component';
import {ShiftComponent} from './shift.component';
import {InputShiftComponent} from './input-shift.component';
import {ConfigDataComponent} from './config-data.component';
import {ConfigJsonBinComponent} from './config-json-bin.component';


@NgModule({
  imports: [
    CommonsModule
  ],
  declarations: [
    ShiftComponent,
    InputShiftComponent,
    ConfigDataComponent,
    ConfigJsonBinComponent,

    HomeComponent,
  ],
  exports: [
    HomeComponent,
  ],
})
export class HomeModule {
}
