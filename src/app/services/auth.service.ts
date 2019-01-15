import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../../environments/environment';
import { map } from 'rxjs/operators/map';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import * as _ from 'lodash';

@Injectable()
export class AuthService {

   constructor(private http: HttpClient, private router: Router) { }

   public login(email: string, pwd: string): any {
      return this.http.post<any>(config.jwtAuthUrl, { username: email, password: pwd })
         .pipe(
            map(user => {
               if (user && user.token) {
                  // Verifier si l'utilisateur est valide
                  // Seul les utilisateur valide sont les administrateurs et les éditeurs
                  let roles: Array<string> = user.data.roles;
                  if (_.indexOf(roles, 'administrator') > -1 || _.indexOf(roles, 'editor') > -1 || _.indexOf(roles, 'contributor') > -1) {
                     localStorage.setItem('currentUser', JSON.stringify(user));
                  } else {
                     return false;
                  }
               }
               return user;
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

   public isAdmin(): boolean {
      let User = JSON.parse(localStorage.getItem('currentUser'));
      if (User && User.token) {
         let roles: Array<string> = User.data.roles;
         if (_.indexOf(roles, 'administrator') > -1) {
            return true;
         } else {
            return false;
         }
      } else {
         this.logout();
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

   /**
    * Seul l'administrateur à l'access
    * @param withAlert boolean
    */
   public hasAccess(withAlert?: boolean): boolean {
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (_.indexOf(currentUser.data.roles, 'administrator') === -1) {
         if (_.isUndefined(withAlert) || withAlert) {
            swal({
               title: 'FORBIDDEN',
               text: 'You don\'t have permission to access.',
               icon: 'error',
               button: false
            } as any);
         }
         return false;
      } else {
         return true
      }
   }

   /**
    * Ne pas autoriser l'utilisateur pour une role definie
    * @param role string
    * @param withAlert boolean
    */
   public notUserAccess(role: string, withAlert?: boolean) : boolean {
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (_.indexOf(currentUser.data.roles, role) >= 0) {
         if (_.isUndefined(withAlert) || withAlert) {
            swal({
               title: 'FORBIDDEN',
               text: 'You don\'t have permission to access.',
               icon: 'error',
               button: false
            } as any);
         }
         return false;
      } else {
         return true
      }
   }
}
