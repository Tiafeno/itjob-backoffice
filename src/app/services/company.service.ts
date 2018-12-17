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
}
