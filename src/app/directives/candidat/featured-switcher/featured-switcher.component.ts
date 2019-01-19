import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
declare var $: any;
import { config } from '../../../../environments/environment';
import * as moment from 'moment';
import { AuthService } from '../../../services/auth.service';

@Component({
   selector: 'app-featured-switcher',
   templateUrl: './featured-switcher.component.html',
   styleUrls: ['./featured-switcher.component.css']
})
export class FeaturedSwitcherComponent implements OnInit, AfterViewInit {
   private postId: number = 0;
   public position: number;
   public dateLimit: any = "";
   public currentPosition: number;
   public loading: boolean = false;
   public warning: boolean = false

   @Output() refresh = new EventEmitter();

   constructor(
      private auth: AuthService,
      private Http: HttpClient
   ) { }

   public onOpen(candidate: any): void {
      this.position = candidate.featured;
      this.currentPosition = candidate.featured;
      if (this.currentPosition && !_.isNull(candidate.featuredDateLimit)) {
         this.dateLimit = moment(candidate.featuredDateLimit).format('YYYY-MM-DD HH:mm:ss')
      }
      this.postId = _.cloneDeep(candidate.ID);
      $('#edit-featured-modal').modal('show');

   }

   public onUpdate(): boolean {
      if (!this.auth.notUserAccess("contributor")) return;
      if (!this.auth.notUserAccess("editor")) return;

      if (this.position === this.currentPosition && this.position === 0) {
         this.warning = true;
         return false;
      }
      this.loading = true;
      let dateUnix = moment(this.dateLimit).utcOffset(3).unix();
      let changePosition = this.Http.get(`${config.itApi}/candidate/${this.postId}?ref=featured&val=${this.position}&datelimit=${dateUnix}`, { responseType: 'json' });
      changePosition.subscribe(response => {
         let resp: any = response;
         this.loading = false;
         if (resp.success) {
            $('#edit-featured-modal').modal('hide');
            this.refresh.emit();
         }
      })
   }

   ngOnInit(): void {
      $('#edit-featured-modal')
         .on('hidden.bs.modal', e => {
            this.warning = false;
            this.dateLimit = '';
         })
   }

   ngAfterViewInit(): void {
      //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      //Add 'implements AfterViewInit' to the class.
   }

}
