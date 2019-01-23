import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../environments/environment';

import * as _ from 'lodash';
@Component({
  selector: 'app-activity-area',
  templateUrl: './activity-area.component.html',
  styleUrls: ['./activity-area.component.css']
})
export class ActivityAreaComponent implements OnInit {
  @Output() choosed = new EventEmitter<number>();
  @Input() title: string;
  public Area: string = '0';
  public branchActivitys: any;
  public loading: boolean = false;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get(`${config.itApi}/taxonomies/branch_activity`, { responseType: 'json' })
      .subscribe(response => {
        this.branchActivitys = _.cloneDeep(response);
        this.loading = false;
      });
  }

  onChoose(areaId: string) {
    let id:number = parseInt(areaId);
    this.choosed.emit(id);
  }

}
