import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import {Helpers} from "../helpers";
import { RequestService } from '../services/request.service';

@Component({
  selector: '.page-wrapper',
  templateUrl: './layout.component.html',
  encapsulation: ViewEncapsulation.None,
})

export class LayoutComponent implements AfterViewInit {

	constructor( 
    private requestService: RequestService
  ) { }

  ngAfterViewInit() {
    // initialize layout: handlers, menu ...
    Helpers.initLayout();

  }

}
