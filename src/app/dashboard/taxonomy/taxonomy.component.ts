import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { config } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Helpers } from '../../helpers';
import { RequestService } from '../../services/request.service';
import { EditTaxonomyComponent } from './edit-taxonomy/edit-taxonomy.component';
import { NewTaxonomyComponent } from './new-taxonomy/new-taxonomy.component';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
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
   public sStatus: string = "";

   @ViewChild(EditTaxonomyComponent) private EditComponent: EditTaxonomyComponent;
   @ViewChild(NewTaxonomyComponent) private NewComponent: NewTaxonomyComponent;

   constructor(
      private activeRoute: ActivatedRoute,
      private requestServices: RequestService,
      private errnoService: ErrorService,
      private authService: AuthService
   ) { }

   ngOnInit() {
      this.activeRoute.params.subscribe(params => {
         this.taxonomy = params.term;
         this.requestServices.collectTaxonomies()
            .subscribe(
               taxonomies => {
                  this.name = taxonomies[this.taxonomy].name;
                  $('#type-status').val(''); // Initialiser la filtrer
                  this.initDatatable();
               }, error => {
                  this.errnoService.handler(error);
               })
      });
   }

   reloadDatatable(): void {
      this.table.ajax.reload(null, false);
   }

   onEdit(term: any): void {
      // Réfuser l'accès au commercial de modifier cette option
      if (this.taxonomy === 'language') {
         if (!this.authService.notUserAccess('contributor')) return;
      }
         
      this.edit = _.cloneDeep(term);
      setTimeout(() => {
         this.EditComponent.open();
      }, 600);
   }

   onNew(): void {
      // Réfuser l'accès au commercial de modifier cette option
      // if (!this.authService.notUserAccess("editor")) return;
      if (!this.authService.notUserAccess('contributor')) return;
      this.NewComponent.open();
   }

   public createSearch() {
      let param: string = this.sStatus === '' ? '' : ` |${this.sStatus}`;
      let searchs: string = param;
      this.table.search(searchs, true, false).draw();
   }

   public onStatusChange($event: any): void {
      let el = $event.currentTarget;
      this.sStatus = el.value;
      this.createSearch();
   }

   initDatatable(): void {
      let taxonomyLists = $('#taxonomy-table');
      if ($.fn.DataTable.isDataTable('#taxonomy-table')) {
         this.table.destroy();
         taxonomyLists.find('tbody').empty();
      }
      taxonomyLists
         .on('preXhr.dt', (e, settings, data) => {
            Helpers.setLoading(true);
         })
         .on('xhr.dt', (e, settings, json, xhr) => {
            Helpers.setLoading(false);
         })
         .on('init.dt', () => {
            Helpers.setLoading(false);
         });
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
                  data: 'activated', render: (data) => {
                     let status = data ? 'Publier' : "En attente";
                     let style = data ? 'primary' : "warning";
                     return `<span class="badge badge-${style}">${status}</span>`;
                  }
               },
               {
                  data: null,
                  render: (data, type, row) => `<span data-id='${row.ID}' class='edit-taxonomy badge badge-blue'>Modifier</span>`
               }
            ],
            initComplete: () => {

            },
            ajax: {
               url: `${config.itApi}/taxonomy/${this.taxonomy}/`,
               dataType: 'json',
               data: (dt) => {
                  return {
                     columns: dt.columns,
                     sort: dt.order,
                     search: dt.search,
                     start: dt.start,
                     length: dt.length,
                  };
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
