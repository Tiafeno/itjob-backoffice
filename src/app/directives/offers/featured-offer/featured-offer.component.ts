import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import * as moment from 'moment';
import { dateTimePickerFr, config } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
declare var $:any;

@Component({
  selector: 'app-featured-offer',
  templateUrl: './featured-offer.component.html',
  styleUrls: ['./featured-offer.component.css']
})
export class FeaturedOfferComponent implements OnInit, AfterViewInit {
  private postId: number = 0;
  public position: number;
  public dateLimit: any = "";
  public currentPosition: number;
  public loading: boolean = false;
  public warning: boolean = false

  @Output() refresh = new EventEmitter();

  constructor(
    private Http: HttpClient,
    private auth: AuthService
  ) { }

  public open(offer: any): void {
    this.position = offer._featured;
    this.currentPosition = offer._featured;
    if (this.currentPosition && !_.isNull(offer._featuredDateLimit)) {
      this.dateLimit = moment(offer._featuredDateLimit).format('YYYY-MM-DD HH:mm:ss')
    }
    this.postId = offer.ID;
    $('#edit-featured-offer-modal').modal('show');

  }

  public onUpdate(): boolean {
    if (!this.auth.notUserAccess("contributor")) return;
    if (!this.auth.notUserAccess("editor")) return;

    if (this.position === this.currentPosition && this.position === 0) {
      this.warning = true;
      return false;
    }
      this.loading = true;
      let dateUnix = moment(this.dateLimit).utcOffset('+0300').unix();
      let changePosition = this.Http.get(`${config.itApi}/offer/${this.postId}?ref=featured&val=${this.position}&datelimit=${dateUnix}`, { responseType: 'json' });
      changePosition.subscribe(response => {
        let resp: any = response;
        this.loading = false;
        if (resp.success) {
          $('#edit-featured-offer-modal').modal('hide');
          this.refresh.emit();
        }
      })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    $('#edit-featured-offer-modal')
      .on('hidden.bs.modal', (e) => {
        this.warning = false;
        this.dateLimit = '';
      })

  }
}
