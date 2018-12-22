import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import swal from 'sweetalert2';
import { config } from '../../../../environments/environment';
import * as moment from 'moment';
import { OfferService } from '../../../services/offer.service';
import { Helpers } from '../../../helpers';
declare var $: any;
@Component({
  selector: 'app-offer-lists',
  templateUrl: './offer-lists.component.html',
  styleUrls: ['./offer-lists.component.css'],
})
export class OfferListsComponent implements OnInit {
  public listsOffers: Array<any> = [];
  public Helper: any;
  private table: any;
  public sStatus: string = "";
  public sKey: string = "";
  public sActivityArea: number = 0;
  public sDate: string = "";
  constructor(
    private router: Router,
    private offerService: OfferService
  ) {
    this.Helper = Helpers
  }

  onChoosed(areaId: number) {
    this.sActivityArea = areaId;
    this.createSearch();
  }

  public resetFilterSearch() {
    $('.page-content').find('input').val('');
    $('.page-content').find('select:not("#activity_area_search")').val('');
    $('.page-content').find('.selectpicker').selectpicker("refresh");
    this.table.search("", true, false).draw();
  }

  public createSearch() {
    let searchs: string = `${this.sKey}|${this.sStatus}|${this.sActivityArea}|${this.sDate}`;
    this.table.search(searchs, true, false).draw();
  }

  ngOnInit() {
    moment.locale('fr');
    const component = this;
    // Ajouter ici un code pour recuperer les candidats...
    const offerLists = $('#orders-table');
    offerLists
      .on('page.dt', () => {
        let info = component.table.page.info();
        localStorage.setItem('offer-page', info.page);
      })
      .on('init.dt', (e, settings, json) => {
        setTimeout(() => {
          let offerPage: string = localStorage.getItem('offer-page');
          let pageNum: number = parseInt(offerPage);
          if (_.isNumber(pageNum) && !_.isNaN(pageNum)) {
            component.table.page(pageNum).draw("page");
            component.table.ajax.reload(null, false);
          }
        }, 600);
      }).on('xhr.dt', function (e, settings, json, xhr) {
        console.log(json);
        component.Helper.setLoading(false);
        // Note no return - manipulate the data directly in the JSON object.
      });

    component.table = offerLists.DataTable({
      pageLength: 20,
      page: 1,
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
            let status = data && row.offer_status === 'publish' ? 'Publier' : (row.offer_status === 'pending' ? "En attente" : "Désactiver");
            let style = data && row.offer_status === 'publish' ? 'primary' : (row.offer_status === 'pending' ? "warning" : "danger");
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
          component.Helper.setLoading(true);
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
        let DATA = component.table.row(trElement).data();

        let Element = e.currentTarget;
        let data = $(Element).data();
        let statusChange: boolean = data.status;
        let offerId: number = data.id;
        let confirmButton: string = statusChange ? 'Activer' : 'Désactiver';
        let cancelButton: string = "Annuler";
        if (DATA.activated === statusChange && DATA.offer_status === 'publish') {
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
                component.table.ajax.reload(null, false);
              })
            // For more information about handling dismissals please visit
            // https://sweetalert2.github.io/#handling-dismissals
          } else if (result.dismiss === swal.DismissReason.cancel) {

          }
        })
      });

    $('#key-search').on('keypress', function (event) {
      component.sKey = this.value;
      if (event.which === 13) {
        component.createSearch();
      }
    });

    $("#type-status").on('change', function (event) {
      component.sStatus = this.value;
      component.createSearch();
    });

    $('#daterange')
      .daterangepicker({
        locale: {
          format: 'DD/MM/YYYY',
          "applyLabel": "Confirmer",
          "cancelLabel": "Annuler",
          "fromLabel": "De",
          "toLabel": "A",
          "customRangeLabel": "Aléatoire",
          "daysOfWeek": [
            "Dim",
            "Lun",
            "Mar",
            "Mer",
            "Jeu",
            "Ven",
            "San"
          ],
          "monthNames": [
            "Janvier",
            "Février",
            "Mars",
            "Avril",
            "Mai",
            "Juin",
            "Juillet",
            "Août",
            "Septembre",
            "Octobre",
            "Novembre",
            "Décembre"
          ],
          "firstDay": 1
        }
      })
      .on('apply.daterangepicker', function (ev, picker) {
        let startDate = picker.startDate.format('YYYY-MM-DD');
        let endDate = picker.endDate.format('YYYY-MM-DD');
        component.sDate = `${startDate}x${endDate}`;
        component.createSearch();
      })
      .on('cancel.daterangepicker', function (ev, picker) {
        $('#daterange').val('');
        component.sDate = '';
        component.createSearch();
      });
  }

}
