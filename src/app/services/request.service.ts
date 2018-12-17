import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { config } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class RequestService {

  constructor(private http: HttpClient, private router: Router) {
  }

  public getCompanyLists(page): Observable<any> {
    return this.http.get(`${config.itApi}/company/`, { responseType: 'json' });

  }
  public getCandidateLists(page): Observable<any> {
    return this.http.get(`${config.itApi}/candidate/`, { responseType: 'json' });
  }

  public collectDashboard(): Observable<any> {
    return this.http.get(`${config.itApi}/dashboard/?ref=collect`, { responseType: 'json' });
  }

  public collectHeader(): Observable<any> {
    return this.http.get(`${config.itApi}/dashboard/?ref=header`, { responseType: 'json' });
  }

  public getHttpOptions(): any {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${currentUser.token}`
      })
    };
    return httpOptions;
  }

}
