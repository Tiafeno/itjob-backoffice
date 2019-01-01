import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    public router: Router
  ) { }

  canActivate(): boolean {
    if (!this.authService.isLogged()) {
      this.router.navigate(['login']);
      return false;
    } else {
      return true;
    }
  }
}
