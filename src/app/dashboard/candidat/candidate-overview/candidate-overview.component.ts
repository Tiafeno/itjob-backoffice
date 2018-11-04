import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CandidateService } from '../../../services/candidate.service';
import { Helpers } from '../../../helpers';
import * as _ from 'lodash';

@Component({
  selector: 'app-candidate-overview',
  templateUrl: './candidate-overview.component.html',
  styleUrls: ['./candidate-overview.component.css']
})
export class CandidateOverviewComponent implements OnInit {
  public id: number;
  public Candidate: any;
  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private candidatService: CandidateService) { }

  ngOnInit() {
    Helpers.setLoading(true);
    this.route.parent.params.subscribe(params => {
      this.id = params.id;
      this.candidatService
        .getCandidate(this.id)
        .subscribe(candidate => {
          this.Candidate = _.clone(candidate);
          Helpers.setLoading(false);
        });
    });
  }

}
