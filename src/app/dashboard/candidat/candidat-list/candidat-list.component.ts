import { Component, OnInit, AfterViewInit } from '@angular/core';
import { config } from '../../../../environments/environment';
import { CandidateService } from '../../../services/candidate.service';
import { Router } from '@angular/router';

import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Helpers } from '../../../helpers';
declare var $: any;

@Component({
  selector: 'app-candidat',
  templateUrl: './candidat-list.component.html',
  styleUrls: ['./candidat-list.component.css']
})
export class CandidatListComponent implements OnInit, AfterViewInit {
  public listsCandidat: Array<any>;
  public page: number = 1;
  public Helper: any;
  private table: any;
  public sStatus: string = "";
  public sKey: string = "";
  public sActivityArea: number = 0;
  public sDate: string = "";
  constructor(
    public candidateService: CandidateService,
    private router: Router
  ) {
    this.Helper = Helpers
  }

  onChoosed(areaId: number) {
    this.sActivityArea = areaId;
    this.createSearch();
  }

  public createSearch() {
    let searchs: string = `${this.sKey}|${this.sStatus}|${this.sActivityArea}|${this.sDate}`;
    this.table.search(searchs, true, false).draw();
  }

  public resetFilterSearch() {
    $('.page-content').find('input').val('');
    $('.page-content').find('select:not("#activity_area_search")').val('');
    $('.page-content').find('.selectpicker').selectpicker("refresh");
    this.table.search("", true, false).draw();
  }

  ngOnInit() {
    const component = this;
    // Ajouter ici un code pou
    moment.locale('fr');
    const candidateLists = $('#orders-table');
    candidateLists
      .on('page.dt', () => {
        let info = component.table.page.info();
        localStorage.setItem('candidate-page', info.page);
      })
      .on('init.dt', (e, settings, json) => {
        setTimeout(() => {
          let candidatePage: string = localStorage.getItem('candidate-page');
          let pageNum: number = parseInt(candidatePage);
          if (_.isNumber(pageNum) && !_.isNaN(pageNum)) {
            component.table.page(pageNum).draw('page');
            component.table.ajax.reload(null, false);
          }
        }, 600);
        
      })
      .on('xhr.dt', function (e, settings, json, xhr) {
        component.Helper.setLoading(false);
        // Note no return - manipulate the data directly in the JSON object.
      });
    component.table = candidateLists
      .DataTable({
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
            data: 'isActive', render: (data, type, row) => {
              let status = data && row.state === 'publish' ? 'Publier' : (row.state === 'pending' ? "En attente" : "Désactiver");
              let style = data && row.state === 'publish' ? 'primary' : (row.state === 'pending' ? "warning" : "danger");
              return `<span class="badge badge-${style}">${status}</span>`;
            }
          },
          { data: 'reference' },
          {
            data: 'branch_activity', render: (data) => {
              if (_.isNull(data) || _.isEmpty(data)) return 'Non renseigner';
              return data.name;
            }
          },
          {
            data: 'date_create', render: (data) => {
              return moment(data).fromNow();
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
      .on('click', '.edit-candidate', (e) => {
        e.preventDefault();
        let data = $(e.currentTarget).data();
        component.router.navigate(['/candidate', data.id, 'edit']);
      })
      .on('click', '.status-candidate', (e) => {
        e.preventDefault();
        let trElement = $(e.currentTarget).parents('tr');
        let DATA = component.table.row(trElement).data();

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
                component.table.ajax.reload(null, false);
              })
            // For more information about handling dismissals please visit
            // https://sweetalert2.github.io/#handling-dismissals
          } else if (result.dismiss === swal.DismissReason.cancel) {

          }
        })
      })

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


  ngAfterViewInit() {

  }

}
