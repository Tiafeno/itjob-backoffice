import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable()
export class OfferService {

  constructor(private http: HttpClient, private requestService: RequestService) { }

  getOffer(id: number): Observable<any> {
    return this.http.get(`${config.itApi}/offer/${id}?ref=collect`, { responseType: 'json' });
  }

  getRequest(id: number): Observable<any> {
    return this.http.get(`${config.itApi}/offer/${id}?ref=request`, { responseType: 'json' });
  }

  updateRequest(offerId: number, requestId: number, status: string): Observable<any> {
    return this.http.get(`${config.itApi}/offer/${offerId}?ref=update_request&status=${status}&id_request=${requestId}`, { responseType: 'json' });
  }

  activated(id: number, status: boolean): Observable<any> {
    let activated = status ? 1 : 0;
    return this.http.get(`${config.itApi}/offer/${id}?ref=activated&status=${activated}`, { responseType: 'json' });
  }

  collectDataEditor(): Observable<any[]> {
    let regions = this.http.get(`${config.itApi}/taxonomies/region`, { responseType: 'json', observe: 'response' });
    return Observable.forkJoin([regions]);
  }

  saveOffer(offer: any): Observable<any> {
    let formData = new FormData();
    formData.append('offer', JSON.stringify(offer));
    return this.http.post<any>(`${config.itApi}/offer/${offer.ID}`, formData, this.requestService.getHttpOptions());
  }
}
