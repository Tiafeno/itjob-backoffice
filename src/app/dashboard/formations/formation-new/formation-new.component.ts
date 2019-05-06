import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import * as WPAPI from 'wpapi';
import {config} from "../../../../environments/environment";
import {AuthService} from "../../../services/auth.service";
import {NgForm} from "@angular/forms";
import * as moment from "moment";
import swal from "sweetalert2";
import {RequestService} from "../../../services/request.service";
import {Observable} from "rxjs";
import {Helpers} from "../../../helpers";
import * as _ from "lodash";
declare var $:any;
@Component({
  selector: 'app-formation-new',
  templateUrl: './formation-new.component.html',
  styleUrls: ['./formation-new.component.css']

})
export class FormationNewComponent implements OnInit {
  public loading: boolean = false;
  public loadingRegion: boolean = false;
  public loadingArea: boolean = false;
  public Regions: Array<any> = [];
  public activityAreas: Array<any> = [];
  public Formation: any = {};
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
  @Output() public refresh = new EventEmitter();
  constructor(
    private auth: AuthService,
    private request: RequestService
  ) {
    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    let currentUser = this.auth.getCurrentUser();
    this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` });
    var namespace = 'wp/v2'; // use the WP API namespace
    var formationRoute = '/formation/(?P<id>\\d+)'; // route string - allows optional ID parameter
    this.WPEndpoint.formation = this.WPEndpoint.registerRoute(namespace, formationRoute);
  }

  ngOnInit() {
    moment.locale('fr');
  }

  public openModal(): void {
    Helpers.setLoading(true);
    let areas = this.request.getArea();
    let regions = this.request.getRegion();
    Observable.forkJoin([areas, regions]).subscribe(resp => {
      this.Regions = _.cloneDeep(resp[1]);
      this.activityAreas = _.cloneDeep(resp[0]);
      Helpers.setLoading(false);
      $('#new-formation-modal').modal('show');
    });

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


  public onSaveFormation(Form: NgForm): void {
    if (Form.valid) {
      this.loading = true;
      let currentUser = this.auth.getCurrentUser();
      let dateLimit = this.Formation.datelimit;
      this.WPEndpoint.formation().create({
        title: this.Formation.title,
        content: this.Formation.description,
        excerpt: this.Formation.description,
        activated: 1,
        email: currentUser.user_email,
        featured: 0,
        status: "publish"
      }).then(formation => {
        let _region = _.clone(this.Formation.region) ;
        let _area =  _.clone(this.Formation.activity_area);

        this.WPEndpoint.formation().id( formation.id ).update({
          reference: `FOM${formation.id}`,
          diploma: this.Formation.diploma,
          address: this.Formation.address,
          price: this.Formation.price,
          date_limit: moment(dateLimit, "DD/MM/YYYY").format("YYYY-MM-DD"),
          duration: this.Formation.duration,
          establish_name: this.Formation.establish,
          paid: 1,
          tariff: 'premium',
          tax_values: { region: _region, area: _area }
        }).then(( response ) => {
          $('#new-formation-modal').modal('hide');
          this.loading = false;
          this.Formation = {};
          this.refresh.emit();
        })
      }, error => {
        swal("Désolé", error, 'error');
        $('#new-formation-modal').modal('hide');
      })
    }
  }

}
