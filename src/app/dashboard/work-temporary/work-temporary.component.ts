import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Helpers} from "../../helpers";
import swal from "sweetalert2";
import * as moment from "moment";
import {config} from "../../../environments/environment";
import * as _ from "lodash";
import {Router} from "@angular/router";
declare var $:any;

@Component({
  selector: 'app-work-temporary',
  templateUrl: './work-temporary.component.html',
  styleUrls: ['./work-temporary.component.css']
})
export class WorkTemporaryComponent implements OnInit {
  public table: any;
  constructor(
    private Http: HttpClient,
    private router: Router
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
    const worksTable = $('#works-table');
    worksTable
      .on('xhr.dt', () => {
        Helpers.setLoading(false);
      });

    this.table = worksTable.DataTable({
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
        { data: 'title' },
        { data: 'type', render: (data) => _.isEmpty(data) ? "Non renseigner" : data['label'] },
        { data: 'reference', render: (data) => data },
        {
          data: 'activated', render: (data, type, row) => {
            let status: string = data && row.status === 'publish' ? 'Publier' : (!data && row.status === 'pending' ? "En attente" : "Désactiver");
            return `<span class="badge badge-default">${status}</span>`;
          }
        },
        {
          data: 'featured', render: data => {
            let featured: string = data ? 'à la une' : 'standard';
            return `<span style="cursor: pointer" class="badge badge-pill badge-info uppercase">${featured}</span>`;
          }
        },
        { data: 'region', render: (data) => { return (_.isEmpty(data) || _.isNull(data)) ? "Non renseigner" : data.name; } },
        { data: 'date_create', render: (data) => { return _.isEmpty(data) ? "Non renseigner" : moment(data).fromNow(); } },
        {
          data: null,
          render: (data, type, row) => `
                <div class="fab fab-left">
                   <button class="btn btn-sm btn-primary btn-icon-only btn-circle btn-air" data-toggle="button">
                      <i class="fab-icon la la-bars"></i>
                      <i class="fab-icon-active la la-close"></i>
                   </button>
                   <ul class="fab-menu">
                      <li><button class="btn btn-primary btn-icon-only btn-circle btn-air edit-work" data-id="${row.ID}"><i class="la la-edit"></i></button></li>
                      <li><button class="btn btn-pink btn-icon-only btn-circle btn-air status-work" data-status="0" data-id="${row.ID}"><i class="la la-eye-slash"></i></button></li>
                      <li><button class="btn btn-blue btn-icon-only btn-circle btn-air status-work" data-status="1" data-id="${row.ID}" ><i class="la la-eye"></i></button></li>
                      <li><button class="btn btn-danger btn-icon-only btn-circle btn-air remove-work" data-id="${row.ID}" ><i class="la la-trash"></i></button></li>
                   </ul>
                </div>`
        }
      ],
      initComplete: (setting, json) => {

      },
      ajax: {
        url: `${config.itApi}/works/`,
        dataType: 'json',
        data: {
          order: false,
        },
        type: 'POST',
      }
    });

    $('#works-table').on('click', '.status-work', e => {
      e.preventDefault();
      let data = $(e.currentTarget).data();
      let status: number = data.status;
      let __works: any = getElementData(e);

      let confirmButton: string = status ? 'Activer' : 'Désactiver';
      let activated: number = __works.activated ? 1 : 0;
      if (activated === status && __works.status === 'publish') {
        swal('Information', `Vous ne pouvez pas ${confirmButton.toLowerCase()} une 
        annonce qui es déja ${confirmButton.toLowerCase()}.`, 'warning');
        return false;
      }
      swal({
        title: 'Confirmation',
        text: `Vous voulez vraiment ${confirmButton.toLowerCase()} cette annonce?`,
        type: status ? 'error' : 'warning',
        showCancelButton: true,
        confirmButtonText: confirmButton,
        cancelButtonText: 'Annuler'
      } as any).then((result) => {
        if (result.value) {
          Helpers.setLoading(true);
          let activated: number = status ? 1 : 0;
          let Fm = new FormData();
          Fm.append('activated', activated.toString());
          this.Http.post(`${config.itApi}/work/${__works.ID}/activated`, Fm)
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
        }
      })
    });

    $('#works-table').on('click', '.remove-work', e => {
      e.preventDefault();
      let __works: any = getElementData(e);
      swal({
        title: 'Confirmation',
        text: `Vous voulez vraiment supprimer cette annonce?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: "Supprimer",
        cancelButtonText: "Annuler"
      } as any).then((result) => {
        if (result.value) {
          Helpers.setLoading(true);
          this.Http.post(`${config.itApi}/work/${__works.ID}/remove`, {})
            .subscribe(resp => {
              Helpers.setLoading(false);
              let response: any = resp;
              if (response.success) {
                this.reload();
                swal('Confirmation', "Annonce effacer avec succès", 'info');
              } else {
                swal('Erreur', response.message, 'error');
              }
            })
          // For more information about handling dismissals please visit
          // https://sweetalert2.github.io/#handling-dismissals
        }
      })
    });

    $('#works-table').on('click', '.edit-work', e => {
      e.preventDefault();
      let __work: any = getElementData(e);
      this.router.navigate(['work', __work.ID]);
    })

  }

}
