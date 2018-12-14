import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../../environments/environment';

@Injectable()
export class OfferService {

  constructor(private http: HttpClient) { }

  getOffer(id: number): Observable<any> {
    return this.http.get(`${config.itApi}/offer/${id}`, { responseType: 'json' });
  }
}
