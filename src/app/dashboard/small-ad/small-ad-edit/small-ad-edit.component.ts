import { Component, OnInit } from '@angular/core';
import {RequestService} from "../../../services/request.service";
import {AuthService} from "../../../services/auth.service";
import {NgForm} from "@angular/forms";
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {Observable} from "rxjs";
import * as _ from "lodash";

@Component({
  selector: 'app-small-ad-edit',
  templateUrl: './small-ad-edit.component.html',
  styleUrls: ['./small-ad-edit.component.css']
})
export class SmallAdEditComponent implements OnInit {
  public Type: Array<any> = [];
  public Categories: Array<any> = [];
  public Town: Array<any> = [];
  public Areas: Array<any> = [];
  public Regions: Array<any> = [];
  public Ad: any = {};

  public loading: boolean = false;
  public loadingCTG: boolean = false;
  public loadingRegion: boolean = false;
  public loadingArea: boolean = false;

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
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.router.events.subscribe( route => {
      if (route instanceof  NavigationStart) {

      }
      if (route instanceof NavigationEnd) {

      }
    });

    this.Type = [
      { name: "Offre", id: 1},
      { name: "Demande", id: 2},
    ];

    let categories = this.request.getCategorie();
    let regions = this.request.getRegion();
    let towns = this.request.getTown();
    let area = this.request.getArea();
    Observable.forkJoin([categories, regions, area, towns]).subscribe(terms => {
      this.Categories = _.cloneDeep(terms[0]);
      this.Regions = _.cloneDeep(terms[1]);
      this.Areas = _.cloneDeep(terms[2]);
      this.Town = _.cloneDeep(terms[3]);
    });

  }

  public onSaveAd(Form: NgForm): void {

  }

}
