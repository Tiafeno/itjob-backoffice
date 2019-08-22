import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from '../../../helpers';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as WPAPI from 'wpapi';
import { config } from '../../../../environments/environment';
import { RequestService } from '../../../services/request.service';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
declare var $: any;

@Component({
  selector: 'app-formation-edit',
  templateUrl: './formation-edit.component.html',
  styleUrls: ['./formation-edit.component.css']
})
export class FormationEditComponent implements OnInit {
  public ID: number;
  public subEmailForm: FormGroup;
  public loadingSave: boolean = false;
  public loadingForm: boolean = false;
  public loadingArea: boolean = false;
  public loadingRegion: boolean = false;
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
    toolbar: 'undo redo | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat ',
    plugins: ['lists'],
  };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private Http: HttpClient,
    private requestServices: RequestService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    let currentUser = this.authService.getCurrentUser();
    this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` });
    var namespace = 'wp/v2'; // use the WP API namespace
    var formationRoute = '/formation/(?P<id>\\d+)'; // route string - allows optional ID parameter

    this.WPEndpoint.formation = this.WPEndpoint.registerRoute(namespace, formationRoute);
    this.subEmailForm = new FormGroup({
      subject: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required)
    });
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

    $('#subscription-email-modal').on('hide.bs.modal', e => {
      this.subEmailForm.reset();
      this.cd.detectChanges();
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

  /**
   * Récuperer les candidats inscrits pour cette formation
   */
  getSubscription(): void {
    Helpers.setLoading(true);
    this.Http.get<any>(`${config.itApi}/formation/${this.ID}?ref=subscription`, { responseType: 'json' })
      .subscribe(response => {
        let data: any = response;
        this.Subscriptions = _.cloneDeep(data);
        this.cd.markForCheck();
        Helpers.setLoading(false);
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

  /**
   * Charger le formulaire de donnée
   * @param formation 
   */
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

  /**
   * Mettre à jour la formation
   * 
   * @param Form NgForm
   */
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

  /**
   * 
   * @param Candidate - Object candidat (Wordpress)
   * @param paidValue - 1) Accepted, 2) Refused
   * @param ev - Event
   */
  registerUser(Candidate: any, paidValue: number, ev: any): void {
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

  openSubscriptionForm(): void {
    $('#subscription-email-modal').modal('show');
  }

  onSendSubscriber(): void {
    if (this.subEmailForm.valid) {
      const Value = this.subEmailForm.value;
      const formData = new FormData();
      formData.append('subject', Value.subject);
      formData.append('message', Value.message);
      Helpers.setLoading(true);
      this.Http.post<any>(`${config.itApi}/mail/formation/${this.ID}/subscription`, formData).subscribe(resp => {
        Helpers.setLoading(false);
        $('#subscription-email-modal').modal('hide');
        swal(resp.success ? 'Succès' : "Désolé", resp.data, resp.success ? 'success' : 'warning');
      }, error => {
        Helpers.setLoading(false);
        swal('Désolé', "Une erreur s'est produit, Veuillez réessayer plus tard. Merci");
      });
    } else {
      (<any>Object).values(this.subEmailForm.controls).forEach(element => {
        element.markAsDirty();
      });
      console.log(this.subEmailForm);
    }
  }

}
