import { Component, OnInit, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { config } from '../../../../environments/environment';
import { CandidateService } from '../../../services/candidate.service';
import { Router } from '@angular/router';
import * as WPAPI from 'wpapi';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Helpers } from '../../../helpers';
import { StatusChangerComponent } from '../../../directives/account/status-changer/status-changer.component';
import { FeaturedSwitcherComponent } from '../../../directives/candidat/featured-switcher/featured-switcher.component';
import { ArchivedCandidateComponent } from '../../../directives/candidat/archived-candidate/archived-candidate.component';
import { AuthService } from '../../../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-candidat',
  templateUrl: './candidat-list.component.html',
  styleUrls: ['./candidat-list.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CandidatListComponent implements OnInit, AfterViewInit {
  public listsCandidat: Array<any>;
  public posttype: string = 'company';
  public page: number = 1;
  public Helper: any;
  private table: any;
  public sStatus: string = "";
  public sKey: string = "";
  public sActivityArea: number = 0;
  public sPosition: any;
  public sDate: string = "";
  public selected: number = 0;
  public wp: any;

  @ViewChild(StatusChangerComponent) private statusChanger: StatusChangerComponent;
  @ViewChild(FeaturedSwitcherComponent) private featuredSwitcher: FeaturedSwitcherComponent;
  @ViewChild(ArchivedCandidateComponent) public archivedCandidate: ArchivedCandidateComponent;

  constructor(
    public candidateService: CandidateService,
    private router: Router,
    private authService: AuthService
  ) {
    this.Helper = Helpers;
    this.wp = new WPAPI({ endpoint: config.apiEndpoint });
    let currentUser = this.authService.getCurrentUser();
    this.wp.setHeaders({ Authorization: `Bearer ${currentUser.token}` });
  }

  // Actualiser les resultats
  reloadDatatable(): void {
    this.table.ajax.reload(null, false);
  }

  // Effectuer une recherche du metier
  onChoosed(areaId: number) {
    this.sActivityArea = areaId;
    this.createSearch();
  }

  onArchived(selected: number): void {
    this.archivedCandidate.changeArchiveStatusCandidate(1, selected).subscribe(response => {
      this.reloadDatatable();
      swal("Information", 'Le cv a été marquer comme incomplète', 'info');
    });
  }

  public createSearch() {
    let searchs: string = `${this.sKey}|${this.sStatus}|${this.sActivityArea}|${this.sDate}|${this.sPosition}`;
    this.table.search(searchs, true, false).draw();
  }

  public resetFilterSearch() {
    $('.page-content').find('input').val('');
    $('.page-content').find('select:not("#activity_area_search")').val('');
    $('.page-content').find('.selectpicker').selectpicker("refresh");
    this.table.search("", true, false).draw();
  }

  ngOnInit() {
    moment.locale('fr');
    $.fn.dataTable.ext.errMode = 'none';
    const candidateLists = $('#orders-table');
    const getElementData = (ev: any): any => {
      let el = $(ev.currentTarget).parents('tr');
      let DATA = this.table.row(el).data();

      return DATA;
    };

    candidateLists
      .on('page.dt', () => {
        let info = this.table.page.info();
        localStorage.setItem('candidate-page', info.page);
      })
      .on('init.dt', (e, settings, json) => {
        setTimeout(() => {
          let candidatePage: string = localStorage.getItem('candidate-page');
          let pageNum: number = parseInt(candidatePage);
          if (!_.isNaN(pageNum)) {
            this.table.page(pageNum).draw('page');
            this.table.ajax.reload(null, false);
          }
        }, 600);

      })
      .on('xhr.dt', function (e, settings, json, xhr) {
        // Note no return - manipulate the data directly in the JSON object.
      })
      .on('error.dt', function (e, settings, techNote, message) {
        swal('Erreur', "List datatable: " + message, 'error');
        return true;
      });
    this.table = candidateLists
      .DataTable({
        pageLength: 10,
        ordering: false,
        fixedHeader: true,
        responsive: false,
        error: true,
        select: 'single',
        buttons: [
          'colvis',
          'excel',
          'print'
        ],
        dom: '<"top"i><"info"r>t<"bottom"flp><"clear">',
        processing: true,
        page: 2,
        serverSide: true,
        columns: [
          { data: 'ID' },
          { data: 'reference' },
          {
            data: 'privateInformations.firstname'
          },
          {
            data: 'privateInformations.lastname'
          },
          {
            data: 'isActive', render: (data, type, row) => {
              let status = data && row.state === 'publish' ? 'Publier' : (row.state === 'pending' ? "En attente" : "Désactiver");
              let style = data && row.state === 'publish' ? 'primary' : (row.state === 'pending' ? "warning" : "danger");
              return `<span class="badge update-status badge-${style}">${status}</span>`;
            }
          },
          {
            data: 'featured', render: (data) => {
              let value: string = data ? 'à la une' : 'AUCUN';
              let style: string = data ? 'primary' : 'secondary';
              return `<span class="badge update-featured badge-${style} text-uppercase">${value}</span>`;
            }
          },
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
                        <li><button class="btn btn-danger btn-icon-only btn-circle btn-air remove-candidate" data-id="${row.ID}" ><i class="la la-trash"></i></button></li>
                     </ul>
                  </div>`
          }
        ],
        initComplete: (setting, json) => {
          $('#key-search').on('keypress', event => {
            this.sKey = event.currentTarget.value;
            if (event.which === 13) {
              this.createSearch();
            }
          });

          $("#type-status").on('change', event => {
            this.sStatus = event.currentTarget.value;
            this.createSearch();
          });

          $('#position').on('change', e => {
            this.sPosition = e.currentTarget.value;
            this.createSearch();
          });
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
          },
          error: (jqXHR, status, errorThrown) => {
            swal('Erreur', "Erreur lors du chargement des données depuis le serveur, Erreur statut: " + jqXHR.status, 'error');
          }
        }

      });

    this.table
      .on('select', (e, dt, type, indexes) => {
        let data = this.table.rows(indexes).data();
        this.selected = _.isEmpty(data[0]) ? 0 : data[0];
      })
      .on('deselect', (e, dt, type, indexes) => {
        this.selected = 0;
      });

    $('#orders-table tbody')
      // Modifier le candidat
      .on('click', '.edit-candidate', e => {
        e.preventDefault();
        let data = $(e.currentTarget).data();
        this.router.navigate(['/candidate', data.id, 'edit']);
      })
      .on('click', '.update-status', e => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.notUserAccess("contributor")) return;
        if (!this.authService.notUserAccess("editor")) return;

        let __candidate = getElementData(e);
        let status: any = __candidate.isActive && __candidate.state === 'publish' ? 1 : (__candidate.state === 'pending' ? 'pending' : 0);
        this.statusChanger.onOpenDialog(__candidate.ID, status);
      })
      .on('click', '.update-featured', e => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.notUserAccess("contributor")) return;
        if (!this.authService.notUserAccess("editor")) return;

        let __candidate = getElementData(e);
        this.featuredSwitcher.onOpen(__candidate);
      })
      .on('click', '.remove-candidate', e => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.notUserAccess("contributor")) return;
        if (!this.authService.notUserAccess("editor")) return;

        let __candidate = getElementData(e);
        swal({
          title: 'Confirmation',
          html: `Vous voulez vraiment supprimer le CV?<br> <b>${__candidate.reference}</b>`,
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: "Supprimer",
          cancelButtonText: "Annuler"
        }).then((result) => {
          if (result.value) {
            Helpers.setLoading(true);
            let author: any = __candidate.privateInformations.author;
            this.wp.users().id(author.ID).delete({force: true, reassign: 0}).then(
              resp => {
                swal('succès', "CV supprimer avec succès", 'success');
                this.reloadDatatable();
                Helpers.setLoading(false);
              },
              error => {
                swal('Erreur', error.message, 'error');
                Helpers.setLoading(false);
              }
            )
            // For more information about handling dismissals please visit
            // https://sweetalert2.github.io/#handling-dismissals
          } else if (result.dismiss === swal.DismissReason.cancel) {

          }
        });
      })

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

  }


  ngAfterViewInit() {

  }

}
