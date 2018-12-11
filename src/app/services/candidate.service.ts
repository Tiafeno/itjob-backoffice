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
  collectDataEditor(): Observable<any[]> {
    let regions = this.http.get(`${config.itApi}/taxonomies/region`, { responseType: 'json' });
    let jobs = this.http.get(`${config.itApi}/taxonomies/job_sought`, { responseType: 'json' });
    let city = this.http.get(`${config.itApi}/taxonomies/city`, { responseType: 'json' });
    let languages = this.http.get(`${config.itApi}/taxonomies/language`, { responseType: 'json' });
    let abranch = this.http.get(`${config.itApi}/taxonomies/branch_activity`, { responseType: 'json' });
    let softwares = this.http.get(`${config.itApi}/taxonomies/software`, { responseType: 'json' });
    return Observable.forkJoin([regions, jobs, city, languages, softwares]);
  }

}
