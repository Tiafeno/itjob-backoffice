import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

}
