import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as WPAPI from 'wpapi';
import { dateTimePickerFr, config } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
declare var $:any;

@Component({
  selector: 'app-featured-offer',
  templateUrl: './featured-offer.component.html',
  styleUrls: ['./featured-offer.component.css']
})
export class FeaturedOfferComponent implements OnInit, AfterViewInit {
  private WPEndpoint = null;
  private postId: number = 0;
  public position: number = 0;
  public dateLimit: any = "";
  public currentPosition: number;
  public loading: boolean = false;
  public warning: boolean = false

  @Output() refresh = new EventEmitter();

  constructor(
    private Http: HttpClient,
    private auth: AuthService
  ) {
    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    let currentUser = this.auth.getCurrentUser();
    this.WPEndpoint.setHeaders({Authorization: `Bearer ${currentUser.token}`});
    var namespace = 'wp/v2'; // use the WP API namespace
    var route = '/offers/(?P<id>\\d+)'; // route string - allows optional ID parameter
    this.WPEndpoint.offer = this.WPEndpoint.registerRoute(namespace, route);
  }

  public open(offer: any): void {
    this.position = _.isNull(offer.featuredPosition) ? 0 : offer.featuredPosition;
    this.currentPosition = offer.featuredPosition;
    if (this.currentPosition && !_.isNull(offer.featuredDateLimit)) {
      this.dateLimit = moment(offer.featuredDateLimit).format('YYYY-MM-DD HH:mm:ss')
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
      let date = moment(this.dateLimit).utcOffset('+0300').format("YYYY-MM-DD HH:mm:ss");
      this.WPEndpoint.offer().id(this.postId).update({
        itjob_offer_featured: this.position ? 1 : 0,
        itjob_offer_featured_position: this.position ? this.position : null,
        itjob_offer_featured_datelimit: date,
      }).then(offer => {
        this.loading = false;
        $('#edit-featured-offer-modal').modal('hide');
        this.refresh.emit();
      });
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
