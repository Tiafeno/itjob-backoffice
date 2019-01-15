import { Component, OnInit, Output, AfterViewInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as _ from 'lodash';
import { config } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-rate-plan',
  templateUrl: './rate-plan.component.html',
  styleUrls: ['./rate-plan.component.css']
})
export class RatePlanComponent implements OnInit, AfterViewInit {
  public offerId: number = 0;
  public type: string = '';
  public currentType: string = '';
  public warning: boolean = false;
  public loading:boolean = false;

  @Output() private refresh = new EventEmitter();

  constructor(
    private auth: AuthService,
    private Http: HttpClient
  ) { }

  public onOpen(offerId: number, type: any) {
    this.type = _.clone(type);
    this.currentType = _.clone(type);
    this.offerId = _.clone(offerId);
    $('#edit-rateplan-changer-modal').modal('show');
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    $('#edit-rateplan-changer-modal')
      .on('hidden.bs.modal', (e) => {
        this.warning = false;
      })
  }

  public onUpdate(): any {
    if (!this.auth.notUserAccess("contributor")) return;
    if (!this.auth.notUserAccess("editor")) return;

    let typeOfValues = ['standard', 'sereine', 'premium'];
    if (this.type === this.currentType) {
      this.warning = true;
      return false;
    }
    if (!_.isEmpty(this.type) && _.indexOf(typeOfValues, this.type) > -1) {
      this.loading = true;
      let changeRatePlan = this.Http.get(`${config.itApi}/offer/${this.offerId}?ref=rateplan&val=${this.type}`, { responseType: 'json' });
      changeRatePlan.subscribe(response => {
        let resp: any = response;
        this.loading = false;
        if (resp.success) {
          $('#edit-rateplan-changer-modal').modal('hide');
          this.refresh.emit();
        }
      })
    }
  }

}
