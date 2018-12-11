import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RequestService } from '../../services/request.service';

import * as _ from 'lodash';
import { config } from '../../../environments/environment';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-candidat',
  templateUrl: './candidat-list.component.html',
  styleUrls: ['./candidat-list.component.css']
})
export class CandidatListComponent implements OnInit, AfterViewInit {
  public listsCandidat: Array<any>;
  public page: number = 1;
  constructor(public requestService: RequestService, private router: Router) {
  }

  ngOnInit() {
    const component = this;
    // Ajouter ici un code pour recuperer les candidats...
    setTimeout(() => {
      const candidateLists = $('#orders-table');
      const table = candidateLists.DataTable({
        pageLength: 20,
        fixedHeader: true,
        responsive: false,
        "sDom": 'rtip',
        processing: true,
        page: 2,
        serverSide: true,
        columns: [
          { data: 'ID' },
          { data: 'reference' },
          {
            data: 'jobSought', render: (data, type, row, meta) => {
              if (_.isEmpty(data) || _.isNull(data)) return '';
              if (_.isArray(data)) {
                let jobs = _.map(data, 'name');
                return _.join(jobs, ', ');
              } else {
                return data.name;
              }
            }
          },
          { data: 'state', render: (data) => `<span class="badge badge-info badge-pill">${data}</span>` },
          {
            data: 'branch_activity', render: (data) => {
              if (_.isNull(data) || _.isEmpty(data)) return 'Non renseigner';
              return data.name;
            }
          },
          { data: 'jobNotif', render: (data) => { return data ? 'Oui' : 'Non'; } },
          { data: 'trainingNotif', render: (data) => { return data ? 'Oui' : 'Non'; } },
          {
            data: null,
            render: (data, type, row, meta) => `<span class="text-light mr-3 font-16" data-id="${row.ID}"><i class="ti-pencil"></i></span>`
          }
        ],
        initComplete: (setting, json) => {

        },
        ajax: {
          url: `${config.itApi}/candidate/`,
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

      candidateLists
        .on('page.dt', () => {
          let info = table.page.info();
          localStorage.setItem('candidate-page', info.page);
        })
        .on('init.dt', (e, settings, json) => {
          let candidatePage = localStorage.getItem('candidate-page');
          if (!_.isNull(candidateLists)) {
            table.page(parseInt(candidatePage)).draw("page");
          }
        })

      $('#orders-table tbody').on('click', 'span', (e) => {
        e.preventDefault();
        let Element = e.currentTarget;
        let data = $(Element).data();
        component.router.navigate(['/candidate', data.id, 'edit']);
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


  ngAfterViewInit() {

  }

}
