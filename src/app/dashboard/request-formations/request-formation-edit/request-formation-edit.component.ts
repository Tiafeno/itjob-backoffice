import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {Helpers} from "../../../helpers";
import {config} from "../../../../environments/environment";
import * as moment from "moment";
import * as _ from "lodash";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-request-formation-edit',
  templateUrl: './request-formation-edit.component.html',
  styleUrls: ['./request-formation-edit.component.css']
})
export class RequestFormationEditComponent implements OnInit {
  public ID: number = 0;
  public Editor: any = {};
  public loadingForm: boolean = false;
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
    private router: Router,
    private route: ActivatedRoute,
    private Http: HttpClient
  ) { }

  ngOnInit() {
    Helpers.setLoading(true);
    moment.locale('fr');
    this.route.parent.params.subscribe(params => {
      this.ID = params.id;
      this.Http.get<any>(`${config.itApi}/request-formations/${params.id}`, { responseType: 'json' })
        .subscribe(response => {
          let formation: any = response;
          this.loadForm(formation);
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

  public loadForm(Formation: any): void {
    this.Editor = _.clone(Formation);
    Helpers.setLoading(false);
  }

  public onSubmitForm(Form: NgForm): void {
    if (Form.valid) {
      let values = Form.value;
      let Formdata = new FormData();
      Formdata.append('subject', values.subject);
      Formdata.append('description', values.description);
      Formdata.append('topic', values.topic);
      this.loadingForm = true;
      this.Http.post<any>(`${config.itApi}/request-formation/${values.ID}/update`, Formdata)
        .subscribe(resp => {
          let data: any = resp;
          this.loadingForm = false;
          if (data) {
            swal('Succès', "La modification a été effectuée", "success");
          } else {
            swal("Erreur", "Une erreur s'est produite, Veuillez réessayer ulterieurement", "warning");
          }
        })
    }
  }

}
