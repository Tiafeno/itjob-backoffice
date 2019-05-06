import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from "./helpers";
import { RequestService } from './services/request.service';
import * as _ from 'lodash';
import * as toastr from 'toastr';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/fromEvent';
declare var $:any;

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'ITJobMada';
  public Notifications: any = {};
  public selected: string = 'all';
  public intervalRef: any;
  private online: Observable<string>;
  private offline: Observable<string>;

  constructor(
    private router: Router,
    private requestService: RequestService,
    private Auth: AuthService,
  ) {
    this.online = Observable.fromEvent(window, 'online');
    this.offline = Observable.fromEvent(window, 'offline');

   }

  ngOnInit() {
    this.router.events.subscribe((route) => {
      if (route instanceof NavigationStart) {
        if (this.Auth.isLogged()) {
          //Helpers.setLoading(true);
          this.loadNotification();
          clearInterval(this.intervalRef);
        }
      }
      if (route instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        Helpers.setLoading(false);
        // Initialize page: handlers ...
        Helpers.initPage();
        if (this.Auth.isLogged()) {
          this.intervalRef = setInterval( async () => {
            await this.loadNotification();
          }, 600000);
          // On online ...
          this.online.subscribe(e => {
            this.intervalRef = setInterval( async () => {
              await this.loadNotification();
            }, 600000);
            toastr.clear();
            toastr.success('Vous êtes déjà de retour.', 'Connexion');
          });
          // On offline ...
          this.offline.subscribe(e => {
            clearInterval(this.intervalRef);
            toastr.clear();
            toastr.error("Vous n'etes pas connecté à internet.", "Connexion", {timeOut: 15000});
          });
        }
      }
    });
  }

  public selectedTab(ev): void {
    let element = ev.currentTarget;
    this.selected = $(element).data('type');
  }

  loadNotification(): void {
    this.requestService.collectNotice().subscribe(
      response => {
        if (response.success) {
          this.Notifications.all = _.cloneDeep(response.body);
          let notices: any = _.clone(response.body);
          const schemeNoticeCandidate = [1, 4, 7];
          const schemeNoticeCompany = [2, 9, 10];
          const schemeNoticeSoftware = [20];
          const schemeNoticeOffer = [3];
          this.Notifications.softwares = _.filter(notices, note => {
            let data: any = note;
            return _.indexOf(schemeNoticeSoftware, parseInt(data.type)) >= 0;
          });
          this.Notifications.candidate = _.filter(notices, note => {
            let data: any = note;
            return _.indexOf(schemeNoticeCandidate, parseInt(data.type)) >= 0;
          });
          this.Notifications.offers = _.filter(notices, note => {
            let data: any = note;
            return _.indexOf(schemeNoticeOffer, parseInt(data.type)) >= 0;
          });
          this.Notifications.company = _.filter(notices, note => {
            let data: any = note;
            return _.indexOf(schemeNoticeCompany, parseInt(data.type)) >= 0;
          });

        }
      });
  }

  ngAfterViewInit() {
  }

}
