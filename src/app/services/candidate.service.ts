import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { config } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CandidateService {

  constructor(private http: HttpClient) { }

  getCandidate(id: number): Observable<any> {
    return this.http.get(`${config.itApi}/candidate/${id}`, { responseType: 'json' });
  }

}
