import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import WPAPI from 'wpapi';
import swal from 'sweetalert2';
import { Helpers } from '../../helpers';
import { config } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-formations',
  templateUrl: './formations.component.html',
  styleUrls: ['./formations.component.css']
})
export class FormationsComponent implements OnInit {
  public table: any;
  public loading: boolean = false;
  public WPEndpoint: any;
  public Feature: any = {};
  constructor(
    private router: Router,
    private Http: HttpClient,
    private authService: AuthService
  ) {
    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    let currentUser = this.authService.getCurrentUser();
    this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` });
    var namespace = 'wp/v2'; // use the WP API namespace
    var route = '/formation/(?P<id>)'; // route string - allows optional ID parameter
    this.WPEndpoint.formation = this.WPEndpoint.registerRoute(namespace, route);
  }

  public reload(): void {
    this.table.ajax.reload(null, false);
  }

  public onSaveFeatured(Form: NgForm): void {
    if (Form.valid) {
      this.loading = true;
      let value: any = Form.value;
      this.WPEndpoint.formation().id(value.ID).update({
        featured: value.position,
        featured_datelimit: value.position ? value.featured_datelimit : ''
      }).then(resp => {
        this.loading = false;
        this.reload();
        $('#edit-featured-formation-modal').modal('hide');
      })
    }
  }

  ngOnInit() {
    moment.locale('fr');
    const getElementData = (ev: any): any => {
      let el = $(ev.currentTarget).parents('tr');
      let data = this.table.row(el).data();
      return data;
    };
    const formationTable = $('#formation-table');
    formationTable
      .on('xhr.dt', () => {
        Helpers.setLoading(false);
      });

    this.table = formationTable.DataTable({
      pageLength: 10,
      page: 1,
      ordering: false, // Activer ou désactiver l'affichage d'ordre
      fixedHeader: true,
      responsive: false,
      "sDom": 'rtip',
      processing: true,
      serverSide: true,
      columns: [
        { data: 'ID' },
        { data: 'reference' },
        {
          data: 'activation', render: (data, type, row) => {
            let status: string = data && row.status === 'publish' ? 'Publier' : (row.status === 'pending' ? "En attente" : "Désactiver");
            let style: string = data && row.status === 'publish' ? 'primary' : (row.status === 'pending' ? "warning" : "danger");
            return `<span class="badge badge-${style}">${status}</span>`;
          }
        },
        { data: 'title', render: (data, type, row, meta) => data },
        {
          data: 'featured', render: data => {
            let featured: string = data ? 'À LA UNE' : 'AUCUN';
            let style: string = data ? 'blue' : 'secondary';
            return `<span style="cursor: pointer" class="badge update-position badge-${style}">${featured}</span>`;
          }
        },
        { data: 'establish_name' },
        { data: 'date_limit', render: (data) => { return moment(data).fromNow(); } },
        { data: 'date_create', render: (data) => { return moment(data).fromNow(); } },
        {
          data: 'region', render: (data) => {
            if (_.isNull(data) || _.isEmpty(data)) return 'Non renseigner';
            if (_.isArray(data)) return data[0].name;
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
                      <li><button class="btn btn-primary btn-icon-only btn-circle btn-air edit-formation" data-id="${row.ID}"><i class="la la-edit"></i></button></li>
                      <li><button class="btn btn-pink btn-icon-only btn-circle btn-air status-formation" data-status="false" data-id="${row.ID}"><i class="la la-eye-slash"></i></button></li>
                      <li><button class="btn btn-blue btn-icon-only btn-circle btn-air status-formation" data-status="true" data-id="${row.ID}" ><i class="la la-eye"></i></button></li>
                      <li><button class="btn btn-danger btn-icon-only btn-circle btn-air remove-formation" data-id="${row.ID}" ><i class="la la-trash"></i></button></li>
                   </ul>
                </div>`
        }
      ],
      initComplete: (setting, json) => {
        $('#key-search').on('keypress', (event) => {

        });

        $("#type-status").on('change', (event) => {

        });

        $("#type-rateplan").on('change', (event) => {

        });
      },
      ajax: {
        url: `${config.itApi}/formations/`,
        dataType: 'json',
        data: {
          //columns: false,
          order: false,
        },
        type: 'POST',
      }

    });

    $('#formation-table tbody')
      .on('click', '.update-position', e => {
        e.preventDefault();
        let __formation: any = getElementData(e);
        this.Feature = _.clone(__formation);
        this.Feature.featured = __formation.featured ? 1 : 0;
        $('#edit-featured-formation-modal').modal('show');
      })
      .on('click', '.edit-formation', (e) => {
        e.preventDefault();
        //if (!this.authService.notUserAccess("editor")) return;
        let data = $(e.currentTarget).data();
        this.router.navigate(['/formation', parseInt(data.id)]);
      })
      .on('click', '.remove-formation', e => {
        e.preventDefault();
        // Réfuser l'accès au commercial d'utiliser cette fonctionnalité
        if (!this.authService.notUserAccess("contributor")) return;
        if (!this.authService.notUserAccess("editor")) return;

        let __formation = getElementData(e);
        swal({
          title: 'Confirmation',
          html: `Vous voulez vraiment supprimer cette formation?<br> <b>${__formation.title}</b>`,
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: "Supprimer",
          cancelButtonText: "Annuler"
        }).then((result) => {
          if (result.value) {
            Helpers.setLoading(true);
            this.WPEndpoint.formation().id(__formation.ID).delete({ force: true })
              .then(
                resp => {
                  swal('Succès', "La formation a bien été effacer avec succès", 'success');
                  this.reload();
                  Helpers.setLoading(false);
                },
                error => {
                  swal('Echec de suppression', "Une erreur s'est produite pendant la suppression de la formation", 'error');
                  Helpers.setLoading(false);
                });
            // For more information about handling dismissals please visit
            // https://sweetalert2.github.io/#handling-dismissals
          } else if (result.dismiss === swal.DismissReason.cancel) {

          }
        })
      })
      .on('click', '.status-formation', e => {
        e.preventDefault();
        let data = $(e.currentTarget).data();
        let status: boolean = data.status;
        let __formation: any = getElementData(e);

        let confirmButton: string = status ? 'Activer' : 'Désactiver';
        let cancelButton: string = "Annuler";
        if (__formation.activation === status && __formation.status === 'publish') {
          swal('', `Vous ne pouvez pas ${confirmButton.toLowerCase()} une formation qui es déja ${confirmButton.toLowerCase()}.`, 'warning');
          return false;
        }
        swal({
          title: 'Confirmation',
          text: `Vous voulez vraiment ${confirmButton.toLowerCase()} cette formation?`,
          type: status ? 'warning' : 'error',
          showCancelButton: true,
          confirmButtonText: confirmButton,
          cancelButtonText: cancelButton
        }).then((result) => {
          if (result.value) {
            Helpers.setLoading(true);
            let activated: number = status ? 1 : 0;
            this.Http.get(`${config.itApi}/formation/${__formation.ID}?ref=activated&status=${activated}`, { responseType: 'json' })
              .subscribe(resp => {
                Helpers.setLoading(false);
                let response: any = resp;
                if (!_.isUndefined(response.success) && response.success) {
                  swal('Succès', "Action effectuer avec succès", 'info');
                  this.reload();
                }
              })
            // For more information about handling dismissals please visit
            // https://sweetalert2.github.io/#handling-dismissals
          } else if (result.dismiss === swal.DismissReason.cancel) {

          }
        })
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
  }

  onChoosed(ev: any): void {

  }

  onResetSearch(): void {

  }

}
