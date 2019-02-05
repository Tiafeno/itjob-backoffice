import { Injectable, Inject, forwardRef, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import swal from 'sweetalert2';
import 'rxjs/add/operator/do';
import { AuthService } from './auth.service';

@Injectable()
export class JwtInterceptorService implements HttpInterceptor {
  //constructor(@Inject(forwardRef(() => AuthService)) private auth: AuthService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      })
    }
    return next.handle(request).do(event => { }, err => {
      if (err instanceof HttpErrorResponse) { // here you can even check for err.status == 404 | 401 etc
        swal(err.name, err.message, 'error');
        setTimeout(() => {
          localStorage.removeItem('currentUser');
          //location.reload();
        }, 2000);
        Observable.throw(err); // send data to service which will inform the component of the error and in turn the user
      }
    });
  }
}
