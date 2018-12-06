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

  onEditTraining(tId) {
    $('#new-mail-modal').modal('show')
  }

  onSubmitForm() {
    return false;
  }

  loadForm() {
    this.editor.experiences = _.map(this.Candidate.experiences, (experience, index) => {
      experience.ID = index;
      return experience;
    });
    this.editor.trainings = _.map(this.Candidate.trainings, (training, index) => {
      training.ID = index;
      return training;
    });
    this.editor.Form = {};
    let privateInformations = _.clone(this.Candidate.privateInformations);
    let cellphones = privateInformations.cellphone;
    let args = {
      ID: this.Candidate.ID,
      Reference: this.Candidate.reference,
      Greeting: this.Candidate.greeting,
      Region: _.isEmpty(this.Candidate.region) || _.isNull(this.Candidate.region) ? '' : this.Candidate.region.term_id,
      Softwares: this.Candidate.softwares,
      State: this.Candidate.state,
      Status: this.Candidate.status,
      DriveLicences: this.Candidate.driveLicences,
      Address: privateInformations.address,
      Cellphones: _.isArray(cellphones) ? cellphones : [],
      Phone: _.isArray(privateInformations.phone) ? privateInformations.phone : [],
      Avatar: privateInformations.avatar,
      Firstname: privateInformations.firstname,
      Lastname: privateInformations.lastname,
      Interest: this.Candidate.centerInterest
    };
    this.setEditorForm(args);

    console.log(this.editor);

  }

  private setEditorForm(contents) {
    if (!_.isObject(contents)) return false;
    let keys = Object.keys(contents);
    for (let i of keys) {
      this.editor.Form[i] = contents[i];
    }
  }

  ngAfterViewInit() {
    $('.tagsinput').tagsinput({
      tagClass: 'label label-primary'
    });
    // $('.dd').nestable({
    //   maxDepth: 0
    // });
    $('#new-mail-modal').modal({
      keyboard: false,
      show: false
    });
  }

}
