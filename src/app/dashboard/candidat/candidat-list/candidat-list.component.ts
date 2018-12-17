import { Component, OnInit, AfterViewInit } from '@angular/core';
import { config } from '../../../../environments/environment';
import { CandidateService } from '../../../services/candidate.service';
import { Router } from '@angular/router';

import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
import { _switch } from 'rxjs/operator/switch';
declare var $: any;

@Component({
  selector: 'app-candidat',
  templateUrl: './candidat-list.component.html',
  styleUrls: ['./candidat-list.component.css']
})
export class CandidatListComponent implements OnInit, AfterViewInit {
  public listsCandidat: Array<any>;
  public page: number = 1;
  constructor(public candidateService: CandidateService, private router: Router) { }

  ngOnInit() {
    const component = this;
    let searchs = "";
    let searchPublication = " ";
    let searchStatus = " ";
    let searchKey = " ";
    // Ajouter ici un code pour recuperer les candidats...
    setTimeout(() => {
      moment.locale('fr');
      const candidateLists = $('#orders-table');
      candidateLists
        .on('page.dt', () => {
          let info = table.page.info();
          localStorage.setItem('candidate-page', info.page);
        })
        .on('init.dt', (e, settings, json) => {
          let candidatePage: string = localStorage.getItem('candidate-page');
          let pageNum: number = parseInt(candidatePage);
          if (_.isNumber(pageNum) && !_.isNaN(pageNum)) {
            table.page(pageNum).draw("page");
          }
        });
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
          {
            data: 'isActive', render: (data) => {
              let status = data ? 'Activer' : "Désactiver";
              let style = data ? 'primary' : 'danger';
              return `<span class="badge badge-${style}">${status}</span>`;
            }
          },
          { data: 'reference' },
          {
            data: 'state', render: (data) => {
              let status: string = data === 'publish' ? "Publier" : "En attente";
              return `<span class="badge badge-default">${status}</span>`;
            }
          },
          {
            data: 'branch_activity', render: (data) => {
              if (_.isNull(data) || _.isEmpty(data)) return 'Non renseigner';
              return data.name;
            }
          },
          {
            data: 'dateAdd', render: (data) => {
              return moment(data, 'j F, Y').fromNow();
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
                  <li><button class="btn btn-primary btn-icon-only btn-circle btn-air edit-candidate" data-id="${row.ID}"><i class="la la-edit"></i></button></li>
                  <li><button class="btn btn-pink btn-icon-only btn-circle btn-air status-candidate" data-status="false" data-id="${row.ID}"><i class="la la-eye-slash"></i></button></li>
                  <li><button class="btn btn-blue btn-icon-only btn-circle btn-air status-candidate"  data-status="true" data-id="${row.ID}"><i class="la la-eye"></i></button></li>
                </ul>
              </div>
            `
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

      $('#orders-table tbody')
        .on('click', '.edit-candidate', (e) => {
          e.preventDefault();
          let data = $(e.currentTarget).data();
          component.router.navigate(['/candidate', data.id, 'edit']);
        })
        .on('click', '.status-candidate', (e) => {
          e.preventDefault();
          let trElement = $(e.currentTarget).parents('tr');
          let DATA = table.row(trElement).data();

          let elData = $(e.currentTarget).data();
          let statusChange: boolean = elData.status;
          let candidateId: number = elData.id;
          let confirmButton: string = statusChange ? 'Activer' : 'Désactiver';
          let cancelButton: string = "Annuler";
          if (DATA.activated === statusChange) {
            swal('', `Vous ne pouvez pas ${confirmButton.toLowerCase()} un candidat qui es déjà ${confirmButton.toLowerCase()}.`, 'warning');
            return false;
          }
          swal({
            title: '',
            text: `Vous voulez vraiment ${confirmButton.toLowerCase()} ce candidat?`,
            type: statusChange ? 'warning' : 'error',
            showCancelButton: true,
            confirmButtonText: confirmButton,
            cancelButtonText: cancelButton
          }).then((result) => {
            if (result.value) {
              component.candidateService
                .activated(candidateId, statusChange)
                .subscribe(response => {
                  swal(
                    '',
                    `Candidat ${confirmButton.toLowerCase()} avec succès`,
                    'success'
                  )
                  table.ajax.reload(null, false);
                })
              // For more information about handling dismissals please visit
              // https://sweetalert2.github.io/#handling-dismissals
            } else if (result.dismiss === swal.DismissReason.cancel) {

            }
          })
        })

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
          searchs = `${searchKey}|${searchStatus}|${searchPublication}`;
          table.search(searchs, true, false).draw();
        }
      
    }, 600);
  }


  ngAfterViewInit() {

  }

}
