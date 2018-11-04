import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class RequestService {

  constructor(private http: HttpClient) {
  }

  public getCompanyLists(): Observable<any> {
    return this.http.get(`${config.itApi}/company/`, { responseType: 'json' });

  }
  public getCandidateLists(): Observable<any> {
    return this.http.get(`${config.itApi}/candidate/`, { responseType: 'json' });
  }

}
