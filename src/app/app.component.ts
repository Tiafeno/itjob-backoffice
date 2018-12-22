import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from "./helpers";
import { RequestService } from './services/request.service';

import * as _ from 'lodash';
@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'app';
  public Notifications: any = [];
  constructor(
    private router: Router,
    private requestService: RequestService
  ) { }

  ngOnInit() {

    this.router.events.subscribe((route) => {
      if (route instanceof NavigationStart) {
        Helpers.setLoading(true);
        this.requestService.collectNotice().subscribe(response => {
          if (response.success) {
            this.Notifications = _.cloneDeep(response.body);
          }
        });
      }
      if (route instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        Helpers.setLoading(false);

        // Initialize page: handlers ...
        Helpers.initPage();
      }

    });
  }

  ngAfterViewInit() { }

}
