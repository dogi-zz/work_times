import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {

  @ViewChild('modal') private modal: ElementRef<HTMLElement>;

  public modalOpen = false;
  public modalContent: TemplateRef<ElementRef<HTMLElement>>;

  constructor() {

  }

  public openModal(content: TemplateRef<ElementRef<HTMLElement>>) {
    this.modalOpen = true;
    this.modalContent = content;
  }

  public closeModal() {
    this.modalOpen = false;
  }
}
