import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../../environments/environment';

@Injectable()
export class CompanyService {

  constructor(
    private http: HttpClient
  ) { }

  getCompany(id: number): Observable<any> {
    return this.http.get(`${config.itApi}/company/${id}?ref=collect`, { responseType: 'json' });
  }

  activated(id: number, status: boolean): Observable<any> {
    let activated = status ? 1 : 0;
    return this.http.get(`${config.itApi}/company/${id}?ref=activated&status=${activated}`, { responseType: 'json' });
  }
}
