import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from "./helpers";
import { RequestService } from './services/request.service';

import * as _ from 'lodash';
import { AuthService } from './services/auth.service';
import swal from 'sweetalert';
@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'ITJobMada';
  public Notifications: any = [];
  public intervalRef: any;
  constructor(
    private router: Router,
    private requestService: RequestService,
    private Auth: AuthService
  ) { }

  ngOnInit() {
    this.router.events.subscribe((route) => {
      if (route instanceof NavigationStart) {
        if (this.Auth.isLogged()) {
          //Helpers.setLoading(true);
          this.loadNotification();
          clearInterval(this.intervalRef);
        }
      }
      if (route instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        Helpers.setLoading(false);
        // Initialize page: handlers ...
        Helpers.initPage();
        if (this.Auth.isLogged()) {
          this.intervalRef = setInterval( async () => {
            await this.loadNotification();
          }, 15000);
        }
      }
    });
  }

  loadNotification(): void {
    this.requestService.collectNotice().subscribe(
      response => {
        if (response.success) {
          this.Notifications = _.cloneDeep(response.body);
        }
      },
      error => {
        if (error.statusText === 'Unauthorized' || error.statusText === "Forbidden" || error.status === 401 || error.status === 403) {
          clearInterval(this.intervalRef);
          this.Auth.logout();
          location.reload();
          return;
        }
      });
  }

  ngAfterViewInit() {
  }

}
