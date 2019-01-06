import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { config } from '../../../environments/environment';
import { ViewNewsletterComponent } from '../newsletter/view-newsletter/view-newsletter.component';
import { NewNewsletterComponent } from './new-newsletter/new-newsletter.component';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert';
import { Helpers } from '../../helpers';
import { Observable } from 'rxjs';
declare var $: any;

@Component({
   selector: 'app-newsletters',
   templateUrl: './newsletters.component.html',
   styleUrls: ['./newsletters.component.css']
})
export class NewslettersComponent implements OnInit {
   public TABLE: any;
   public offset: number = 0;

   @ViewChild(ViewNewsletterComponent) private viewNews: ViewNewsletterComponent;
   @ViewChild(NewNewsletterComponent) private newNews: NewNewsletterComponent;

   constructor(
      private Http: HttpClient
   ) { }

   sendWelcomeMail(): void {
      this.getUsers()
         .subscribe(users => {
            let query: any = _.clone(users);
            let avail_roles = query.avail_roles;
            let totalUsers = query.total_users;
            let totalPage = Math.ceil(totalUsers / 20); // 20 is users per page
            swal({
               title: "Êtes-vous sûr?",
               text: "Envoyer le message de bienvenue à tous les utilisateurs",
               icon: "warning",
               buttons: true,
               dangerMode: true,
            } as any)
               .then((willSend) => {
                  if (willSend) {
                     let formData = new FormData();
                     formData.append('post', JSON.stringify({ title: 'Bonjour', for: 'welcome' }));
                     this.asyncCall(totalPage, formData);
                     Helpers.setLoading(true);
                  } else {

                  }
               });
         })
   }

   sendMail(query: any) {
      return new Promise((resolve, reject) => {
         this.Http.post(`${config.itApi}/newsletters/`, query)
            .subscribe(
               response => {
                  let data: any = response;
                  if (data.success)
                     resolve(data);
               },
               error => {
                  reject(error);
               });
      })
   }

   getUsers():Observable<any> {
      return this.Http.get(`${config.itApi}/users/`, { responseType: 'json' });
   }

   async asyncCall(totalPage: number, form: FormData) {
      for (let page = 1; page <= totalPage; page++) {
         let offset = page * 20;
         form.append('query', JSON.stringify({ number: 20, offset: offset }));
         await this.sendMail(form);
         this.offset = offset;
      }
      Helpers.setLoading(false);
      swal('Succès', 'Message envoyer avec succès', 'info');
   }

   ngOnInit() {
      moment.locale('fr');
      const newsLetterLists = $('#newsletter-table');
      this.TABLE = newsLetterLists.DataTable({
         pageLength: 10,
         page: 0,
         fixedHeader: true,
         responsive: false,
         "sDom": 'rtip',
         processing: true,
         serverSide: true,
         columns: [
            { data: 'ID' },
            { data: 'post_title', render: (data, type, row, meta) => data },
            { data: 'post_date', render: (data) => { return moment(data).fromNow(); } },
            {
               data: null, render: (data, type, row) => {
                  return `<span data-id='${row.ID}' class='view-newsletter badge badge-blue'>Voir</span>`;
               }
            }
         ],
         initComplete: (setting, json) => {

         },
         ajax: {
            url: `${config.itApi}/newsletters/`,
            dataType: 'json',
            data: {
               //columns: false,
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
   }

}
