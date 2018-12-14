import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OfferService } from '../../../services/offer.service';
import { Helpers } from '../../../helpers';
import * as _ from 'lodash';
declare var $: any;
@Component({
  selector: 'app-offer-edit',
  templateUrl: './offer-edit.component.html',
  styleUrls: ['./offer-edit.component.css']
})
export class OfferEditComponent implements OnInit {
  private ID;
  public loadingForm: boolean = false;
  public Offer: Object = {};
  public Editor: any = {};
  constructor( private route: ActivatedRoute, private offerServices: OfferService) { }

  ngOnInit() {
    Helpers.setLoading(true);
    this.loadingForm = true;
    this.route.parent.params.subscribe(params => {
      this.ID = params.id;
      this.offerServices
        .getOffer(this.ID)
        .subscribe(offer => {
          this.Offer = _.clone(offer);
          this.loadForm();
          Helpers.setLoading(false);
        });
    });
  }

  loadForm() {
    this.Editor = _.clone(this.Offer);
    this.Editor.contractType = !_.isNull(this.Editor.contractType) && !_.isEmpty(this.Editor.contractType) ? this.Editor.contractType.value : '';
  }

}
