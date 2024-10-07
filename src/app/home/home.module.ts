import {NgModule} from '@angular/core';
import {CommonsModule} from '../commons/commons.module';
import {HomeComponent} from './home.component';


@NgModule({
  imports: [
    CommonsModule
  ],
  declarations: [
    HomeComponent,
  ],
  exports: [
    HomeComponent,
  ],
})
export class HomeModule {
}
