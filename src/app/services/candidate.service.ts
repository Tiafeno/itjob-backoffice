import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { config } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { RequestService } from './request.service';

@Injectable()
export class CandidateService {

  constructor(private http: HttpClient, private requestService: RequestService) { }

  getCandidate(id: number): Observable<any> {
    return this.http.get(`${config.itApi}/candidate/${id}?ref=collect`, { responseType: 'json' });
  }

  activated(id: number, status: boolean): Observable<any> {
    let activated = status ? 1 : 0;
    return this.http.get(`${config.itApi}/candidate/${id}?ref=activated&status=${activated}`, { responseType: 'json' });
  }

  collectDataEditor(): Observable<any[]> {
    let regions = this.http.get(`${config.itApi}/taxonomies/region`, { responseType: 'json' });
    let jobs = this.http.get(`${config.itApi}/taxonomies/job_sought`, { responseType: 'json' });
    let languages = this.http.get(`${config.itApi}/taxonomies/language`, { responseType: 'json' });
    let softwares = this.http.get(`${config.itApi}/taxonomies/software`, { responseType: 'json' });

    return Observable.forkJoin([regions, jobs, languages, softwares]);
  }

  updateTraining(trainings: Array<any>, candidateId: number): Observable<any> {
    let formData = new FormData();
    formData.append('content', JSON.stringify(trainings));
    return this.http.post<any>(`${config.itApi}/candidate/update/training/${candidateId}`, formData, this.requestService.getHttpOptions());
  }

  updateExperience(experiences: Array<any>, candidateId: number): Observable<any> {
    let formData = new FormData();
    formData.append('content', JSON.stringify(experiences));
    return this.http.post<any>(`${config.itApi}/candidate/update/experience/${candidateId}`, formData, this.requestService.getHttpOptions());
  }

  saveCandidate(candidat_id:number, candidat: any): Observable<any> {
    let formData = new FormData();
    formData.append('candidat', JSON.stringify(candidat));
    return this.http.post<any>(`${config.itApi}/candidate/${candidat_id}`, formData, this.requestService.getHttpOptions());
  }
}
