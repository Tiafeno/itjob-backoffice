import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment";
import * as WPAPI from 'wpapi';
import * as _ from 'lodash';
import { config } from "../../../environments/environment";
import { NgForm } from "@angular/forms";
import * as toastr from 'toastr';
import { Helpers } from "../../helpers";
import swal from "sweetalert2";

declare var $: any;
declare var Bloodhound: any;

@Component({
  selector: 'app-ads',
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdsComponent implements OnInit, AfterViewInit {
  public WPEndpoint: any;
  public table: any;
  public Ads: any = {};
  public Editor: any = {};
  public schemes: Array<any>;
  public loading: boolean = false;
  public selected: boolean = false;

  constructor(
    private auth: AuthService,
    private Http: HttpClient
  ) {

    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    let currentUser = this.auth.getCurrentUser();
    this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` });
    const top = [
      { size: '1120x210', label: '1120 x 210' }
    ];
    const sidebar = [
      { size: '354x330', label: '354 x 330' },
      { size: '354x570', label: '354 x 570 (Large)' }
    ];
    this.schemes = [
      {
        position: 'position-1',
        name: 'Accueil en haut (position-1)',
        sizes: _.clone(top)
      },
      {
        position: 'position-2',
        name: 'Accueil côté droit (position-2)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-3',
        name: 'Page CV en haut (position-3)',
        sizes: _.clone(top)
      },
      {
        position: 'position-4',
        name: 'Page CV côté droit (position-4)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-5',
        name: 'Page offre en haut (position-5)',
        sizes: _.clone(top)
      },
      {
        position: 'position-6',
        name: 'Page offre côté droit (position-6)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-7',
        name: ' Offre en aperçu (position-7)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-8',
        name: 'CV en aperçu (position-8)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-9',
        name: 'Inscription particulier (position-9)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-10',
        name: 'Inscription professionnel (position-10)',
        sizes: _.clone(sidebar)
      },
      // {
      //   position: 'position-11',
      //   name: 'Search Side Right (position-11)',
      //   sizes: _.clone(sidebar)
      // },
      {
        position: 'position-12',
        name: 'Page Travail Temp. en haut (position-12)',
        sizes: _.clone(top)
      },
      {
        position: 'position-13',
        name: 'Page Travail Temp. côté droit (position-13)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-14',
        name: 'Travail Temp. en aperçu (position-14)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-15',
        name: 'Page Formation en haut (position-15)',
        sizes: _.clone(top)
      },
      {
        position: 'position-16',
        name: 'Page Formation côté droit (position-16)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-17',
        name: 'Formation en aperçu (position-17)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-18',
        name: 'Page Annonce en haut (position-18)',
        sizes: _.clone(top)
      },
      {
        position: 'position-19',
        name: 'Page Annonce côté droit (position-19)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-20',
        name: 'Annonce en aperçu (position-20)',
        sizes: _.clone(sidebar)
      },
    ];
  }

  public reload(): void {
    this.table.ajax.reload(null, false);
  }

  ngAfterViewInit() {
    // Trouver un entreprise
    const Company = new Bloodhound({
      datumTokenizer: function (datum) {
        return Bloodhound.tokenizers.whitespace((datum as any).value);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: config.itApi + '/get-company/%QUERY',
        prepare: function (query, settings) {
          settings.url = settings.url.replace('%QUERY', query);
          return settings;
        },
        filter: function (data) {
          return _.map(data, (item) => {
            return {
              value: (item as any).author.ID,
              label: (item as any).title
            };
          });
        }
      }
    });
    // Initialize the Bloodhound suggestion engine
    Company.initialize();
    var inputCompanyTypeahead = $('#new-event-company');
    inputCompanyTypeahead.on('typeahead:selected', (evt, item) => {
      this.Ads.companyId = parseInt(item.value);
    });

    inputCompanyTypeahead.typeahead(null, {
      hint: false,
      highlight: true,
      minLength: 5,
      displayKey: 'label',
      source: Company.ttAdapter()
    } as any);

    // initialize datetimepicker
  }

  ngOnInit() {
    moment.locale('fr');
    this.initAdForm();

    const getData = (ev: any): any => {
      let el = $(ev.currentTarget).parents('tr');
      let data = this.table.row(el).data();
      return data;
    };
    const adsTable = $('#ads-table');
    this.table = adsTable.DataTable({
      pageLength: 10,
      page: 1,
      select: 'single',
      ordering: false, // Activer ou désactiver l'affichage d'ordre
      fixedHeader: true,
      responsive: false,
      dom: '<"top"i><"info"r>t<"bottom"flp><"clear">',
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.16/i18n/French.json"
      },
      processing: true,
      serverSide: true,
      columns: [
        { data: 'id_ads' },
        { data: 'title' },
        { data: 'start', render: (data) => moment(data).format('LLLL') },
        { data: 'end', render: (data) => moment(data).format('LLLL') },
        { data: 'position', render: (data) => data },
        { data: 'create', render: (data) => moment(data).fromNow() },
        {
          data: null,
          render: (data, type, row) => `
            <div class="fab fab-left">
               <button class="btn btn-sm btn-primary btn-icon-only btn-circle btn-air" data-toggle="button">
                  <i class="fab-icon la la-bars"></i>
                  <i class="fab-icon-active la la-close"></i>
               </button>
               <ul class="fab-menu">
                  <li><button class="btn btn-danger btn-icon-only btn-circle btn-air delete-ads" ><i class="la la-trash"></i></button></li>
               </ul>
            </div>`
        }
      ],
      initComplete: (setting, json) => {

      },
      ajax: {
        url: `${config.itApi}/ads/`,
        dataType: 'json',
        data: {
          order: false,
        },
        beforeSend: (xhr) => {
          let currentUser = this.auth.getCurrentUser();
          if (currentUser && currentUser.token) {
            xhr.setRequestHeader("Authorization",
              `Bearer ${currentUser.token}`);
          }
        },

        type: 'GET',
      }
    });

    // On select row
    this.table.on('select', (e, dt, type, indexes) => {
      let data = dt.row({ selected: true }).data();
      this.Editor = _.clone(data);
      Helpers.setLoading(true);
      this.WPEndpoint.media().id(parseInt(data.id_attachment)).then(resp => {
        this.Editor.link = resp.title.rendered;
        this.Editor.picture = resp.source_url;
        this.selected = true;
        Helpers.setLoading(false);
      });

    });
    // On deselect row
    this.table.on('deselect', (e, dt, type, indexes) => {
      this.Editor = {};
      this.selected = false;
    });

    $('#new-ad-modal').on('show.bs.modal', () => {
      this.initAdForm();
    });
    $('#ads-table tbody').on('click', '.delete-ads', e => {
      e.preventDefault();
      const __ads = getData(e);
      // Réfuser l'accès au commercial de modifier cette option
      if (!this.auth.notUserAccess("contributor")) return;
      if (!this.auth.notUserAccess("editor")) return;

      swal({
        title: 'Confirmation',
        html: `Vous voulez vraiment supprimer la publicité ?<br> <b>${__ads.title}</b>`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: "Supprimer",
        cancelButtonText: "Annuler"
      }).then((result) => {
        if (result.value) {
          Helpers.setLoading(true);
          this.Http.delete(`${config.itApi}/ads/${__ads.id_ads}`, { responseType: 'json' })
            .subscribe(resp => {
              if (resp) {
                swal('Succès', "Publicité effacer avec succès", 'info');
              } else {
                swal('Désolé', "Une erreur s'est produite", "error");
              }
              Helpers.setLoading(false);
              this.reload();
            });
        } else {
          if (result.dismiss === swal.DismissReason.cancel) {

          }
        }
      });
    });

    $('#ads-table tbody').on('click', '.edit-ads', e => {
      e.preventDefault();
      swal('Information', "En cours de construction", 'info');
    });
  }

  public initAdForm(): void {
    this.Ads.position = '';
    this.Ads.size = '';
    this.Ads.link = '';
    this.Ads.company = 0;
    this.Ads.end = moment().format("YYYY-MM-DD HH:mm:ss");
    this.Ads.start = moment().format("YYYY-MM-DD HH:mm:ss");
  }

  public onNewAds(Form: NgForm): void {

    // Réfuser l'accès au commercial de modifier cette option
    if (!this.auth.notUserAccess("editor")) return;
    if (!this.auth.notUserAccess("contributor")) return;


    if (!Form.valid) {
      toastr.error('Le formulaire est invalide');
    }
    else {
      this.loading = true;
      let value: any = Form.value;
      let fileElement: any = document.querySelector('#new-event-file');
      const fileUpload = fileElement.files[0];
      this.WPEndpoint.media()
        // Specify a path to the file you want to upload, or a Buffer
        .file(fileUpload)
        .create({
          title: value.link, // Ajouter le lien dans le titre
          alt_text: value.title,
          caption: value.title,
          description: ''
        })
        .then((response) => {
          // Your media is now uploaded: let's associate it with a post
          let formData = new FormData();
          const newImageId = response.id;
          const companyId: number = parseInt(value.company);
          const newAds = {
            title: value.title,
            start: value.start,
            end: value.end,
            id_attachment: newImageId,
            id_user: _.isNaN(companyId) ? 0 : companyId,
            position: value.position,
            paid: 1,
            bill: value.bill,
            img_size: value.image_size,
          };

          formData.append('ads', JSON.stringify(newAds));
          this.Http.post(`${config.itApi}/ads`, formData)
            .subscribe(response => {
              $('#new-ad-modal').modal('hide');
              toastr.success('event successfully created');
              this.loading = false;
              this.reload();
            }, errno => {
              toastr.error(errno);
              this.loading = false;
            });
        });

    }
  }

  public onEditAds(Form: NgForm): void {

    // Réfuser l'accès au commercial de modifier cette option
    if (!this.auth.notUserAccess("editor")) return;
    if (!this.auth.notUserAccess("contributor")) return;

    if (Form.valid) {
      const data: any = Form.value;
      this.loading = true;
      const id_attachment: number = parseInt(data.id_attachment);
      if (_.isNaN(id_attachment) || 0 === id_attachment) {
        this.updateAds(data);
      } else {
        this.WPEndpoint.media().id(id_attachment).update({
          title: data.link,
          alt_text: data.title,
          caption: data.title
        }).then(resp => {
          this.updateAds(data);
        }, error => {
          this.loading = false;
        });
      }
    } else {
      toastr.error("Formulaire invalide");
    }
  }

  private updateAds(Data: any): void {

    // Réfuser l'accès au commercial de modifier cette option
    if (!this.auth.notUserAccess("editor")) return;
    if (!this.auth.notUserAccess("contributor")) return;

    if (!_.isEmpty(Data)) {
      const ads: any = Data;
      let args = {
        title: ads.title,
        start: ads.start,
        end: ads.end,
        img_size: ads.image_size,
        position: ads.position,
        paid: ads.paid
      };
      const Form: FormData = new FormData();
      Form.append('ads', JSON.stringify(args));
      this.Http.post<any>(`${config.itApi}/ads/${ads.id_ads}`, Form).subscribe(resp => {
        this.loading = false;
        toastr.success("Publicité mis à jour avec succès");
        this.reload();
      });
    } else {
      this.loading = false;
    }
  }

}
