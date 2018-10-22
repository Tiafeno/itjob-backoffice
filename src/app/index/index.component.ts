import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ScriptLoaderService } from '../_services/script-loader.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, AfterViewInit {

  constructor(private _script: ScriptLoaderService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this._script.load('./assets/js/scripts/dashboard.js', './assets/js/scripts/calendar-demo.js');
  }

}
