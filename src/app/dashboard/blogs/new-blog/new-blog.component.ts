import { Component, OnInit, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as _ from 'lodash';
import * as toastr from 'toastr';
import * as WPAPI from 'wpapi';
import * as Clipboard from 'clipboard';
import { AuthService } from '../../../services/auth.service';
import { config } from '../../../../environments/environment';
declare var $: any;


@Component({
   selector: 'app-new-blog',
   templateUrl: './new-blog.component.html',
   styleUrls: ['./new-blog.component.css'],
   encapsulation: ViewEncapsulation.None
})
export class NewBlogComponent implements OnInit {
   public WPEndpoint: any;
   public message: string = '';
   public loading: boolean = false;
   public Form: any = {};
   public medias: any = [];
   public tinyMCESettings: any = {
      language: 'fr_FR',
      menubar: false,
      content_css: [
         '//fonts.googleapis.com/css?family=Montserrat:300,300i,400,400i',
         '//www.tinymce.com/css/codepen.min.css'
      ],
      content_style: ".mce-content-body p { margin: 5px 0; }",
      skin_url: '/assets/tinymce/skins/lightgray',
      inline: false,
      statusbar: true,
      resize: true,
      browser_spellcheck: true,
      min_height: 230,
      width: 750,
      lineheight_formats: "8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 36pt",
      selector: 'textarea',
      toolbar: 'undo redo | image | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat ',
      plugins: ['lists', 'image'],
   };

   @Output() private publish = new EventEmitter<any>();
   @Output() private reload = new EventEmitter();

   @ViewChild('newActicleForm') public article: NgForm;

   constructor(
      private auth: AuthService
   ) {
      this.WPEndpoint = new WPAPI({
         endpoint: config.apiEndpoint,
      });
      let currentUser = this.auth.getCurrentUser();
      this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` })
   }

   ngOnInit() {
      $('#new-article-modal')
         .on('hide.bs.modal', (event) => {
            $('#new-article-modal').idleTimer("destroy");
            this.Form = { title: '', content: '' };
         });

      $('#media-modal')
         .on('hide.bs.modal', (event) => {
            setTimeout(() => {
               this.open();
            }, 600);
           
         });

      $('#new-article-modal')
         .on("idle.idleTimer", (event, elem, obj) => {
            if (this.article.valid) {
               toastr.warning('Enregistrement automatique en cours...', 'Auto-save');
               let values: any = this.article.value;
               localStorage.setItem('article', JSON.stringify(values));
            }
         })
         .on("active.idleTimer", (event, elem, obj, triggerevent) => {
            // function you want to fire when the user becomes active again
            toastr.clear();
            toastr.success('You returned to the active mode.', 'You are back.');
         });
   }

   onSubmitForm(form: NgForm): void {
      this.message = "";
      let image:any = document.querySelector('#featuredImage');
      if (form.valid) {
         let values: any = form.value;
         if (image.files.length > 0) {
            values.file = image.files[0];
         }
         this.publish.emit(values);
         setTimeout(() => {
            localStorage.removeItem('article');
            $('#new-article-modal').modal('hide');
         }, 600);
      } else {
         this.message = "Veuillez ajouter un titre et un contenue pour votre article.";
      }
   }


   loadMedia(): void {
      this.loading = true;
      this.WPEndpoint.media().then(resp => {
         let medias: any = _.reject(resp, ['media_type', 'file']);
         this.medias = _.clone(medias);
         this.loading = false;

         new Clipboard('.clipboard');
      })
   }

   voirMedia(): void {
      this.onDraft(this.article);
      console.log(this.article);
      setTimeout(() => {
         $('#media-modal').modal('show');
      }, 600);
      
      this.loadMedia();
   }

   ajouterMedia($event: any): void {
      if ($event.target.files && $event.target.files[0]) {
         this.loading = true;
         let image: any = $event.target.files[0];
         let articleTitle = $('input#title').val();
         this.WPEndpoint.media()
            // Specify a path to the file you want to upload, or a Buffer
            .file(image)
            .create({
               title: _.isEmpty(articleTitle) ? image.name : articleTitle,
               alt_text: _.isEmpty(articleTitle) ? image.name : articleTitle
            })
            .then((attach) => {
               // Your media is now uploaded: let's associate it with a post
               this.loadMedia();
            })
      }
   }

   onDraft(form: NgForm): void | null {
      let values: any = form.value;
      localStorage.setItem('article', JSON.stringify(values));

      $('#new-article-modal').modal('hide');
   }

   open(): void {
      // Vérifier s'il y a une article en cours
      let article = JSON.parse(localStorage.getItem('article'));
      if (article && _.isObject(article)) {
         this.Form = _.clone(article);
      }

      $("#new-article-modal").idleTimer(5000);
      $('#new-article-modal').modal('show');
   }

}
