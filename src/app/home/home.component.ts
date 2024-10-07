import {Component, OnInit} from '@angular/core';
import {getNextMonth, Month} from '../tools/date.tools';

@Component({
  selector: 'app-home',
  template: `
      <h1>Arbeitszeiten</h1>
      <div class="month-input">
          {{month|monthToString}}
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
