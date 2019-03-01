import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import {RequestService} from "../../../services/request.service";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {config} from "../../../../environments/environment";
import * as WPAPI from 'wpapi';
import * as _ from 'lodash';
import {Helpers} from "../../../helpers";
import {Observable} from "rxjs";
import swal from "sweetalert2";

@Component({
  selector: 'app-work-edit',
  templateUrl: './work-edit.component.html',
  styleUrls: ['./work-edit.component.css']
})
export class WorkEditComponent implements OnInit {
  public ID: number = 0;
  public Type: Array<any> = [];
  public Town: Array<any> = [];
  public Regions: Array<any> = [];
  public Work: any = {};
  public User: any = {};

  public loading: boolean = false;
  public loadingRegion: boolean = false;
  public WPEndpoint: any;
  public tinyMCESettings: any = {
    language: 'fr_FR',
    menubar: false,
    content_css: [
      '//fonts.googleapis.com/css?family=Montserrat:300,300i,400,400i',
      '//www.tinymce.com/css/codepen.min.css'
    ],
    skin_url: '/assets/tinymce/skins/lightgray',
    inline: false,
    statusbar: true,
    resize: true,
    browser_spellcheck: true,
    min_height: 230,
    selector: 'textarea',
    toolbar: 'undo redo | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat ',
    plugins: ['lists'],
  };

  constructor(
    private request: RequestService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {
    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    const currentUser = this.auth.getCurrentUser();
    const namespace = 'wp/v2';
    const worksRoute = '/works/(?P<id>\\d+)';
    this.WPEndpoint.setHeaders({Authorization: `Bearer ${currentUser.token}`});
    this.WPEndpoint.works = this.WPEndpoint.registerRoute(namespace, worksRoute);
  }

  ngOnInit() {
    Helpers.setLoading(true);
    this.Work.content = {};
    this.Work.title = {};
    this.Type = [
      {name: "Offre", id: 1},
      {name: "Demande", id: 2},
    ];
    let regions = this.request.getRegion();
    let towns = this.request.getTown();
    Observable.forkJoin([regions, towns]).subscribe(terms => {
      this.Regions = _.cloneDeep(terms[0]);
      this.Town = _.cloneDeep(terms[1]);
    });
    this.route.parent.params.subscribe(params => {
      this.ID = params.id;
      this.Work.price = 0;
      this.WPEndpoint.works().id(this.ID).then(work => {
        Helpers.setLoading(false);

        let Work: any = _.clone(work);
        this.Work = _.clone(Work);
        this.Work.type = _.isObject(Work.type) ? parseInt(Work.type.value) : null;
        this.Work.town = _.isArray(Work.city) ? Work.city[0] : null;
        this.Work.region = _.isArray(Work.region) ? Work.region[0] : null;
        let post_type = _.clone(Work.client.postType);
        if (post_type !== 'candidate' && post_type !== 'company') {
          this.User.name = _.clone(Work.annonce_author.data.display_name);
          this.User.email = _.clone(Work.annonce_author.data.user_email);
          this.User.role = "Administrateur";
          this.User.view_link = null;
        }
        else {
          let pI: any = {};
          let email: string = '';
          if (post_type === 'candidate') {
            pI = Work.client.privateInformations;
          }
          this.User.role = 'candidate' === post_type ? "Particulier" : 'Entreprise';
          this.User.name = 'candidate' === post_type ? `${pI.firstname} ${pI.lastname}` : Work.client.title;
          this.User.email = 'candidate' === post_type ? pI.author.data.user_email : Work.client.email;
          this.User.view_link = 'candidate' === post_type ? ['/candidate', Work.client.ID, 'edit'] : ['/company-lists'];
        }
        console.log(Work);
      });
    });

  }

  public onSaveWork(Form: NgForm): void {
    if (Form.valid) {
      let value: any = Form.value;
      this.loading = true;
      Helpers.setLoading(true);
      this.WPEndpoint.works().id(this.ID).update({
        title: value.title,
        content: value.description,
        type: value.type,
        region: [value.region],
        city: [value.town],
        address: value.address,
        price: parseInt(value.price),
        email: value.email,
        cellphone: value.phone
      }).then(resp => {
        swal("Succès", "Annonce mise à jours avec succès", 'info');

        this.loading = false;
        Helpers.setLoading(false);
      });
    }
  }

}
