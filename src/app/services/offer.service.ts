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
  activated(id: number, status: boolean): Observable<any> {
    let activated = status ? 1 : 0;
    return this.http.get(`${config.itApi}/offer/${id}?ref=activated&status=${activated}`, { responseType: 'json' });
  }

  collectDataEditor(): Observable<any[]> {
    let regions = this.http.get(`${config.itApi}/taxonomies/region`, { responseType: 'json' });
    let towns = this.http.get(`${config.itApi}/taxonomies/city`, { responseType: 'json' });
    let abranchs = this.http.get(`${config.itApi}/taxonomies/branch_activity`, { responseType: 'json' });

    return Observable.forkJoin([regions, towns, abranchs]);
  }

  saveOffer(offer: any): Observable<any> {
    let formData = new FormData();
    formData.append('offer', JSON.stringify(offer));
    return this.http.post<any>(`${config.itApi}/offer/${offer.ID}`, formData, this.requestService.getHttpOptions());
  }
}
