import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../../environments/environment';
import { map } from 'rxjs/operators/map';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  public login(email: string, pwd: string): any {
    return this.http.post<any>(config.jwtAuthUrl, { username: email, password: pwd })
      .pipe(map(user => {
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        return user
      }));
  }

  // Ajouter une function await pour vérifier la validation de l'autorisation
  public isLogged(): boolean {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      return true;
    } else {
      return false;
    }
  }

  public logout() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      localStorage.removeItem('currentUser');
      return true;
    } else {
      return false;
    }
  }

  public getCurrentUser() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser;
  }

}
