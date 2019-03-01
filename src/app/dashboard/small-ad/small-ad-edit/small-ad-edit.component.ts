import {Component, OnInit} from '@angular/core';
import {RequestService} from "../../../services/request.service";
import {AuthService} from "../../../services/auth.service";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import * as WPAPI from 'wpapi';
import * as _ from "lodash";
import {config} from "../../../../environments/environment";
import {Helpers} from "../../../helpers";
import swal from "sweetalert2";

@Component({
  selector: 'app-small-ad-edit',
  templateUrl: './small-ad-edit.component.html',
  styleUrls: ['./small-ad-edit.component.css']
})
export class SmallAdEditComponent implements OnInit {
  public ID: number = 0;
  public Type: Array<any> = [];
  public Categories: Array<any> = [];
  public Town: Array<any> = [];
  public Regions: Array<any> = [];
  public Ad: any = {};
  public User: any = {};

  public loading: boolean = false;
  public loadingCTG: boolean = false;
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
    let currentUser = this.auth.getCurrentUser();
    this.WPEndpoint.setHeaders({Authorization: `Bearer ${currentUser.token}`});
    var namespace = 'wp/v2'; // use the WP API namespace
    var annonceRoute = '/annonce/(?P<id>\\d+)'; // route string - allows optional ID parameter
    this.WPEndpoint.annonce = this.WPEndpoint.registerRoute(namespace, annonceRoute);
  }

  ngOnInit() {
    Helpers.setLoading(true);
    this.Type = [
      {name: "Offre", id: 1},
      {name: "Demande", id: 2},
    ];

    const categories = this.request.getCategorie();
    const regions = this.request.getRegion();
    const towns = this.request.getTown();
    Observable.forkJoin([categories, regions, towns]).subscribe(terms => {
      this.Categories = _.cloneDeep(terms[0]);
      this.Regions = _.cloneDeep(terms[1]);
      this.Town = _.cloneDeep(terms[2]);
    });

    this.route.parent.params.subscribe(params => {
      this.ID = params.id;
      this.Ad.content = {};
      this.Ad.title = {};
      this.Ad.price = 0;
      this.WPEndpoint.annonce().id(this.ID).then(annonce => {
        let Annonce: any = _.clone(annonce);
        Helpers.setLoading(false);
        this.Ad = _.clone(Annonce);
        this.Ad.type = _.isObject(Annonce.type) ? parseInt(Annonce.type.value) : null;
        this.Ad.town = _.isArray(Annonce.city) ? Annonce.city[0] : null;
        this.Ad.region = _.isArray(Annonce.region) ? Annonce.region[0] : null;
        this.Ad.categorie = _.isArray(Annonce.categorie) ? Annonce.categorie[0] : null;
        let post_type = _.clone(Annonce.client.postType);
        if (post_type !== 'candidate' && post_type !== 'company') {
          this.User.name = _.clone(Annonce.annonce_author.data.display_name);
          this.User.email = _.clone(Annonce.annonce_author.data.user_email);
          this.User.role = "Administrateur";
          this.User.view_link = null;
        } else {
          let pI: any = {};
          let email: string = '';
          if (post_type === 'candidate') {
            pI = Annonce.client.privateInformations;
          }
          this.User.role = 'candidate' === post_type ? "Particulier" : 'Entreprise';
          this.User.name = 'candidate' === post_type ? `${pI.firstname} ${pI.lastname}` : Annonce.client.title;
          this.User.email = 'candidate' === post_type ? pI.author.data.user_email : Annonce.client.email;
          this.User.view_link = 'candidate' === post_type ? ['/candidate', Annonce.client.ID, 'edit'] : ['/company-lists'];
        }
        console.log(Annonce);
      });
    });

  }

  public onSaveAd(Form: NgForm): void {
    if (Form.valid) {
      let value: any = Form.value;
      this.loading = true;
      Helpers.setLoading(true);
      this.WPEndpoint.annonce().id(this.ID).update({
        title: value.title,
        content: value.description,
        categorie: [value.categorie],
        type: value.type,
        region: [value.region],
        city: [value.town],
        address: value.address,
        price: parseInt(value.price),
        cellphone: value.phone
      }).then(resp => {
        console.log(resp);
        swal("Succès", "Annonce mise à jours avec succès", 'info');
        this.loading = false;
        Helpers.setLoading(false);
      });
    }
  }

}
