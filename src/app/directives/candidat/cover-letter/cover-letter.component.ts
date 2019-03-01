import {Component, OnInit, Input} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import swal from 'sweetalert2';
import * as WPAPI from 'wpapi';

import {config} from '../../../../environments/environment';
import * as _ from 'lodash';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import {AuthService} from '../../../services/auth.service';
import {Helpers} from '../../../helpers';
declare var $:any;

@Component({
  selector: 'app-cover-letter',
  templateUrl: './cover-letter.component.html',
  styleUrls: ['./cover-letter.component.css']
})
export class CoverLetterComponent implements OnInit {
  public WPEndpoint: any;
  public loading: boolean = false;
  public coverLetters: Array<any> = [];
  @Input() private candidateId: number = 0;

  constructor(
    private Http: HttpClient,
    private authService: AuthService
  ) {
    // Added Endpoints
    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });

    let currentUser = this.authService.getCurrentUser();
    this.WPEndpoint.setHeaders({Authorization: `Bearer ${currentUser.token}`});
  }

  ngOnInit() {
    this.loading = true;
    this.getCoverLetter()
      .subscribe(resp => {
        this.coverLetters = _.cloneDeep(resp);
        this.loading = false;
        $('.scroller').each(function () {
          $(this).slimScroll({
            height: $(this).attr('data-height') || '100%',
            color: $(this).attr('data-color') || '#71808f',
            railOpacity: '0.9',
            size: '4px',
          });
        });

      });
  }

  getCoverLetter(): Observable<any> {
    return this.Http.get<any[]>(`${config.itApi}/candidate/${this.candidateId}?ref=coverletter`, {responseType: 'json'})
      .pipe(catchError(() => of([]))) // empty list on error);
      .map(resp => _.map(resp, response => {
        return {
          id: response.ID,
          guid: response.guid,
          title: response.post_title,
          date: response.post_date
        };
      }));
  }

  onRemoveAttachment(lm: any): void {
    swal({
      title: 'Confirmation',
      html: `Voulez-vous supprimer la lettre de motivation ? <br> <b>${lm.title}</b>`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.value) {
        Helpers.setLoading(true);
        this.WPEndpoint.media().id(lm.id).delete({force: true}).then(resp => {
          this.ngOnInit();
          Helpers.setLoading(false);
        });
        // For more information about handling dismissals please visit
        // https://sweetalert2.github.io/#handling-dismissals
      } else if (result.dismiss === swal.DismissReason.cancel) {

      }
    });
  }
}
