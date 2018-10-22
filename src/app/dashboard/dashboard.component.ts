import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ScriptLoaderService } from '../_services/script-loader.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  constructor(private _script: ScriptLoaderService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this._script.load('./assets/js/scripts/dashboard.js', './assets/js/scripts/calendar-demo.js');
  }

}
