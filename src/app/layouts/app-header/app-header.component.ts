import { Component, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RequestService } from '../../services/request.service';

import * as _ from 'lodash';
@Component({
  selector: '[app-header]',
  templateUrl: './app-header.component.html',
})
export class AppHeader implements AfterViewInit {
  public Header: any = { candidate: 0, company: 0, offers: 0 };
  public loading: boolean = false;
  constructor(
    private authservice: AuthService,
    private route: Router,
    private requestservices: RequestService
  ) { }

  ngAfterViewInit() {
    if (this.authservice.isLogged()) {
      this.loading = true;
      this.requestservices.collectHeader()
        .subscribe(
          response => {
            this.Header = _.cloneDeep(response);
            this.loading = false;
          },
          error => {
            if (error.statusText === 'Unauthorized' || error.statusText === "Forbidden" || error.status === 401 || error.status === 403) {
              this.authservice.logout();
            }
          });
    }

  }

  logoutAction() {
    if (this.authservice.logout()) {
      this.route.navigate(['']);
    }
  }

}
