import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../../../../environments/environment';
import * as _ from 'lodash';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';

@Component({
    selector: 'app-cover-letter',
    templateUrl: './cover-letter.component.html',
    styleUrls: ['./cover-letter.component.css']
})
export class CoverLetterComponent implements OnInit {
    public loading: boolean = false;
    public coverLetters: Array<any> = [];
    @Input() private candidateId: number = 0;
    constructor(
        private Http: HttpClient
    ) { }

    ngOnInit() {
        this.getCoverLetter()
            .subscribe(resp => {
                this.coverLetters = _.cloneDeep(resp);
                console.log(resp);
            })
    }

    getCoverLetter(): Observable<any> {
        return this.Http.get<any[]>(`${config.itApi}/candidate/${this.candidateId}?ref=coverletter`, { responseType: 'json' })
            .pipe(catchError(() => of([]))) // empty list on error);
            .map(resp =>  _.map(resp, response => {
                    return {
                        id: response.ID,
                        guid: response.guid,
                        title: response.post_title,
                        date: response.post_date
                    }
                })

            );
    }

}
