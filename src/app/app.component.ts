import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HomeModule} from './home/home.module';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HomeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'work_times';
}
