import {Component, OnInit} from '@angular/core';
import {getNextMonth, Month} from '../tools/date.tools';

@Component({
  selector: 'app-home',
  template: `
      <h1>Arbeitszeiten</h1>
      <div class="month-input">
        <div class="button"><span class="material-symbols-outlined">chevron_left</span></div>
        <div class="text">{{month|monthToString}}</div>
        <div class="button"><span class="material-symbols-outlined">chevron_right</span></div>
      </div>
  `,
})
export class HomeComponent implements OnInit{

  public month : Month = getNextMonth();

  constructor() {
    console.info(this)
  }

  ngOnInit() {
  }

}
