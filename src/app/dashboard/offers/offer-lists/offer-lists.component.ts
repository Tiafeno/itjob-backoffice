import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import swal from 'sweetalert2';
import { config } from '../../../../environments/environment';
import * as moment from 'moment';
import { OfferService } from '../../../services/offer.service';
declare var $: any;
@Component({
  selector: 'app-offer-lists',
  templateUrl: './offer-lists.component.html',
  styleUrls: ['./offer-lists.component.css'],
})
export class OfferListsComponent implements OnInit {
  public listsOffers: Array<any> = [];
  constructor(
    private router: Router,
    private offerService: OfferService
  ) { }

  ngOnInit() {
    moment.locale('fr');
    const component = this;
    let searchs = "";
    let searchPublication = " ";
    let searchStatus = " ";
    let searchKey = " ";
    // Ajouter ici un code pour recuperer les candidats...
    setTimeout(() => {
      const offerLists = $('#orders-table');
      offerLists
        .on('page.dt', () => {
          let info = table.page.info();
          localStorage.setItem('offer-page', info.page);
        })
        .on('init.dt', (e, settings, json) => {
          setTimeout(() => {
            let offerPage: string = localStorage.getItem('offer-page');
            let pageNum: number = parseInt(offerPage);
            if (_.isNumber(pageNum) && !_.isNaN(pageNum)) {
              table.page(pageNum).draw("page");
            }
          }, 800);
        });

      const table = offerLists.DataTable({
        pageLength: 20,
        page: 0,
        fixedHeader: true,
        responsive: false,
        "sDom": 'rtip',
        processing: true,
        serverSide: true,
        columns: [
          { data: 'ID' },
          { data: 'postPromote', render: (data, type, row, meta) => data },
          { data: 'reference' },
          { data: 'dateLimit', render: (data) => { return moment(data).fromNow(); } },
          {
            data: 'activated', render: (data, type, row) => {
              let status = data && row.offer_status === 'publish' ? 'Publier' : row.offer_status === 'pending'  ? "En attente" : "Désactiver";
              let style = data && row.offer_status === 'publish'? 'primary' :  row.offer_status === 'pending' ? "warning" : "danger";
              return `<span class="badge badge-${style}">${status}</span>`;
            }
          },
          {
            data: 'branch_activity', render: (data) => {
              if (_.isNull(data) || _.isEmpty(data)) return 'Non renseigner';
              return data.name;
            }
          },
          {
            data: 'contractType', render: (data) => {
              if (!_.isObject(data)) return "Non renseigner";
              return data.label;
            }
          },
          {
            data: 'region', render: (data) => {
              if (_.isNull(data) || _.isEmpty(data)) return 'Non renseigner';
              return data.name;
            }
          },
          {
            data: null,
            render: (data, type, row, meta) => `
              <div class="fab fab-left">
                <button class="btn btn-sm btn-primary btn-icon-only btn-circle btn-air" data-toggle="button">
                  <i class="fab-icon la la-bars"></i>
                  <i class="fab-icon-active la la-close"></i>
                </button>
                <ul class="fab-menu">
                  <li><button class="btn btn-primary btn-icon-only btn-circle btn-air edit-offer" data-id="${row.ID}"><i class="la la-edit"></i></button></li>
                  <li><button class="btn btn-pink btn-icon-only btn-circle btn-air status-offer" data-status="false" data-id="${row.ID}"><i class="la la-eye-slash"></i></button></li>
                  <li><button class="btn btn-blue btn-icon-only btn-circle btn-air status-offer" data-status="true" data-id="${row.ID}" ><i class="la la-eye"></i></button></li>
                </ul>
              </div>
            `
          }
        ],
        initComplete: (setting, json) => {

        },
        ajax: {
          url: `${config.itApi}/offers/`,
          dataType: 'json',
          data: {
            //columns: false,
            order: false,
          },
          type: 'POST',
          beforeSend: function (xhr) {
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.token) {
              xhr.setRequestHeader("Authorization",
                `Bearer ${currentUser.token}`);
            }
          }
        }

      });


      $('#orders-table tbody')
        .on('click', '.edit-offer', (e) => {
          e.preventDefault();
          let data = $(e.currentTarget).data();
          component.router.navigate(['/offer', parseInt(data.id)]);
        })
        .on('click', '.status-offer', (e) => {
          e.preventDefault();
          let El = e.currentTarget;
          let trElement = $(El).parents('tr');
          let DATA = table.row(trElement).data();

          let Element = e.currentTarget;
          let data = $(Element).data();
          let statusChange: boolean = data.status;
          let offerId: number = data.id;
          let confirmButton: string = statusChange ? 'Activer' : 'Désactiver';
          let cancelButton: string = "Annuler";
          if (DATA.activated === statusChange) {
            swal('', `Vous ne pouvez pas ${confirmButton.toLowerCase()} une offre qui es déja ${confirmButton.toLowerCase()}.`, 'warning');
            return false;
          }
          swal({
            title: '',
            text: `Vous voulez vraiment ${confirmButton.toLowerCase()} cette offre?`,
            type: statusChange ? 'warning' : 'error',
            showCancelButton: true,
            confirmButtonText: confirmButton,
            cancelButtonText: cancelButton
          }).then((result) => {
            if (result.value) {
              component.offerService
                .activated(offerId, statusChange)
                .subscribe(response => {
                  swal(
                    '',
                    'Offre mis à jour avec succès',
                    'success'
                  )
                  table.ajax.reload(null, false);
                })
              // For more information about handling dismissals please visit
              // https://sweetalert2.github.io/#handling-dismissals
            } else if (result.dismiss === swal.DismissReason.cancel) {

            }
          })
        });

      $('#key-search').on('keypress', function (event) {
        if (event.which === 13) {
          searchKey = this.value;
          createSearch();
        }
      });

      $("#type-publication").on('change', function(event) {
        searchPublication = this.value;
        createSearch();
      });

      $("#type-status").on('change', function(event) {
        searchStatus = this.value;
        createSearch();
      });

      function createSearch() {
        searchs = `${searchKey}|${searchStatus}`;
        table.search(searchs, true, false).draw();
      }
    }, 600);
  }

}
