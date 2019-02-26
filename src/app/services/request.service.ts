import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { config } from '../../environments/environment';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share'
import { Router } from '@angular/router';

@Injectable()
export class RequestService {
  dataCity;
  dataArea;
  dataRegion;
  observableCity;
  observableArea;
  observableRegion;

  constructor(private http: HttpClient, private router: Router) {
  }

  public getCompanyLists(page): Observable<any> {
    return this.http.get(`${config.itApi}/company/`, { responseType: 'json' });

  }
  public getCandidateLists(page): Observable<any> {
    return this.http.get(`${config.itApi}/candidate/`, { responseType: 'json' });
  }

  public collectDashboard(): Observable<any> {
    return this.http.get(`${config.itApi}/dashboard/?ref=collect`, { responseType: 'json' });
  }

  public collectNotice(): Observable<any> {
    return this.http.get(`${config.itApi}/dashboard/?ref=notice`, { responseType: 'json' });
  }

  public collectHeader(): Observable<any> {
    return this.http.get(`${config.itApi}/dashboard/?ref=header`, { responseType: 'json' });
  }

  public collectTaxonomies(): Observable<any> {
    return this.http.get(`${config.wpApi}/taxonomies`, { responseType: 'json'});
  }

  getCategorie(): Observable<any> {
    return this.http.get(`${config.wpApi}/categorie`, { responseType: 'json'});
  }

  getTown(): Observable<any> {
    if (this.dataCity) {
      return Observable.of(this.dataCity);
    } else if (this.observableCity) {
      return this.observableCity;
    } else {
      this.observableCity = this.http.get(`${config.itApi}/taxonomies/city`, {
        observe: 'response'
      })
      .map(response =>  {
        this.observableCity = null;
        if (response.status === 400) {
          return 'Request failed.';
        } else if (response.status === 200) {
          this.dataCity = response.body;
          return this.dataCity;
        }
      })
      .share();
      return this.observableCity;
    }
  }

  getRegion(): Observable<any> {
    if (this.dataRegion) {
      return Observable.of(this.dataRegion);
    } else if (this.observableRegion) {
      return this.observableRegion;
    } else {
      this.observableRegion = this.http.get(`${config.itApi}/taxonomies/region`, {
        observe: 'response'
      })
      .map(response =>  {
        this.observableRegion = null;
        if (response.status === 400) {
          return 'Request failed.';
        } else if (response.status === 200) {
          this.dataRegion = response.body;
          return this.dataRegion;
        }
      })
      .share();
      return this.observableRegion;
    }
  }

  getArea(): Observable<any> {
    if (this.dataArea) {
      return Observable.of(this.dataArea);
    } else if (this.observableArea) {
      return this.observableArea;
    } else {
      this.observableArea = this.http.get(`${config.itApi}/taxonomies/branch_activity`, {
        observe: 'response'
      })
      .map(response =>  {
        this.observableArea = null;
        if (response.status === 400) {
          return 'Request failed.';
        } else if (response.status === 200) {
          this.dataArea = response.body;
          return this.dataArea;
        }
      })
      .share();
      return this.observableArea;
    }
  }

  public getHttpOptions(): any {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${currentUser.token}`
      })
    };
    return httpOptions;
  }

}
