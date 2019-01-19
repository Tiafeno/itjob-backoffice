import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { config } from '../../../environments/environment';
import { Helpers } from '../../helpers';
import swal from 'sweetalert';
import * as moment from 'moment';
import * as WPAPI from 'wpapi';
import * as _ from 'lodash';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { EditBlogComponent } from './edit-blog/edit-blog.component';
import { NewBlogComponent } from './new-blog/new-blog.component';
declare var $: any;

@Component({
   selector: 'app-blogs',
   templateUrl: './blogs.component.html',
   styleUrls: ['./blogs.component.css'],
   encapsulation: ViewEncapsulation.None
})
export class BlogsComponent implements OnInit {
   public WPEndpoint: any;
   public TABLE: any;
   public selectedBlog: any = {};

   @ViewChild(EditBlogComponent) private Editor: EditBlogComponent;
   @ViewChild(NewBlogComponent) private NewForm: NewBlogComponent;

   constructor(
      private blogService: BlogService,
      private authService: AuthService
   ) {

      this.WPEndpoint = new WPAPI({
         endpoint: config.apiEndpoint,
      });
      let currentUser = this.authService.getCurrentUser();
      this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` })
   }

   onNew(): void {
      this.NewForm.open();
   }

   onPublish(Form: any): void {
      Helpers.setLoading(true);
      let inputForm: any = _.clone(Form);
      let categories = this.WPEndpoint.categories().slug('blog');
      categories.then(cats => {
         let ctgs = cats[0];
         this.WPEndpoint.posts().create({
            title: inputForm.title,
            content: inputForm.title,
            status: 'publish',
            categories: [ctgs.id]
         })
            .then(
               response => {
                  let postId: number = response.id;
                  // "response" will hold all properties of your newly-created post,
                  // including the unique `id` the post was assigned on creation
                  console.log(inputForm);
                  if (!_.isUndefined(inputForm.file) ) {
                     this.WPEndpoint.media()
                        // Specify a path to the file you want to upload, or a Buffer
                        .file(inputForm.file)
                        .create({
                           title: inputForm.file,
                           alt_text: inputForm.file
                        })
                        .then((attach) => {
                           this.WPEndpoint.posts().id(postId).update({ featured_media: attach.id });
                           swal('Succès', "Votre article à bien été publier", 'info');
                           this.reload();
                           Helpers.setLoading(false);
                        })
                  } else {
                     swal('Succès', "Votre article à bien été publier", 'info');
                     this.reload();
                     Helpers.setLoading(false);
                  }


               },
               error => {
                  Helpers.setLoading(false);
               })
      })

   }

   reload(): void {
      this.TABLE.ajax.reload(null, false);
   }

   ngOnInit() {
      moment.locale('fr');
      const blogLists = $('#blog-table');
      this.TABLE = blogLists.DataTable({
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
            {
               data: 'post_status', render: (data, type, row, meta) => {
                  let status: string = data === "publish" ? "Publier" : "Brouillon";
                  let style: any = data === "publish" ? "blue" : "default";
                  return `<span class="badge badge-${style}">${status}</span>`;
               }
            },
            { data: 'post_date', render: (data) => { return moment(data).fromNow(); } },
            {
               data: null, render: (data, type, row) => {
                  //let action = ` <span class='edit-article badge badge-blue'>Modifier</span>`;
                  let action = ` <span class='delete-article badge badge-danger'>Supprimer</span>`;
                  return action;
               }
            }
         ],
         initComplete: (setting, json) => {
            $('#blog-table tbody')
               .on('click', '.edit-article', e => {
                  e.preventDefault();
                  let el = $(e.currentTarget).parents('tr');
                  this.selectedBlog = this.TABLE.row(el).data();
                  this.Editor.open();
               })
               .on('click', '.delete-article', e => {
                  var el = $(e.currentTarget).parents('tr');
                  let blog: any = this.TABLE.row(el).data();
                  swal({
                     title: "Êtes-vous sûr?",
                     text: `Supprimer l'article «${blog.post_title}»`,
                     icon: "warning",
                     buttons: true,
                     dangerMode: true,
                  } as any)
                     .then((willDelete) => {
                        if (willDelete) {
                           this.WPEndpoint.posts().id(blog.ID).delete()
                              .then(response => {
                                 swal('Succès', "Article supprimer avec succès", 'info');
                                 this.reload();
                              });
                        } else {

                        }
                     });
               })
         },
         ajax: {
            url: `${config.itApi}/blogs/`,
            dataType: 'json',
            data: {
               //columns: false,
               order: false,
            },
            type: 'GET',
            beforeSend: (xhr) => {
               let currentUser = this.authService.getCurrentUser();
               if (currentUser && currentUser.token) {
                  xhr.setRequestHeader("Authorization", `Bearer ${currentUser.token}`);
               }
            }
         }
      });
   }

}
