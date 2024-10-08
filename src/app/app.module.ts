import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonsModule} from './commons/commons.module';
import {AppComponent} from './app.component';
import {HomeModule} from './home/home.module';
import {RouterModule} from '@angular/router';
import {routes} from './app.routes';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

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
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}

