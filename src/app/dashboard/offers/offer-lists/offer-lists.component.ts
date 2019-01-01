import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import swal from 'sweetalert2';
import { config } from '../../../../environments/environment';
import * as moment from 'moment';
import { OfferService } from '../../../services/offer.service';
import { Helpers } from '../../../helpers';
import { FeaturedOfferComponent } from '../../../directives/offers/featured-offer/featured-offer.component';
import { RatePlanComponent } from '../../../directives/offers/rate-plan/rate-plan.component';
import { AuthService } from '../../../services/auth.service';
import { DeadlineOfferComponent } from '../../../directives/offers/deadline-offer/deadline-offer.component';
declare var $: any;
@Component({
   selector: 'app-offer-lists',
   templateUrl: './offer-lists.component.html',
   styleUrls: ['./offer-lists.component.css'],
   encapsulation: ViewEncapsulation.None
})

export class OfferListsComponent implements OnInit {
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

   constructor(
      private router: Router,
      private offerService: OfferService,
      private authService: AuthService
   ) {
      this.Helper = Helpers
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
      $('.page-content').find('.selectpicker').selectpicker("refresh");
      this.table.search("", true, false).draw();
   }

   public createSearch() {
      let searchs: string = `${this.sKey}|${this.sStatus}|${this.sActivityArea}|${this.sDate}|${this.sRateplan}`;
      this.table.search(searchs, true, false).draw();
   }

   ngOnInit() {
      moment.locale('fr');
      // Ajouter ici un code pour recuperer les candidats...
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
         fixedHeader: true,
         responsive: false,
         "sDom": 'rtip',
         processing: true,
         serverSide: true,
         columns: [
            { data: 'ID' },
            { data: 'postPromote', render: (data, type, row, meta) => data },
            { data: 'reference' },
            {
               data: '_featured', render: data => {
                  let featured: string = data ? 'À LA UNE' : 'AUCUN';
                  let style: string = data ? 'blue' : 'secondary';
                  return `<span class="badge update-position badge-${style}">${featured}</span>`;
               }
            },
            {
               data: 'rateplan', render: (data, type, row) => {
                  let plan: string = data === 'sereine' ? 'SEREINE' : (data === 'premium' ? 'PREMIUM' : 'STANDARD');
                  let style: string = data === 'sereine' ? 'blue' : (data === 'premium' ? 'success' : 'secondary');
                  return `<span class="badge edit-rateplan badge-${style}">${plan}</span>`;
               }
            },
            { data: 'dateLimit', render: (data) => { return moment(data).fromNow(); } },
            {
               data: 'activated', render: (data, type, row) => {
                  let status = data && row.offer_status === 'publish' ? 'Publier' : (row.offer_status === 'pending' ? "En attente" : "Désactiver");
                  let style = data && row.offer_status === 'publish' ? 'primary' : (row.offer_status === 'pending' ? "warning" : "danger");
                  return `<span class="badge badge-${style}">${status}</span>`;
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
                  <li><button class="btn btn-primary btn-icon-only btn-circle btn-air edit-offer" data-id="${row.ID}"><i class="la la-edit"></i></button></li>
                  <li><button class="btn btn-pink btn-icon-only btn-circle btn-air status-offer" data-status="false" data-id="${row.ID}"><i class="la la-eye-slash"></i></button></li>
                  <li><button class="btn btn-blue btn-icon-only btn-circle btn-air status-offer" data-status="true" data-id="${row.ID}" ><i class="la la-eye"></i></button></li>
                </ul>
              </div>
            `
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
         // Modifier l'offre (allez vers la page de modification)
         .on('click', '.edit-offer', (e) => {
            e.preventDefault();
            // Réfuser l'accès au commercial de modifier cette option
            if (!this.authService.hasAccess(false)) { // Sans alert
               let el = $(e.currentTarget).parents('tr');
               let Offer = this.table.row(el).data();
               this.deadlineOfferEditor.open(Offer);
               return;
            }

            let data = $(e.currentTarget).data();
            this.router.navigate(['/offer', parseInt(data.id)]);
         })
         // Modifier le mode tarifaire de l'offre
         .on('click', '.edit-rateplan', e => {
            e.preventDefault();
            // Réfuser l'accès au commercial de modifier cette option
            if (!this.authService.hasAccess()) return;

            let el = $(e.currentTarget).parents('tr');
            let DATA = this.table.row(el).data();
            let rateplan: string = DATA.rateplan;
            rateplan = _.isEmpty(rateplan) || _.isNull(rateplan) ? 'standard' : rateplan;
            this.ratePlanComp.onOpen(DATA.ID, rateplan);
         })
         // Modifier la position de l'offre
         .on('click', '.update-position', e => {
            e.preventDefault();
            // Réfuser l'accès au commercial de modifier cette option
            if (!this.authService.hasAccess()) return;

            let el = $(e.currentTarget).parents('tr');
            let DATA = this.table.row(el).data();
            this.featuredComp.open(DATA);
         })
         // Modifier le status de l'offre
         .on('click', '.status-offer', (e) => {
            e.preventDefault();
            // Réfuser l'accès au commercial de modifier cette option
            if (!this.authService.hasAccess()) return;

            let el = $(e.currentTarget).parents('tr');
            // Récuperer l'objet offre
            let DATA = this.table.row(el).data();
            // Récuperer les data attributs de l'element
            let data = $(e.currentTarget).data();
            let statusChange: boolean = data.status;
            let offerId: number = data.id;
            let confirmButton: string = statusChange ? 'Activer' : 'Désactiver';
            let cancelButton: string = "Annuler";
            if (DATA.activated === statusChange && DATA.offer_status === 'publish') {
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
                        )
                        this.table.ajax.reload(null, false);
                     })
                  // For more information about handling dismissals please visit
                  // https://sweetalert2.github.io/#handling-dismissals
               } else if (result.dismiss === swal.DismissReason.cancel) {

               }
            })
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
