import {Component, ViewChild} from '@angular/core';
import {ModalPanelComponent} from './commons/modal-panel.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  @ViewChild('modalPanel') public modalPanel: ModalPanelComponent;


  constructor() {

  }

}
