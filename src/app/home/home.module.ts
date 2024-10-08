import {NgModule} from '@angular/core';
import {CommonsModule} from '../commons/commons.module';
import {HomeComponent} from './home.component';
import {ShiftComponent} from './shift.component';
import {InputShiftComponent} from './input-shift.component';
import {ConfigDataComponent} from './config-data.component';


@NgModule({
  imports: [
    CommonsModule
  ],
  declarations: [
    ShiftComponent,
    InputShiftComponent,
    ConfigDataComponent,

    HomeComponent,
  ],
  exports: [
    HomeComponent,
  ],
})
export class HomeModule {
}
