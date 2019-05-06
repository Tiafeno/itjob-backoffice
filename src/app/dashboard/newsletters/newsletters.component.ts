import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { config } from '../../../environments/environment';
import { ViewNewsletterComponent } from '../newsletter/view-newsletter/view-newsletter.component';
import { NewNewsletterComponent } from './new-newsletter/new-newsletter.component';
import { HttpClient } from '@angular/common/http';
import * as WPAPI from 'wpapi';
import swal from 'sweetalert2';
import { Helpers } from '../../helpers';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
declare var $: any;

@Component({
   selector: 'app-newsletters',
   templateUrl: './newsletters.component.html',
   styleUrls: ['./newsletters.component.css']
})
export class NewslettersComponent implements OnInit {
   public TABLE: any;
   public letter: any = {};
   public offset: number = 0;
   public WPEndpoint: any;

   @ViewChild(ViewNewsletterComponent) private viewNews: ViewNewsletterComponent;
   @ViewChild(NewNewsletterComponent) private newNews: NewNewsletterComponent;

   constructor(
      private Http: HttpClient,
      private authService: AuthService
   ) {

      this.WPEndpoint = new WPAPI({
         endpoint: config.apiEndpoint,
      });
      let currentUser = this.authService.getCurrentUser();
      this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` })
   }

   sendMail(form: any) {
      return new Promise((resolve, reject) => {
         this.Http.post(`${config.itApi}/newsletters/`, form)
            .subscribe(
               response => {
                  let data: any = response;
                  if (data.success) resolve(data);
                  reject(data.message);
               },
               error => {
                  reject(error);
               });
      })
   }

   onNewNewsletter(): void {
      this.newNews.toggleDialog();
   }

   onSendNewsletter(Form: NgForm): void {
      if (Form.valid) {
         let values: any = _.clone(Form.value);
         let form = new FormData();
         form.append('to', values.send);
         form.append('subject', values.subject);
         form.append('content', values.content);
         Helpers.setLoading(true);

         let categories = this.WPEndpoint.categories().slug('newsletter');
         categories.then(cats => {
            if (_.isEmpty(cats)) {
               swal("Erreur", "Categorie 'newsletter' est introuvable dans l'article", "warning");
               return false;
            }
            let ctgs = cats[0];

            this.sendMail(form).then(
               response => {
                  this.WPEndpoint.posts().create({
                     title: values.subject,
                     content: values.content,
                     status: 'publish',
                     categories: [ctgs.id]
                  })
                     .then(post => {
                        swal('Succès', "Lettre d'information envoyer avec succès", 'success');
                        this.TABLE.ajax.reload(null, false);
                        this.newNews.toggleDialog();
                        Helpers.setLoading(false);
                     });
               }, error => {
                  let errno: string = _.isEmpty(error) ? "Une erreur s'est produite pendant l'envoie du lettre d'information" : error;
                  swal("Erreur d'envoie", errno, "error");
                  Helpers.setLoading(false);
               })
         });
      }
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

      $('#newsletter-table tbody')
         .on('click', '.view-newsletter', e => {
            e.preventDefault();
            let el = $(e.currentTarget).parents('tr');
            let data = this.TABLE.row(el).data();
            this.letter = _.clone(data);
            this.viewNews.toggleDialog();
         })
   }

}
