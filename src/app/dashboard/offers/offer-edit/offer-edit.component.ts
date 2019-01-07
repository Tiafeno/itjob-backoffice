import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { OfferService } from '../../../services/offer.service';
import { Helpers } from '../../../helpers';
import * as _ from 'lodash';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { RequestService } from '../../../services/request.service';
import { CompanyEditComponent } from '../../company/company-edit/company-edit.component';
declare var $: any;
@Component({
   selector: 'app-offer-edit',
   templateUrl: './offer-edit.component.html',
   styleUrls: ['./offer-edit.component.css']
})
export class OfferEditComponent implements OnInit {
   public ID: number;
   public companyId: number = 0;
   public loadingForm: boolean = false;
   public loadingSave: boolean = false;
   public townLoading: boolean = false;
   public areaLoading: boolean = false;
   public Offer: any = {};
   public Editor: any = {};
   public Towns: any = [];
   public Regions: any = {};
   public branchActivitys: any = [];
   public tinyMCESettings: any = {
      skin_url: '/assets/tinymce/skins/lightgray',
      inline: false,
      statusbar: true,
      resize: true,
      browser_spellcheck: true,
      min_height: 230,
      selector: 'textarea',
      plugins: '',
   };

   @ViewChild(CompanyEditComponent) private companyEdit: CompanyEditComponent;

   constructor(
      private route: ActivatedRoute,
      private router: Router,
      private offerServices: OfferService,
      private requestServices: RequestService
   ) { }

   ngOnInit() {
      Helpers.setLoading(true);
      this.route.parent.params.subscribe(params => {
         this.ID = params.id;
         this.offerServices
            .getOffer(this.ID)
            .subscribe(offer => {
               this.Offer = _.cloneDeep(offer);
               this.loadForm(this.Offer);
            });
      });
   }

   townLoadingFn() {
      this.townLoading = true;
      this.requestServices.getTown().subscribe(x => {
         this.Towns = _.cloneDeep(x);
         this.townLoading = false;
      })
   }

   areaLoadingFn() {
      this.areaLoading = true;
      this.requestServices.getArea().subscribe(x => {
         this.branchActivitys = _.cloneDeep(x)
         this.areaLoading = false;
      })
   }

   loadForm(Offer: any) {
      this.offerServices.collectDataEditor()
         .subscribe(observer => {
            this.townLoadingFn();
            this.areaLoadingFn();

            this.Regions = _.cloneDeep(observer[0].body);
            this.Editor = Offer;
            let contract = this.Editor.contractType;
            let region = this.Editor.region;
            let abranch = this.Editor.branch_activity;
            let town = this.Editor.town;
            this.Editor.contractType = !_.isNull(contract) && !_.isEmpty(contract) ? contract.value : '';
            this.Editor.region = _.isObject(region) ? region.term_id : '';
            this.Editor.branch_activity = _.isObject(abranch) ? abranch.term_id : '';
            this.Editor.town = _.isObject(town) ? town.term_id : '';
            this.Editor.offer_status = Offer.activated && Offer.offer_status === 'publish' ? 1 : (Offer.offer_status === 'pending' ? "pending" : 0);
            this.Editor.rateplan = _.isNull(Offer.rateplan) || _.isEmpty(Offer.rateplan) ? 'standard' : Offer.rateplan;
            // Load script
            Helpers.setLoading(false);
            this.loadingForm = true;
            this.loadScript();
         })

   }

   loadScript() {
      setTimeout(() => {

         $('.input-group.date').datetimepicker({
            format: "mm/dd/yyyy",
            minView: "days",
            todayBtn: false,
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
         });

         $(".select2").select2({
            element: 'tag label label-success',
            placeholder: "Select a item",
            matcher: (params, data) => {
               var inTerm = [];
               if ($.trim(params.term) === '') {
                  return data;
               }
               if (typeof data.text === 'undefined') {
                  return null;
               }
               var dataContains = data.text.toLowerCase();
               var paramTerms = $.trim(params.term).split(' ');
               $.each(paramTerms, (index, value) => {
                  if (dataContains.indexOf($.trim(value).toLowerCase()) > -1) {
                     inTerm.push(true);
                  } else {
                     inTerm.push(false);
                  }
               });
               var isEveryTrue = _.every(inTerm, (boolean) => {
                  return boolean === true;
               });
               if (isEveryTrue) {
                  var modifiedData = $.extend({}, data, true);
                  return modifiedData;
               } else {
                  return null;
               }
            }
         });
      }, 650);
   }

   onSubmitForm(editForm: NgForm): boolean {
      if (editForm.valid) {
         this.loadingSave = true;
         const Value = editForm.value;
         this.offerServices
            .saveOffer(Value)
            .subscribe(response => {
               swal({
                  title: "Modification",
                  text: 'La modification a été effectuée',
                  icon: "success",
               } as any)
                  .then(name => {
                     this.loadingSave = false;
                     this.router.navigate([this.router.url]);
                  });
            });

      } else {
         return false;
      }
   }

   // Modifier le compte proféssionnel
   editCompany(event: any) {
      let element = event.currentTarget;
      let Company: any = this.Offer.__info; 
      this.companyEdit.onOpen(Company);
   }

   onChangeStatus(newValue) {
      this.Editor.activated = newValue === 'pending' ? false : true;
   }

   customSearchFn(term: string, item: any) {
      var inTerm = [];
      term = term.toLocaleLowerCase();
      var paramTerms = $.trim(term).split(' ');
      $.each(paramTerms, (index, value) => {
         if (item.name.toLocaleLowerCase().indexOf($.trim(value).toLowerCase()) > -1) {
            inTerm.push(true);
         } else {
            inTerm.push(false);
         }
      });
      return _.every(inTerm, (boolean) => boolean === true);
   }

}
