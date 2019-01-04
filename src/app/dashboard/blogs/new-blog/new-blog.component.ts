import { Component, OnInit, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as _ from 'lodash';
import * as toastr from 'toastr';
declare var $: any;

@Component({
   selector: 'app-new-blog',
   templateUrl: './new-blog.component.html',
   styleUrls: ['./new-blog.component.css'],
   encapsulation: ViewEncapsulation.None
})
export class NewBlogComponent implements OnInit {
   public message: string = '';
   public loading: boolean = false;
   public Form: any = {};
   public tinyMCESettings: any = {
      skin_url: '/assets/tinymce/skins/lightgray',
      inline: false,
      statusbar: true,
      resize: true,
      browser_spellcheck: true,
      min_height: 320,
      width: 750,
      selector: 'textarea',
      plugins: '',
   };

   @Output() private publish = new EventEmitter<any>();
   @Output() private reload = new EventEmitter();

   @ViewChild('newActicleForm') public article: NgForm;

   constructor() { }

   ngOnInit() {
      $('#new-article-modal')
         .on('hide.bs.modal', (event) => {
            $('#new-article-modal').idleTimer("destroy");
            this.Form = {title: '', content: ''};
         });

      $('#new-article-modal')
         .on("idle.idleTimer", (event, elem, obj) => {
            if (this.article.valid) {
               toastr.warning('You can call any function when the user goes idle.', 'Idle time');
               this.onDraft(this.article);
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
      if (form.valid) {
         let values: any = form.value;
         this.publish.emit(values);
         setTimeout(() => {
            localStorage.removeItem('article');
            $('#new-article-modal').modal('hide');
         }, 600);
      } else {
         this.message = "Veuillez ajouter un titre et un contenue pour votre article.";
      }
   }

   onDraft(form: NgForm): void|null {
      if (!form.valid) return null;
      let values:any = form.value;
      localStorage.setItem('article', JSON.stringify(values));
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
