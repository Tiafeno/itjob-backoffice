import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateService } from '../../../services/candidate.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Helpers } from '../../../helpers';
declare var $: any;
declare var Bloodhound: any;

@Component({
  selector: 'app-candidate-edit',
  templateUrl: './candidate-edit.component.html',
  styleUrls: ['./candidate-edit.component.css']
})
export class CandidateEditComponent implements OnInit, AfterViewInit {
  public id: number;
  public loadingForm: boolean = false;
  public Candidate: any;
  public Regions: any = [];
  public Jobs: any = [];
  public Towns: any = [];
  public Languages: any = [];
  public Softwares: any = [];
  public editor: any = {};
  constructor(private route: ActivatedRoute,
    private candidatService: CandidateService) {
    this.editor.Form = {};
    this.editor.Form.Address = {};
  }

  ngOnInit() {
    Helpers.setLoading(true);
    this.loadingForm = true;
    this.route.parent.params.subscribe(params => {
      this.id = params.id;
      this.candidatService
        .getCandidate(this.id)
        .subscribe(candidate => {
          this.Candidate = _.clone(candidate);
          this.candidatService.collectDataEditor()
            .subscribe(responseList => {
              this.Regions = _.cloneDeep(responseList[0]);
              this.Jobs = _.cloneDeep(responseList[1]);
              this.Towns = _.cloneDeep(responseList[2]);
              this.Languages = _.cloneDeep(responseList[3]);
              this.Softwares = _.cloneDeep(responseList[4]);

              this.loadForm();
            })

        });
    });
  }

  onEditTraining(tId) {
    $('#new-mail-modal').modal('show')
  }

  onSubmitForm() {
    return false;
  }

  showVariable() {
    console.log(this.editor.Form);
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
    let pI = _.clone(this.Candidate.privateInformations);
    let cellphones = pI.cellphone;
    let currentDriveLicences = _.isArray(this.Candidate.driveLicences) ? _.map(this.Candidate.driveLicences, 'value') : [];
    currentDriveLicences = _.map(currentDriveLicences, _.unary(parseInt));
    let dLicences = [
      { id: 0, value: 'A`', checked: false },
      { id: 1, value: 'A', checked: false },
      { id: 2, value: 'B', checked: false },
      { id: 3, value: 'C', checked: false },
      { id: 4, value: 'D', checked: false },
    ];
    let currentJobs = _.isObject(this.Candidate.jobSought) ? _.map(this.Candidate.jobSought, 'term_id') : '';
    let args = {
      ID: this.Candidate.ID,
      Reference: this.Candidate.reference,
      Greeting: _.isObject(this.Candidate.greeting) ? this.Candidate.greeting.value : this.Candidate.greeting,
      Region: !_.isObject(this.Candidate.region) ? '' : this.Candidate.region.term_id,
      Softwares: _.isArray(this.Candidate.softwares) ? _.map(this.Candidate.softwares, 'term_id') : '',
      State: this.Candidate.state,
      Status: _.isObject(this.Candidate.status) ? parseInt(this.Candidate.status.value) : "",
      DriveLicences: _.isArray(this.Candidate.driveLicences) ? _.map(dLicences, (dLicence) => {
        dLicence.checked = _.indexOf(currentDriveLicences, dLicence.id) >= 0;
        return dLicence;
      }) : '',
      Town: _.isObject(pI.address.country) ? pI.address.country.term_id : '',
      Address: pI.address,
      Jobs: currentJobs,
      Language: _.isArray(this.Candidate.languages) ? _.map(this.Candidate.languages, 'term_id') : '',
      Cellphones: _.isArray(cellphones) ? cellphones : [],
      Phone: _.isArray(pI.phone) ? pI.phone : [],
      Avatar: pI.avatar,
      Firstname: pI.firstname,
      Lastname: pI.lastname,
      Birthday: !_.isEmpty(pI.birthday_date) ? moment(pI.birthday_date, 'DD/MM/YYYY').format("MM/DD/YYYY") : '',
      Interest: this.Candidate.centerInterest
    };
    this.setEditorForm(args);

    console.log(this.editor);
    this.ngReadyContent();

  }

  private setEditorForm(contents) {
    if (!_.isObject(contents)) return false;
    let keys = Object.keys(contents);
    for (let i of keys) {
      this.editor.Form[i] = contents[i];
    }
    Helpers.setLoading(false);
  }

  ngReadyContent() {
    this.loadingForm = false;
    setTimeout(() => {
      $(".select2").select2({
        element: 'tag label label-success',
        placeholder: () => {
          var title = $(this).attr('title');
          return title;
        },
        matcher: (params, data) => {
          var inTerm = [];
          if ($.trim(params.term) === '') {
            return data;
          }
          if (typeof data.text === 'undefined') {
            return null;
          }
          var dataContains = data.text.toLowerCase();
          var paramTerms = $.trim(params.term).split(' ');
          $.each(paramTerms, (index, value) => {
            if (dataContains.indexOf($.trim(value).toLowerCase()) > -1) {
              inTerm.push(true);
            } else {
              inTerm.push(false);
            }
          });
          var isEveryTrue = _.every(inTerm, (boolean) => {
            return boolean === true;
          });
          if (isEveryTrue) {
            var modifiedData = $.extend({}, data, true);
            return modifiedData;
          } else {
            return null;
          }
        }
      });

      // $('.dd').nestable({
      //   maxDepth: 0
      // });

      $('#new-mail-modal').modal({
        keyboard: false,
        show: false
      });

      $('.input-group.date').datepicker({
        format: "mm/dd/yyyy",
        todayBtn: false,
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true
      });
    }, 1500);
  }

  ngAfterViewInit() {

  }

}
