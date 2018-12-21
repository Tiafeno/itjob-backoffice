import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import swal from 'sweetalert';
import { config } from '../../../../environments/environment';
import * as moment from 'moment';
import { SwitcherComponent } from '../../../directives/account/switcher/switcher.component';
import { CompanyEditComponent } from '../company-edit/company-edit.component';
declare var $: any;
@Component({
  selector: 'app-company-lists',
  templateUrl: './company-lists.component.html',
  styleUrls: ['./company-lists.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CompanyListsComponent implements OnInit {
  public sStatus: string = "";
  public sAccount: string = "";
  public sKey: string = "";
  public sDate: string = "";
  public sActivityArea: number = 0;
  public TABLE: any;

  @ViewChild(SwitcherComponent) private switcher: SwitcherComponent;
  @ViewChild(CompanyEditComponent) private companyEdit: CompanyEditComponent

  constructor(
    private companyService: CompanyService
  ) { }

  onChoosed(areaId: number) {
    this.sActivityArea = areaId;
    this.createSearch();
  }

  public createSearch() {
    let searchs: string = `${this.sAccount}|${this.sActivityArea}|${this.sStatus}|${this.sDate}|${this.sKey}`;
    this.TABLE.search(searchs, true, false).draw();
  }

  public resetFilterSearch() {
    $('.page-content').find('input').val('');
    $('.page-content').find('select:not("#activity_area_search")').val('');
    $('.page-content').find('.selectpicker').selectpicker("refresh");
    this.TABLE.search("", true, false).draw();
  }

  public reloadDatatable(): void {
    this.TABLE.ajax.reload(null, false);
  }

  ngOnInit() {
    moment.locale('fr');
    const component = this;
    // Ajouter ici un code pour recuperer les candidats...
    setTimeout(() => {
      const companyLists = $('#orders-table');
      companyLists
        .on('page.dt', () => {
          let info = component.TABLE.page.info();
          localStorage.setItem('company-page', info.page);
        })
        .on('init.dt', (e, settings, json) => {
          setTimeout(() => {
            let page: string = localStorage.getItem('company-page');
            let pageNum: number = parseInt(page);
            if (_.isNumber(pageNum) && !_.isNaN(pageNum)) {
              component.TABLE.page(pageNum).draw("page");
            }
          }, 600);
        });

      component.TABLE = companyLists.DataTable({
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
            data: 'account', render: (data, type, row) => {
              let status: string = data === 1 ? "Premium" : (data === 2 ? "En attente" : "Standard");
              let style: string = data === 1 ? 'success' : (data === 2 ? "pink" : "default")
              return `<span data-id="${row.ID}" class="badge update-account badge-${style}">${status}</span>`
            }
          },
          { data: 'add_create', render: (data) => { return moment(data).fromNow(); } },
          {
            data: 'isActive', render: (data, type, row, meta) => {
              let status = data && row.post_status === 'publish' ? 'Publier' : (row.post_status === 'pending' ? "En attente" : "Désactiver");
              let style = data && row.post_status === 'publish' ? 'primary' : (row.post_status === 'pending' ? "warning" : "danger");
              return `<span data-id="${row.ID}" class="badge edit-status badge-${style}">${status}</span>`;
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
          {
            data: null,
            render: (data, type, row) => {
              return `<span data-id='${row.ID}' class='edit-company badge badge-blue'>Modifier</span>`;
            }
          }
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
          component.sKey = this.value;
          component.createSearch();
        }
      });

      $("#type-status").on('change', function (event) {
        component.sStatus = this.value;
        component.createSearch();
      });

      $("#type-account").on('change', function (event) {
        component.sAccount = this.value;
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

      $('#orders-table tbody')
        .on('click', '.edit-company', (e) => {
          e.preventDefault();
          let el = $(e.currentTarget).parents('tr');
          let DATA = component.TABLE.row(el).data();
          component.companyEdit.onOpen(DATA);
        })
        .on('click', '.edit-status', (e) => {
          e.preventDefault();
          let el = $(e.currentTarget).parents('tr');
          let DATA = component.TABLE.row(el).data();
          let currentStatus: any = DATA.isActive && DATA.post_status === 'publish' ? 1 : (DATA.post_status === 'pending' ? 'pending' : 0);
          let Element = e.currentTarget;
          let data = $(Element).data();
          let companyId: number = data.id;
          let confirmButton: string = currentStatus === 1 ? 'Activer' : 'Désactiver';
          swal("Modifier le status de l'entreprise", {
            buttons: {
              activated: {
                text: "Activer"
              },
              disabled: {
                text: "Désactiver",
              },
              cancel: "Annuler"
            },
          } as any)
            .then((value) => {
              switch (value) {
                case "activated":
                case "disabled":
                  let status: boolean = value === 'activated' ? true : false;
                  component.companyService
                    .activated(companyId, status)
                    .subscribe(response => {
                      swal(
                        'Modification',
                        'Entreprise mis à jour avec succès',
                        'success'
                      )
                      component.TABLE.ajax.reload(null, false);
                    })
                  break;

              }
            });

        })
        .on('click', '.update-account', e => {
          let el = $(e.currentTarget).parents('tr');
          let DATA = component.TABLE.row(el).data();
          component.switcher.onOpenDialog(DATA.ID, DATA.account);
        })

    }, 600);

  }

}
