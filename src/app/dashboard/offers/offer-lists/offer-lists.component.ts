import {Component, OnInit, ViewEncapsulation, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import * as WPAPI from 'wpapi';
import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';
import {config} from '../../../../environments/environment';
import {OfferService} from '../../../services/offer.service';
import {Helpers} from '../../../helpers';
import {FeaturedOfferComponent} from '../../../directives/offers/featured-offer/featured-offer.component';
import {RatePlanComponent} from '../../../directives/offers/rate-plan/rate-plan.component';
import {AuthService} from '../../../services/auth.service';
import {DeadlineOfferComponent} from '../../../directives/offers/deadline-offer/deadline-offer.component';
import {CompanyEditComponent} from "../../company/company-edit/company-edit.component";

declare var $: any;

@Component({
  selector: 'app-offer-lists',
  templateUrl: './offer-lists.component.html',
  styleUrls: ['./offer-lists.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class OfferListsComponent implements OnInit {
  public WPEndpoint: any;
  public listsOffers: Array<any> = [];
  public Helper: any;
  private table: any;
  public sStatus: string = "";
  public sKey: string = "";
  public sActivityArea: number = 0;
  public sDate: string = "";
  public sRateplan: string = "";

  @ViewChild(FeaturedOfferComponent) private featuredComp: FeaturedOfferComponent;
  @ViewChild(RatePlanComponent) private ratePlanComp: RatePlanComponent;
  @ViewChild(DeadlineOfferComponent) private deadlineOfferEditor: DeadlineOfferComponent;
  @ViewChild(CompanyEditComponent) private companyEdit: CompanyEditComponent;

  constructor(
    private router: Router,
    private offerService: OfferService,
    private authService: AuthService
  ) {
    this.Helper = Helpers;
    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    let currentUser = this.authService.getCurrentUser();
    this.WPEndpoint.setHeaders({Authorization: `Bearer ${currentUser.token}`});
    var namespace = 'wp/v2'; // use the WP API namespace
    var route = '/offers/(?P<id>\\d+)'; // route string - allows optional ID parameter
    this.WPEndpoint.offers = this.WPEndpoint.registerRoute(namespace, route);
  }

  onChoosed(areaId: number) {
    this.sActivityArea = areaId;
    this.createSearch();
  }

  public reload(): void {
    this.table.ajax.reload(null, false);
  }

  public resetFilterSearch() {
    $('.page-content').find('input').val('');
    $('.page-content').find('select:not("#activity_area_search")').val('');
    $('.page-content').find('select#activity_area_search').val(0);
    $('.page-content').find('.selectpicker').selectpicker("refresh");
    this.sKey = "";
    this.sActivityArea = 0;
    this.sStatus = "";
    this.sRateplan = "";
    this.sDate = "";
    this.table.search("", true, false).draw();
  }

  public createSearch() {
    let searchs: string = `${this.sKey}|${this.sStatus}|${this.sActivityArea}|${this.sDate}|${this.sRateplan}`;
    this.table.search(searchs, true, false).draw();
  }

  ngOnInit() {
    moment.locale('fr');
    // Ajouter ici un code pour recuperer les candidats...
    const getElementData = (ev: any): any => {
      let el = $(ev.currentTarget).parents('tr');
      let data = this.table.row(el).data();
      return data;
    };
    const offerLists = $('#orders-table');
    offerLists
      .on('page.dt', () => {
        let info = this.table.page.info();
        localStorage.setItem('offer-page', info.page);
      })
      .on('init.dt', () => {
        setTimeout(() => {
          let offerPage: string = localStorage.getItem('offer-page');
          let pageNum: number = parseInt(offerPage);
          if (!_.isNaN(pageNum)) {
            this.table.page(pageNum).draw("page");
            this.table.ajax.reload(null, false);
          }
        }, 600);
      })
      .on('xhr.dt', (e, settings, json, xhr) => {
        this.Helper.setLoading(false);
      });

    this.table = offerLists.DataTable({
      pageLength: 10,
      page: 1,
      ordering: false, // Activer ou désactiver l'affichage d'ordre
      fixedHeader: true,
      responsive: false,
      "sDom": 'rtip',
      processing: true,
      serverSide: true,
      columnDefs: [
        {width: "15%", targets: 5},
        {width: "15%", targets: 6}
      ],
      columns: [
        {data: 'ID'},
        {data: 'reference'},
        {data: 'postPromote', render: (data, type, row, meta) => data},
        {
          data: 'featured', render: (data, t, r) => {
            let featured: string = data ? (r.featuredPosition == 1 ? 'À LA UNE' : "LA LISTE") : 'AUCUN';
            let style: string = data ? 'blue' : 'secondary';
            return `<span class="badge update-position badge-${style}">${featured}</span>`;
          }
        },
        {
          data: 'rateplan', render: (data, type, row) => {
            let plan: string = data === 'serein' ? 'SEREIN' : (data === 'premium' ? 'PREMIUM' : 'STANDARD');
            let style: string = data === 'serein' ? 'blue' : (data === 'premium' ? 'success' : 'secondary');
            return `<span class="badge edit-rateplan badge-${style}">${plan}</span>`;
          }
        },
        {
          data: 'dateLimit', render: (data) => {
            return moment(data).fromNow();
          }
        },
        {
          data: 'date_create', render: (data) => {
            return moment(data).fromNow();
          }
        },
        {
          data: 'paid', render: (data, type, row) => {
            let result: string = row.rateplan !== 'standard' ? (data ? 'TERMINÉE' : 'ATTENTE PAIEMENT') : 'AUCUN';
            let style: string = data ? 'blue' : (!data && row.rateplan !== 'standard' ? 'warning' : 'secondary');
            return `<span class="badge badge-pill badge-${style}">${result}</span>`;
          }
        },
        {
          data: 'activated', render: (data, type, row) => {
            let status = data && row.offer_status === 'publish' ? 'Publier' : (row.offer_status === 'pending' ? "En attente" : "Désactiver");
            let style = data && row.offer_status === 'publish' ? 'primary' : (row.offer_status === 'pending' ? "warning" : "danger");
            return `<span class="badge badge-${style}">${status}</span>`;
          }
        },
        {
          data: '_company', render: (data) => {
            if (_.isUndefined(data.name)) return 'Non renseigner';
            return `<span class="view-company" style="cursor: pointer">${data.name}</span>`;
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
                        <li><button class="btn btn-primary btn-icon-only btn-circle btn-air edit-offer" data-id="${row.ID}"><i class="la la-edit"></i></button></li>
                        <li><button class="btn btn-pink btn-icon-only btn-circle btn-air status-offer" data-status="false" data-id="${row.ID}"><i class="la la-eye-slash"></i></button></li>
                        <li><button class="btn btn-blue btn-icon-only btn-circle btn-air status-offer" data-status="true" data-id="${row.ID}" ><i class="la la-eye"></i></button></li>
                        <li><button class="btn btn-danger btn-icon-only btn-circle btn-air remove-offer" data-id="${row.ID}" ><i class="la la-trash"></i></button></li>
                     </ul>
                  </div>`
        }
      ],
      initComplete: (setting, json) => {
        $('#key-search').on('keypress', (event) => {
          this.sKey = event.currentTarget.value;
          if (event.which === 13) {
            this.createSearch();
          }
        });

        $("#type-status").on('change', (event) => {
          this.sStatus = event.currentTarget.value;
          this.createSearch();
        });

        $("#type-rateplan").on('change', (event) => {
          this.sRateplan = event.currentTarget.value;
          this.createSearch();
        });
      },
      ajax: {
        url: `${config.itApi}/offers/`,
        dataType: 'json',
        data: {
          //columns: false,
          order: false,
        },
        type: 'POST',
        beforeSend: (xhr) => {
          this.Helper.setLoading(true);
          let currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (currentUser && currentUser.token) {
            xhr.setRequestHeader("Authorization",
              `Bearer ${currentUser.token}`);
          }
        }
      }

    });

    $('#orders-table tbody')
      .on('click', '.view-company', e => {
        e.preventDefault();
        let __offer = getElementData(e);
        console.log(__offer);
        this.companyEdit.onOpen(__offer._company);
      })
      // Modifier l'offre (allez vers la page de modification)
      .on('click', '.edit-offer', (e) => {
        e.preventDefault();
        if (!this.authService.notUserAccess("editor")) return;

        let data = $(e.currentTarget).data();
        this.router.navigate(['/offer', parseInt(data.id)]);
      })
      // Modifier le mode tarifaire de l'offre
      .on('click', '.edit-rateplan', e => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.notUserAccess("editor")) return;
        if (!this.authService.notUserAccess("contributor")) return;

        let __offer = getElementData(e);
        let rateplan: string = __offer.rateplan;
        rateplan = _.isEmpty(rateplan) || _.isNull(rateplan) ? 'standard' : rateplan;
        this.ratePlanComp.onOpen(__offer.ID, rateplan);
      })
      // Modifier la position de l'offre
      .on('click', '.update-position', e => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.notUserAccess("contributor")) return;
        if (!this.authService.notUserAccess("editor")) return;

        let __offer = getElementData(e);
        this.featuredComp.open(__offer);
      })
      // Supprimer l'offre
      .on('click', '.remove-offer', e => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.notUserAccess("contributor")) return;
        if (!this.authService.notUserAccess("editor")) return;

        let __offer = getElementData(e);
        swal({
          title: 'Confirmation',
          html: `Vous voulez vraiment supprimer cette offre?<br> <b>${__offer.postPromote}</b>`,
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: "Supprimer",
          cancelButtonText: "Annuler"
        }).then((result) => {
          if (result.value) {
            this.Helper.setLoading(true);
            this.WPEndpoint.offers().id(__offer.ID).delete({force: true})
              .then(
                resp => {
                  swal('Succès', "L'offre a bien été effacer avec succès", 'success');
                  this.reload();
                  this.Helper.setLoading(false);
                },
                error => {
                  swal('Echec de suppression', "Une erreur s'est produite pendant la suppression de l'offre", 'error');
                  this.Helper.setLoading(false);
                });
            // For more information about handling dismissals please visit
            // https://sweetalert2.github.io/#handling-dismissals
          } else if (result.dismiss === swal.DismissReason.cancel) {

          }
        });
      })
      // Modifier le status de l'offre
      .on('click', '.status-offer', (e) => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.notUserAccess("editor")) return;
        if (!this.authService.notUserAccess("contributor")) return;

        let el = $(e.currentTarget).parents('tr');
        // Récuperer l'objet offre
        let __offer = this.table.row(el).data();
        // Récuperer les data attributs de l'element
        let data = $(e.currentTarget).data();
        let statusChange: boolean = data.status;
        let offerId: number = data.id;
        let confirmButton: string = statusChange ? 'Activer' : 'Désactiver';
        let cancelButton: string = "Annuler";
        if (__offer.activated === statusChange && __offer.offer_status === 'publish') {
          swal('', `Vous ne pouvez pas ${confirmButton.toLowerCase()} une offre qui es déja ${confirmButton.toLowerCase()}.`, 'warning');
          return false;
        }
        swal({
          title: '',
          text: `Vous voulez vraiment ${confirmButton.toLowerCase()} cette offre?`,
          type: statusChange ? 'warning' : 'error',
          showCancelButton: true,
          confirmButtonText: confirmButton,
          cancelButtonText: cancelButton
        }).then((result) => {
          if (result.value) {
            this.offerService
              .activated(offerId, statusChange)
              .subscribe(response => {
                swal(
                  '',
                  'Offre mis à jour avec succès',
                  'success'
                );
                this.table.ajax.reload(null, false);
              });
            // For more information about handling dismissals please visit
            // https://sweetalert2.github.io/#handling-dismissals
          } else if (result.dismiss === swal.DismissReason.cancel) {

          }
        });
      });

    // effectuer une recherche par date
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

}
