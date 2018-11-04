import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateService } from '../../../services/candidate.service';
import * as _ from 'lodash';
import { Helpers } from '../../../helpers';
declare var $: any;

@Component({
  selector: 'app-candidate-edit',
  templateUrl: './candidate-edit.component.html',
  styleUrls: ['./candidate-edit.component.css']
})
export class CandidateEditComponent implements OnInit, AfterViewInit {
  public id: number;
  public Candidate: any;
  public editor: any = {};
  constructor(private route: ActivatedRoute,
    private candidatService: CandidateService) {
  }

  ngOnInit() {
    Helpers.setLoading(true);
    this.route.parent.params.subscribe(params => {
      this.id = params.id;
      this.candidatService
        .getCandidate(this.id)
        .subscribe(candidate => {
          this.Candidate = _.clone(candidate);
          this.loadForm();
          Helpers.setLoading(false);
        });
    });
  }

  onSubmitForm() {
    console.log(this.editor);
    return false;
  }

  loadForm() {
    this.editor.experiences = _.clone(this.Candidate.experiences);
    this.editor.trainings = _.clone(this.Candidate.trainings);
    console.warn(this.editor);
  }

  ngAfterViewInit() {
    $('.tagsinput').tagsinput({
      tagClass: 'label label-primary'
    });
  }

}
