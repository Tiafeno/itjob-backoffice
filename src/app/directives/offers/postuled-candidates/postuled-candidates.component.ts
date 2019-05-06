import {Component, OnInit, Input, AfterViewInit} from '@angular/core';
import {OfferService} from '../../../services/offer.service';

import * as _ from 'lodash';
import swal from 'sweetalert2';
import {AuthService} from '../../../services/auth.service';

declare var $: any;

@Component({
  selector: 'app-postuled-candidates',
  templateUrl: './postuled-candidates.component.html',
  styleUrls: ['./postuled-candidates.component.css']
})
export class PostuledCandidatesComponent implements OnInit, AfterViewInit {
  @Input('offerid') offerId: number;
  public loading: boolean = false;
  public Requests: Array<any> = [];

  constructor(
    private auth: AuthService,
    private offerService: OfferService
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.offerService.getRequest(this.offerId)
      .subscribe(response => {
        this.Requests = response && _.isArray(response) ? _.cloneDeep(response) : [];
        this.loading = false;
        setTimeout(() => {
          $('.scroller').each(function () {
            $(this).slimScroll({
              height: $(this).attr('data-height') || '100%',
              color: $(this).attr('data-color') || '#71808f',
              railOpacity: '0.9',
              size: '4px',
            });
          });
        }, 1500);

      });
  }

  ngAfterViewInit() {

  }

  public onValidate(idRequest: number, event: any) {
    if (!this.auth.notUserAccess("contributor")) return;
    if (!this.auth.notUserAccess("editor")) return;

    let el = event.target;
    swal({
      title: '',
      text: "Voulez vous vraiment valider ce candidat?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler"
    }).then(result => {
      if (result.value) {
        el.textContent = "Chargement...";
        this.offerService.updateRequest(this.offerId, idRequest, 'validated')
          .subscribe(response => {
            this.Requests = response && _.isArray(response) ? _.cloneDeep(response) : [];
          });
      }
    });
  }

  public onReject(idRequest: number, event: any) {
    if (!this.auth.notUserAccess("contributor")) return;
    if (!this.auth.notUserAccess("editor")) return;

    let el = event.target;
    swal({
      title: '',
      text: "Voulez vous vraiment rejeter ce candidat?",
      type: 'info',
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler"
    }).then(result => {
      if (result.value) {
        el.textContent = "Chargement...";
        this.offerService.updateRequest(this.offerId, idRequest, 'reject')
          .subscribe(response => {
            this.Requests = response && _.isArray(response) ? _.cloneDeep(response) : [];
          });
      }
    });
  }

}
