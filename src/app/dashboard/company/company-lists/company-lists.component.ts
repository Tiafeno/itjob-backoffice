import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import swal from 'sweetalert2';
import { config } from '../../../../environments/environment';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-company-lists',
  templateUrl: './company-lists.component.html',
  styleUrls: ['./company-lists.component.css']
})
export class CompanyListsComponent implements OnInit {

  constructor(
    private router: Router,
    private companyService: CompanyService
  ) { }

  ngOnInit() {
    moment.locale('fr');
    const component = this;
    let searchs:string = "";
    let searchEtat:string = " ";
    let searchStatus:string = " ";
    let searchKey:string = " ";
    let searchAccount:string = " ";
    // Ajouter ici un code pour recuperer les candidats...
    setTimeout(() => {
      const companyLists = $('#orders-table');
      companyLists
        .on('page.dt', () => {
          let info = table.page.info();
          localStorage.setItem('company-page', info.page);
        })
        .on('init.dt', (e, settings, json) => {
          setTimeout(() => {
            let page: string = localStorage.getItem('company-page');
            let pageNum: number = parseInt(page);
            if (_.isNumber(pageNum) && !_.isNaN(pageNum)) {
              table.page(pageNum).draw("page");
            }
          }, 800);
        });

      const table = companyLists.DataTable({
        pageLength: 20,
        page: 0,
        fixedHeader: true,
        responsive: false,
        "sDom": 'rtip',
        processing: true,
        serverSide: true,
        columns: [
          { data: 'ID' },
          { data: 'title', render: (data, type, row, meta) => data },
          {
            data: 'account', render: data => {
              let status: string = data === 1 ? "Premium" : (data === 2 ? "En attente" :"Standard");
              let style: string = data === 1 ? 'success' :  (data === 2 ? "pink" :"default")
              return `<span class="badge badge-${style}">${status}</span>`
            }
          },
          { data: 'add_create', render: (data) => { return moment(data).fromNow(); } },
          {
            data: 'isActive', render: (data, type, row, meta) => {
              let status = data && row.post_status === 'publish' ? 'Publier' : (row.post_status === 'pending' ? "En attente" : "Désactiver");
              let style = data && row.post_status === 'publish' ? 'primary' :  (row.post_status === 'pending' ? "warning" : "danger");
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
            data: 'region', render: (data) => {
              if (_.isNull(data) || _.isEmpty(data)) return 'Non renseigner';
              return data.name;
            }
          },
        ],
        initComplete: (setting, json) => {

        },
        ajax: {
          url: `${config.itApi}/company/`,
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

      $('#key-search').on('keypress', function (event) {
        if (event.which === 13) {
          searchKey = this.value;
          createSearch();
        }
      });

      $("#type-etat").on('change', function (event) {
        searchEtat = this.value;
        createSearch();
      });

      $("#type-status").on('change', function (event) {
        searchStatus = this.value;
        createSearch();
      });

      $("#type-account").on('change', function (event) {
        searchAccount = this.value;
        createSearch();
      });

      function createSearch() {
        searchs = `${searchKey}|${searchStatus}|${searchAccount}`;
        table.search(searchs, true, false).draw();
      }
    }, 600);

  }

}
