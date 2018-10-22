import { Component, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: '[app-header]',
  templateUrl: './app-header.component.html',
})
export class AppHeader implements AfterViewInit {

  constructor(
    private authservice: AuthService,
    private route: Router
  ) { }

  ngAfterViewInit() {
  }

  logoutAction() {
    if (this.authservice.logout()) {
      this.route.navigate(['']);
    }
  }

}
