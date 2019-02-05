import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from '../../../helpers';
import * as _ from 'lodash';
import * as moment from 'moment';
import WPAPI from 'wpapi';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../environments/environment';
import { RequestService } from '../../../services/request.service';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-formation-edit',
  templateUrl: './formation-edit.component.html',
  styleUrls: ['./formation-edit.component.css']
})
export class FormationEditComponent implements OnInit {
  public ID: number;
  public loadingSave: boolean = false;
  public loadingForm: boolean = false;
  public loadingArea: boolean = false;
  public loadingRegion: boolean = false;
  public loadingSubscription: boolean = false;
  public Formation: any;
  public Subscriptions: Array<any> = [];
  public Editor: any = {};
  public activityAreas: Array<any> = [];
  public regions: Array<any> = [];
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
    private route: ActivatedRoute,
    private router: Router,
    private Http: HttpClient,
    private requestServices: RequestService,
    private authService: AuthService
  ) {
    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    let currentUser = this.authService.getCurrentUser();
    this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` });
    var namespace = 'wp/v2'; // use the WP API namespace
    var formationRoute = '/formation/(?P<id>)'; // route string - allows optional ID parameter

    this.WPEndpoint.formation = this.WPEndpoint.registerRoute(namespace, formationRoute);

    // site.books = site.registerRoute('myplugin/v1', 'books/(?P<id>)', {
    //    params: ['genre']
    // });
    // yields "myplugin/v1/books?genre[]=19&genre[]=2000"
    // site.books().genre([19, 2000]).toString()
  }

  ngOnInit() {
    Helpers.setLoading(true);
    moment.locale('fr');
    this.route.parent.params.subscribe(params => {
      this.ID = params.id;
      this.Http.get<any>(`${config.itApi}/formation/${params.id}?ref=collect`, { responseType: 'json' })
        .subscribe(response => {
          let formation: any = response;
          this.Formation = _.cloneDeep(formation);
          this.loadForm(formation);
          this.getSubscription();
        })
    });

    this.router.events.subscribe((route) => {
      if (route instanceof NavigationStart) {
        Helpers.setLoading(true);
      }

      if (route instanceof NavigationEnd) {
        Helpers.setLoading(false);
      }

    });
  }

  loadScript(): void {
    // Activate slimscroll
    $('.scroller').each(function () {
      $(this).slimScroll({
        height: $(this).attr('data-height') || '100%',
        color: $(this).attr('data-color') || '#71808f',
        railOpacity: '0.9',
        size: '4px',
      });
    });
  }

  getSubscription(): void {
    this.loadingSubscription = true;
    this.Http.get<any>(`${config.itApi}/formation/${this.ID}?ref=subscription`, { responseType: 'json' })
      .subscribe(response => {
        let data: any = response;
        this.Subscriptions = _.cloneDeep(data);
        this.loadingSubscription = false;
      })
  }

  areaLoadingFn(): void {
    this.loadingArea = true;
    this.requestServices.getArea().subscribe(area => {
      this.activityAreas = _.cloneDeep(area);
      this.loadingArea = false;
    })
  }

  regionLoadingFn(): void {
    this.loadingRegion = true;
    this.requestServices.getRegion().subscribe(regions => {
      this.regions = _.cloneDeep(regions);
      this.loadingRegion = false;
    })
  }

  loadForm(formation: any): void {
    this.areaLoadingFn();
    this.regionLoadingFn();

    this.Editor = _.cloneDeep(formation);
    let region = this.Editor.region;
    region = _.isArray(region) ? region[0] : region;
    let abranch = this.Editor.activity_area;
    abranch = _.isArray(abranch) ? abranch[0] : abranch;
    this.Editor.region = _.isObject(region) ? region.term_id : null;
    this.Editor.activity_area = _.isObject(abranch) ? abranch.term_id : null;
    this.Editor.date_create = moment(formation.date_create).format("LLL");
    this.Editor.date_limit = moment(formation.date_limit, 'YYYY-MM-DD').format('DD/MM/YYYY');

    this.loadingForm = true;
    Helpers.setLoading(false);
    setTimeout(() => {
      this.loadScript();
    }, 600);
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

  onSubmitForm(Form: NgForm): void {
    if (Form.valid) {
      this.loadingSave = true;
      let values: any = Form.value;
      values.date_limit = moment(values.date_limit, 'DD/MM/YYYY').format('YYYY-MM-DD');
      let Formdata = new FormData();
      Formdata.append('formation', JSON.stringify(values));
      this.Http.post<any>(`${config.itApi}/formation/${values.ID}`, Formdata)
        .subscribe(resp => {
          let data: any = resp;
          this.loadingSave = false;

          if (_.isObject(data) && data.success) {
            swal('Succès', "La modification a été effectuée", "success");
          } else {
            swal("Erreur", "Une erreur s'est produite, Veuillez réessayer ulterieurement", "warning");
          }
        })
    } else {
      swal('Validation', "Le formulaire n'est pas valide", 'error');
    }
  }

  acceptedUser(Candidate: any, paidValue: number, ev: any): void {
    this.loadingSubscription = true;
    this.WPEndpoint.formation().id(this.ID).update({
      'registration': [
        {
          user_id: Candidate.privateInformations.author.ID,
          paid: paidValue
        }
      ]
    }).then(resp => {
      this.getSubscription();
    })
  }

}
