import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../services/request.service';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { config } from '../../../../environments/environment';
import moment = require('moment');
declare var $: any;
@Component({
  selector: 'app-offer-lists',
  templateUrl: './offer-lists.component.html',
  styleUrls: ['./offer-lists.component.css'],
})
export class OfferListsComponent implements OnInit {
  public listsOffers: Array<any> = [];
  constructor(public requestService: RequestService, private router: Router) { }

  ngOnInit() {
    moment.locale('fr');
    const component = this;
    // Ajouter ici un code pour recuperer les candidats...
    setTimeout(() => {
      const offerLists = $('#orders-table');
      const table = offerLists.DataTable({
        pageLength: 20,
        fixedHeader: true,
        responsive: false,
        "sDom": 'rtip',
        processing: true,
        serverSide: true,
        columns: [
          { data: 'ID' },
          { data: 'reference' },
          { data: 'postPromote', render: (data, type, row, meta) => data },
          { data: 'dateLimit', render: (data) => { return moment(data).fromNow(); } },
          { data: 'activated', render: (data) => `<span class="badge badge-info badge-pill">${data}</span>` },
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
                  <li><button class="btn btn-pink btn-icon-only btn-circle btn-air "><i class="la la-eye-slash"></i></button></li>
                  <li><button class="btn btn-blue btn-icon-only btn-circle btn-air " ><i class="la la-eye"></i></button></li>
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

      offerLists
        .on('page.dt', () => {
          let info = table.page.info();
          localStorage.setItem('offer-page', info.page);
        })
        .on('init.dt', (e, settings, json) => {
          let offerPage = localStorage.getItem('offer-page');
          if (!_.isNull(offerPage) && !_.isEmpty(offerPage)) {
            table.page(parseInt(offerPage)).draw("page");
          }
        })

      $('#orders-table tbody').on('click', '.edit-offer', (e) => {
        e.preventDefault();
        let Element = e.currentTarget;
        let data = $(Element).data();
        component.router.navigate(['/offer', parseInt(data.id)]);
      });

      $('#key-search').on('keypress', function (event) {
        if (event.which === 13)
          table.search(this.value).draw();
      });

      $('#type-filter').on('change', function () {
        table.column(4).search($(this).val()).draw();
      });
    }, 600);
  }

}
