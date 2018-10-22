import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService, public router: Router) {
  }
  canActivate(): boolean {
    if ( ! this.authService.isLogged()) {
      return true;
    } else {
      this.router.navigate(['home']);
      return false;
    }
  }
}
