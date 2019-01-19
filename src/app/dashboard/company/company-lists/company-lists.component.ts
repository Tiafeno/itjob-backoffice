import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import * as WPAPI from 'wpapi';
import * as _ from 'lodash';
import swal from 'sweetalert';
import swal2 from 'sweetalert2';
import { config } from '../../../../environments/environment';
import * as moment from 'moment';
import { CompanyEditComponent } from '../company-edit/company-edit.component';
import { AuthService } from '../../../services/auth.service';
import { Helpers } from '../../../helpers';
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
  public wp: any;

  @ViewChild(CompanyEditComponent) private companyEdit: CompanyEditComponent

  constructor(
    private companyService: CompanyService,
    private authService: AuthService
  ) { 
    this.wp = new WPAPI({ endpoint: config.apiEndpoint });
    let currentUser = this.authService.getCurrentUser();
    this.wp.setHeaders({ Authorization: `Bearer ${currentUser.token}` });
  }

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
    // Ajouter ici un code pour recuperer les candidats...
    const companyLists = $('#orders-table');
    const getElementData = (ev: any): any => {
      let el = $(ev.currentTarget).parents('tr');
      let DATA = this.TABLE.row(el).data();

      return DATA;
    };
    companyLists
      .on('page.dt', () => {
        let info = this.TABLE.page.info();
        localStorage.setItem('company-page', info.page);
      })
      .on('init.dt', (e, settings, json) => {
        setTimeout(() => {
          let page: string = localStorage.getItem('company-page');
          let pageNum: number = parseInt(page);
          if (_.isNumber(pageNum) && !_.isNaN(pageNum)) {
            this.TABLE.page(pageNum).draw("page");
            this.TABLE.ajax.reload(null, false);
          }
        }, 600);
      });

    this.TABLE = companyLists.DataTable({
      pageLength: 20,
      page: 0,
      ordering: false,
      fixedHeader: true,
      responsive: false,
      "sDom": 'rtip',
      processing: true,
      serverSide: true,
      columns: [
        { data: 'ID' },
        { data: 'title', render: (data, type, row, meta) => data },
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
          render: (data, type, row, meta) => `
                  <div class="fab fab-left">
                     <button class="btn btn-sm btn-primary btn-icon-only btn-circle btn-air" data-toggle="button">
                        <i class="fab-icon la la-bars"></i>
                        <i class="fab-icon-active la la-close"></i>
                     </button>
                     <ul class="fab-menu">
                        <li><button class="btn btn-primary btn-icon-only btn-circle btn-air edit-company" data-id="${row.ID}"><i class="la la-edit"></i></button></li>
                        <li><button class="btn btn-danger btn-icon-only btn-circle btn-air remove-company" data-id="${row.ID}" ><i class="la la-trash"></i></button></li>
                     </ul>
                  </div>`
        }
      ],
      initComplete: (setting, json) => {

        $('#key-search').on('keypress', (event) => {
          if (event.which === 13) {
            this.sKey = event.currentTarget.value;
            this.createSearch();
          }
        });

        $("#type-status").on('change', (event) => {
          this.sStatus = event.currentTarget.value;
          this.createSearch();
        });

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
      .on('apply.daterangepicker', (ev, picker) => {
        let startDate = picker.startDate.format('YYYY-MM-DD');
        let endDate = picker.endDate.format('YYYY-MM-DD');
        this.sDate = `${startDate}x${endDate}`;
        this.createSearch();
      })
      .on('cancel.daterangepicker', (ev, picker) => {
        $('#daterange').val('');
        this.sDate = '';
        this.createSearch();
      });

    $('#orders-table tbody')
      .on('click', '.edit-company', e => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        // Seul l'administrateur peuvent modifier les entreprises
        // if (!this.authService.hasAccess()) return;

        let __company = getElementData(e);
        this.companyEdit.onOpen(__company);
      })
      .on('click', '.remove-company', e => {
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.notUserAccess("contributor")) return;
        if (!this.authService.notUserAccess("editor")) return;

        let __company = getElementData(e);
        swal2({
          title: 'Confirmation',
          html: `Vous voulez vraiment supprimer l'entrprise?<br> <b>${__company.title}</b>`,
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: "Supprimer",
          cancelButtonText: "Annuler"
        }).then((result) => {
          if (result.value) {
            Helpers.setLoading(true);
            let author: any = __company.author;
            this.wp.users().id(author.ID).delete({force: true, reassign: 0}).then(
              resp => {
                swal2('Succès', "CV supprimer avec succès", 'success');
                this.reloadDatatable();
                Helpers.setLoading(false);
              },
              error => {
                swal2('Erreur', error.message, 'error');
                Helpers.setLoading(false);
              }
            )
            // For more information about handling dismissals please visit
            // https://sweetalert2.github.io/#handling-dismissals
          } else if (result.dismiss === swal2.DismissReason.cancel) {

          }
        });
      })
      .on('click', '.edit-status', e => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.notUserAccess("contributor")) return;
        if (!this.authService.notUserAccess("editor")) return;

        const __company = getElementData(e);
        const currentStatus: any = __company.isActive && __company.post_status === 'publish' ? true : (__company.post_status === 'pending' ? 'pending' : false);
        swal("Modifier le status de l'entreprise", {
          icon: 'warning',
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
          .then(value => {
            switch (value) {
              case "activated":
              case "disabled":
                let status: boolean = value === 'activated' ? true : false;
                if (status === currentStatus) return;
                Helpers.setLoading(true);
                this.companyService
                  .activated(__company.ID, status)
                  .subscribe(
                    response => {
                      swal2('Modification','Entreprise mis à jour avec succès','success');
                      Helpers.setLoading(false);
                      this.reloadDatatable();
                    }, error => {
                      swal2('Erreur', error.message, 'error');
                      Helpers.setLoading(false);
                    })
                break;

            }
          });
      });
  }

}
