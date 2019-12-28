import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/do';

@Injectable()
export class JwtInterceptorService implements HttpInterceptor {
  //constructor(@Inject(forwardRef(() => AuthService)) private auth: AuthService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token && request.url.search(/wordpress/gi) === -1) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      })
    }

    return next.handle(request).do(event => { }, err => {
      if (err instanceof HttpErrorResponse) { // here you can even check for err.status == 404 | 401 etc
        if (err.status == 401 || err.status == 403 || err.status == 511 || err.status == 500) {
          setTimeout(() => {
            //localStorage.removeItem('currentUser');
            //location.reload();
            localStorage.removeItem('currentUser');
          }, 2500);
        }
        Observable.throw(err); // send data to service which will inform the component of the error and in turn the user
      }
    });
  }
}
