import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';


@Component({
  selector: 'app-modal-panel',
  template: `
    <div #modal class="modal" [class.open]="modalOpen" (click)="closeModal()">
      <!-- Modal content -->
      <div class="modal-content" (click)="clickOnModal($event)">
        <div class="modal-header">
          <div class="modal-title">{{ modalTitle }}</div>
          <span class="close" (click)="closeModal()">&times;</span>
        </div>
        <ng-template [ngTemplateOutlet]="modalContent"></ng-template>
      </div>

    </div>
  `,
  styles: `
    @import (reference) "../../styles/commons";

    .modal {
      display: none; /* Hidden by default */
      position: fixed; /* Stay in place */
      z-index: 1; /* Sit on top */
      left: 0;
      top: 0;
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      overflow: auto; /* Enable scroll if needed */
      background-color: rgb(0, 0, 0); /* Fallback color */
      background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
      backdrop-filter: blur(2px);


      &.open {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Modal Content/Box */

      .modal-header {
        display: flex;
        align-self: center;

        .modal-title {
          .typo-h2();
          color: @color-active-light;
          cursor: default;
          flex: 1;
        }

      }

      .modal-content {

        min-width: 500px;

        box-shadow: 4px 4px 5px rgba(0, 0, 0, 0.4);

        background-color: #fefefe;
        padding: 20px;
        border: 1px solid #888;
      }

      /* The Close Button */

      .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
      }

      .close:hover,
      .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
      }
    }


    .shift-enter {
      margin: 20px 0 10px;
      display: flex;
      align-items: center;
      gap: 10px;

      .spacer {
        flex: 1;
      }

      input {
        width: 50px;
        text-align: right;
      }
    }

    @media all and (max-width: 600px) {
      .modal-content {
        min-width: unset;
        width: 100vw;
      }

      .modal.open {
        align-items: flex-start;
      }

    }


  `,
})
export class ModalPanelComponent {

  @ViewChild('modal') private modal: ElementRef<HTMLElement>;

  public modalTitle: string;
  public modalOpen = false;
  public modalContent: TemplateRef<ElementRef<HTMLElement>>;

  private closeRes: () => void;


  public openModal(title: string, content: TemplateRef<ElementRef<HTMLElement>>): Promise<void> {
    return new Promise(resolve => {
      this.closeRes = resolve;
      this.modalTitle = title;
      this.modalContent = content;
      this.modalOpen = true;
    });
  }

  public closeModal() {
    this.modalTitle = null;
    this.modalContent = null;
    this.modalOpen = false;
    this.closeRes?.();
    this.closeRes = null;
  }

  public clickOnModal(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

}
