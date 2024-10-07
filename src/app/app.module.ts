import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonsModule} from './commons/commons.module';
import {AppComponent} from './app.component';
import {HomeModule} from './home/home.module';
import {RouterModule} from '@angular/router';
import {routes} from './app.routes';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),

    CommonsModule,

    HomeModule
  ],
  declarations: [
    AppComponent,
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent],
})
export class AppModule {
}

