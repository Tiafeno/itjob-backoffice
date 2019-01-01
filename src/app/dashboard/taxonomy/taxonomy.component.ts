import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { config } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Helpers } from '../../helpers';
import { RequestService } from '../../services/request.service';
import { EditTaxonomyComponent } from './edit-taxonomy/edit-taxonomy.component';
import { NewTaxonomyComponent } from './new-taxonomy/new-taxonomy.component';
import { AuthService } from '../../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-taxonomy',
  templateUrl: './taxonomy.component.html',
  styleUrls: ['./taxonomy.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TaxonomyComponent implements OnInit {
  public table: any;
  public name: string = "";
  public taxonomy: string = "";
  public edit: any = { name: '', activated: 0 }; // term

  @ViewChild(EditTaxonomyComponent) private EditComponent: EditTaxonomyComponent;
  @ViewChild(NewTaxonomyComponent) private NewComponent: NewTaxonomyComponent;

  constructor(
    private activeRoute: ActivatedRoute,
    private requestServices: RequestService,
    private authSerice: AuthService
  ) { }

  ngOnInit() {
    this.activeRoute.params.subscribe(params => {
      this.taxonomy = params.term;
      this.requestServices.collectTaxonomies()
        .subscribe(taxonomies => {
          this.name = taxonomies[this.taxonomy].name;
          this.initDatatable();
        })
    });
  }

  reloadDatatable(): void {
    this.table.ajax.reload(null, false);
  }

  onEdit(term: any): void {
    // Réfuser l'accès au commercial de modifier cette option
    if (!this.authSerice.hasAccess()) return;

    this.edit = _.cloneDeep(term);
    let activated = this.edit.activated;
    this.edit.activated = _.isEmpty(activated) || _.isNull(activated) ? 0 : 1;
    this.EditComponent.open();
  }

  onNew(): void {
    // Réfuser l'accès au commercial de modifier cette option
    if (!this.authSerice.hasAccess()) return;

    this.NewComponent.open();
  }

  initDatatable(): void {
    let taxonomyLists = $('#taxonomy-table');
    if ($.fn.DataTable.isDataTable('#taxonomy-table')) {
      this.table.destroy();
      taxonomyLists.find('tbody').empty();
    }
    taxonomyLists
      .on('preXhr.dt', function (e, settings, data) {
        Helpers.setLoading(true);
      })
      .on('init.dt', function () {
        Helpers.setLoading(false);
      })
    this.table = taxonomyLists
      .DataTable({
        pageLength: 20,
        fixedHeader: true,
        responsive: true,
        destroy: true,
        select: false,
        dom: '<"top"i><"info"r>t<"bottom"flp><"clear">',
        processing: true,
        page: 1,
        serverSide: true,
        columns: [
          { data: 'term_id' },
          { data: 'name' },
          {
            data: 'activated', render: (data, type, row) => {
              let status = data ? 'Publier' : "En attente";
              let style = data ? 'primary' : "warning";
              return `<span class="badge badge-${style}">${status}</span>`;
            }
          },
          {
            data: null,
            render: (data, type, row, meta) => `<span data-id='${row.ID}' class='edit-taxonomy badge badge-blue'>Modifier</span>`
          }
        ],
        initComplete: (setting, json) => {

        },
        ajax: {
          url: `${config.itApi}/taxonomy/${this.taxonomy}/`,
          dataType: 'json',
          data: {
            order: false,
          },
          type: 'GET',
          beforeSend: function (xhr) {
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.token) {
              xhr.setRequestHeader("Authorization",
                `Bearer ${currentUser.token}`);
            }
          }
        }
      });


    $('#taxonomy-table tbody')
      .on('click', '.edit-taxonomy', (e) => {
        e.preventDefault();
        let el = $(e.currentTarget).parents('tr');
        let data = this.table.row(el).data();
        this.onEdit(data);
      })

  }

}
