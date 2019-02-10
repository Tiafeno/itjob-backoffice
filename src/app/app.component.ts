import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from "./helpers";
import { RequestService } from './services/request.service';
import * as _ from 'lodash';
import * as toastr from 'toastr';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/fromEvent';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'ITJobMada';
  public Notifications: any = [];
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
          }, 15000);
          // On online ...
          this.online.subscribe(e => {
            this.intervalRef = setInterval( async () => {
              await this.loadNotification();
            }, 15000);
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

  loadNotification(): void {
    this.requestService.collectNotice().subscribe(
      response => {
        if (response.success) {
          this.Notifications = _.cloneDeep(response.body);
        }
      });
  }

  ngAfterViewInit() {
  }

}
