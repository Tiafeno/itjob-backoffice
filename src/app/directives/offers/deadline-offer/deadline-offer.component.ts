import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { config, dateTimePickerFr } from '../../../../environments/environment';
declare var $: any;

@Component({
   selector: 'app-deadline-offer',
   templateUrl: './deadline-offer.component.html',
   styleUrls: ['./deadline-offer.component.css']
})
export class DeadlineOfferComponent implements OnInit {
   public dateLimit: any = "";
   public offerId: number = 0;
   public loading: boolean = false;
   public LLL: string = "";

   @Output() private refresh = new EventEmitter();

   constructor(
      private Http: HttpClient
   ) { }

   ngOnInit() {
      moment.locale('fr');
      $.fn.datepicker.dates['fr'] = dateTimePickerFr;
      $('.input-group.date.no-time')
         .datepicker({
            format: "mm/dd/yyyy",
            language: 'fr',
            todayBtn: false,
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
         })
         .on('changeDate', (ev) => {
            this.LLL = moment(ev.date).format('LLL');
            this.dateLimit = moment(ev.date).format('MM/DD/YYYY');
         });

      $('#edit-deadline-offer-modal')
         .on('hidden.bs.modal', (e) => {
            this.dateLimit = '';
         })
   }

   public onUpdate(): void {
      this.loading = true;
      let changeDateLimit = this.Http.get(`${config.itApi}/offer/${this.offerId}?ref=update_date_limit&datelimit=${this.dateLimit}`,
         { responseType: 'json' });
      changeDateLimit.subscribe(
         response => {
            let resp: any = response;
            this.loading = false;
            if (resp.success) {
               $('#edit-deadline-offer-modal').modal('hide');
               this.refresh.emit();
            }
         },
         error => {
            this.loading = false;
         });
   }

   public open(Offer: any): void {
      if (!_.isEmpty(Offer)) {
         this.offerId = Offer.ID;
         this.dateLimit = _.isEmpty(Offer.dateLimit) || _.isNull(Offer.dateLimit) ? '' : _.cloneDeep(Offer.dateLimit);
         this.LLL = moment(this.dateLimit).format('LLL');
         $('#edit-deadline-offer-modal').modal('show');
      }

   }

}
