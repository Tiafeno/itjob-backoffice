import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { config } from '../../../environments/environment';
import { Helpers } from '../../helpers';
import { AuthService } from '../../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-request-formations',
  templateUrl: './request-formations.component.html',
  styleUrls: ['./request-formations.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RequestFormationsComponent implements OnInit {
  public table: any;
  public interesteds : Array<any> = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private Http: HttpClient
  ) { }

  public reload(): void {
    this.table.ajax.reload(null, false);
  }

  ngOnInit() {
    moment.locale('fr');
    const getElementData = (ev: any): any => {
      let el = $(ev.currentTarget).parents('tr');
      let data = this.table.row(el).data();
      return data;
    };
    const formationTable = $('#request-formation-table');
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
      dom: '<"top"i><"info"r>t<"bottom"flp><"clear">',
      processing: true,
      serverSide: true,
      columns: [
        { data: 'ID' },
        { data: 'subject' },
        { data: 'topic', render: (data, type, row, meta) => data },
        {
          data: 'validated', render: (data, type, row) => {
            let status: string = data === 1 && row.disabled === 0 ? 'Publier' : (data === 0 && row.disabled === 0 ? "En attente" : "Désactiver");
            return `<span class="badge badge-default">${status}</span>`;
          }
        },
        {
          data: 'concerned', render: data => {
            let cpt: number = _.isArray(data) ? data.length : 0;
            return `<span style="cursor: pointer" class="badge view-interested badge-pill badge-info">Les candidats (${cpt})</span>`;
          }
        },
        { data: 'date_create', render: (data) => { return moment(data).fromNow(); } },
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
                      <li><button class="btn btn-pink btn-icon-only btn-circle btn-air status-formation" data-status="1" data-id="${row.ID}"><i class="la la-eye-slash"></i></button></li>
                      <li><button class="btn btn-blue btn-icon-only btn-circle btn-air status-formation" data-status="0" data-id="${row.ID}" ><i class="la la-eye"></i></button></li>
                      <li><button class="btn btn-danger btn-icon-only btn-circle btn-air remove-formation" data-id="${row.ID}" ><i class="la la-trash"></i></button></li>
                   </ul>
                </div>`
        }
      ],
      initComplete: (setting, json) => {

      },
      ajax: {
        url: `${config.itApi}/request-formations/`,
        dataType: 'json',
        data: {
          order: false,
        },
        type: 'POST',
      }
    });

    $('#request-formation-table').on('click', '.status-formation', e => {
      e.preventDefault();

      // Réfuser l'accès au commercial de modifier cette option
      if (!this.auth.notUserAccess("editor")) return;
      if (!this.auth.notUserAccess("contributor")) return;

      let data = $(e.currentTarget).data();
      let status: number = data.status;
      let __formation: any = getElementData(e);

      let confirmButton: string = status ? 'Désactiver' : 'Activer';
      let cancelButton: string = "Annuler";
      if (__formation.validated === 1 && __formation.disabled === status) {
        swal('Information', `Vous ne pouvez pas ${confirmButton.toLowerCase()} une formation qui es déja ${confirmButton.toLowerCase()}.`, 'warning');
        return false;
      }
      swal({
        title: 'Confirmation',
        text: `Vous voulez vraiment ${confirmButton.toLowerCase()} cette demande de formation?`,
        type: status ? 'error' : 'warning',
        showCancelButton: true,
        confirmButtonText: confirmButton,
        cancelButtonText: cancelButton
      }).then((result) => {
        if (result.value) {
          Helpers.setLoading(true);
          let disabled: number = status ? 1 : 0;
          let formData = new FormData();
          formData.append('disabled', disabled.toString());
          this.Http.post(`${config.itApi}/request-formation/${__formation.ID}/disabled`, formData)
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

    $('#request-formation-table').on('click', '.view-interested', e => {
      e.preventDefault();
      Helpers.setLoading(true);
      let __formation: any = getElementData(e);
      const newLocal = this.Http.post(`${config.itApi}/request-formation/${__formation.ID}/concerned`, {})
        .subscribe(resp => {
          let data: any = _.clone(resp);
          if (_.isArray(data))
            this.interesteds = _.cloneDeep(data);
          $('#interest-candidate-modal').modal('show');
          Helpers.setLoading(false);
        }, error => {
          Helpers.setLoading(false);
        });
    });

    $('#request-formation-table').on('click', '.edit-formation', e => {
      e.preventDefault();
      let __formation: any = getElementData(e);
      this.router.navigate(['request-formation', __formation.ID, 'edit']);
    });

    $('#request-formation-table').on('click', '.remove-formation', e => {
      e.preventDefault();
      // Réfuser l'accès au commercial de modifier cette option
      if (!this.auth.notUserAccess("editor")) return;
      if (!this.auth.notUserAccess("contributor")) return;

      let __formation: any = getElementData(e);
      swal({
        title: 'Confirmation',
        text: `Vous voulez vraiment supprimer cette demande de formation?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: "Supprimer",
        cancelButtonText: "Annuler"
      }).then((result) => {
        if (result.value) {
          Helpers.setLoading(true);
          this.Http.post(`${config.itApi}/request-formation/${__formation.ID}/remove`, {})
            .subscribe(resp => {
              Helpers.setLoading(false);
              let response: any = resp;
              if (response) {
                this.reload();
                swal('Confirmation', "Demande de formation effacer avec succès", 'info');
              } else {
                swal('Erreur', "Une erreur s'est produite", 'error');
              }
            })
          // For more information about handling dismissals please visit
          // https://sweetalert2.github.io/#handling-dismissals
        } else if (result.dismiss === swal.DismissReason.cancel) {

        }
      })
    });
  }

}
