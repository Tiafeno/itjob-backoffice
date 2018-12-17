import { Component, OnInit, Input } from '@angular/core';
import { OfferService } from '../../../services/offer.service';

import * as _ from 'lodash';
import swal from 'sweetalert2';
@Component({
  selector: 'app-postuled-candidates',
  templateUrl: './postuled-candidates.component.html',
  styleUrls: ['./postuled-candidates.component.css']
})
export class PostuledCandidatesComponent implements OnInit {
  @Input('offerid') offerId: number;
  public Requests: any;
  constructor(
    private offerService: OfferService
  ) { }

  ngOnInit() {
    this.offerService.getRequest(this.offerId)
    .subscribe(response => {
      this.Requests = _.cloneDeep(response);
    });
  }

  public onValidate(idRequest: number, event: any){
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
          this.Requests = _.cloneDeep(response);
        })
      }
    })
  }

  public onReject(idRequest: number, event: any) {
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
          this.Requests = _.cloneDeep(response);
        })
      }
    })
  }

}
