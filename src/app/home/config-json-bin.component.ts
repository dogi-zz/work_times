import {Component, OnChanges, SimpleChanges} from '@angular/core';
import {HomeComponent} from './home.component';
import {DataService} from '../services/data-service';


@Component({
  selector: 'app-config-json-bin',
  template: `
    <div class="config-settings">
      <h2>JsonBin</h2>
      <div class="output-line">
        Siehe <a href="https://jsonbin.io/" target="_blank">jsonbin.io</a>
      </div>
      <div class="input-item">
        <label>BinId</label>
        <input type="text" #d [(ngModel)]="dataService.jsonBinIoBinId"/>
      </div>
      <div class="input-item">
        <label>AccessKey</label>
        <input type="text" #d [(ngModel)]="dataService.jsonBinIoAccessKey"/>
      </div>
      <div class="output-line">
        <div class="a" (click)="generateLink();">generiere link</div>
      </div>
    </div>
  `,
  styles: [`
    @import (reference) "../../styles/commons";

    .output-line {
      margin: 0 10px;
      padding: 5px 10px;
    }
    .input-item {
      margin: 0 10px;
      padding: 5px 10px;
      display: flex;
      flex-direction: column;

    }

  `]

})
export class ConfigJsonBinComponent implements OnChanges {


  constructor(
    private homeComponent: HomeComponent,
    public dataService: DataService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  generateLink() {
    this.dataService.exportLink();
  }
}
