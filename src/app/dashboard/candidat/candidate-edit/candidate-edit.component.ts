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
  public Candidate: any = {};
  public Regions: any = [];
  public Jobs: any = [];
  public Towns: any = [];
  public Languages: any = [];
  public Softwares: any = [];
  public editor: any = {};
  public Months: Array<any> = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  public Years: Array<number> = _.range(1959, new Date().getFullYear() + 1);
  constructor(private route: ActivatedRoute,
    private candidatService: CandidateService) {
    this.Candidate.status = true;
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
    let currentTraining = _.find(this.editor.trainings, ['ID', tId]);
    if (!_.isObject(currentTraining)) return false;
    this.editor.Training = _.cloneDeep(currentTraining);
    let dateBegin = String(this.editor.Training.training_dateBegin);
    let dateEnd = String(this.editor.Training.training_dateEnd);
    moment.locale('fr');
    let _dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin) :
      (dateBegin.indexOf(' ') > -1 ? moment(dateBegin, 'MMMM YYYY', 'fr') : moment(new Date(dateBegin)));
    let _dateEnd = dateEnd.indexOf('/') > -1 ? moment(dateEnd) :
      (dateEnd.indexOf(' ') > -1 ? moment(dateEnd, 'MMMM YYYY', 'fr') : moment(new Date(dateEnd)));
    this.editor.Training.training_dateBegin = { month: _dateBegin.format('MMMM'), year: _dateBegin.format('YYYY') };
    this.editor.Training.training_dateEnd = { month: _dateEnd.format('MMMM'), year: _dateEnd.format('YYYY') };
    $('#edit-training-modal').modal('show')
  }

  onEditExperience(eId) {
    let currentExperience = _.find(this.editor.experiences, ['ID', eId]);
    if (!_.isObject(currentExperience)) return false;
    this.editor.Experience = _.cloneDeep(currentExperience);
    let dateBegin = String(this.editor.Experience.exp_dateBegin);
    let dateEnd = String(this.editor.Experience.exp_dateEnd);
    moment.locale('fr');
    let _dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin) :
      (dateBegin.indexOf(' ') > -1 ? moment(dateBegin, 'MMMM YYYY', 'fr') : moment(new Date(dateBegin)));
    let _dateEnd = dateEnd.indexOf('/') > -1 ? moment(dateEnd) :
      (dateEnd.indexOf(' ') > -1 ? moment(dateEnd, 'MMMM YYYY', 'fr') : moment(new Date(dateEnd)));
    this.editor.Experience.exp_dateBegin = { month: _dateBegin.format('MMMM'), year: _dateBegin.format('YYYY') };
    this.editor.Experience.exp_dateEnd = { month: _dateEnd.format('MMMM'), year: _dateEnd.format('YYYY') };
    $('#edit-experience-modal').modal('show')
  }

  onSubmitForm() {
    return false;
  }

  onUpdateTraining(trainingId) {
    let Trainings = _.reject(this.editor.trainings, ['ID', trainingId]);
    if (!_.isEmpty(this.editor.Training)) {

      let editTraining = _.clone(this.editor.Training);
      editTraining.training_dateBegin = moment(editTraining.training_dateBegin.month + ' ' + editTraining.training_dateBegin.year).format('MM/DD/YYYY');
      editTraining.training_dateEnd = moment(editTraining.training_dateEnd.month + ' ' + editTraining.training_dateEnd.year).format('MM/DD/YYYY');
      if (editTraining.training_dateBegin === "Invalid date" || editTraining.training_dateEnd === "Invalid date") return;

      this.editor.trainings = _.clone(Trainings);
      this.editor.trainings.push(editTraining);
      this.editor.trainings = _.orderBy(this.editor.trainings, ['training_dateBegin'], ['desc']);
      this.candidatService.updateTraining(this.editor.trainings, this.Candidate.ID)
        .subscribe(response => {
          $('#edit-training-modal').modal('hide');
        });
    } else {
      return false;
    }
  }

  onUpdateExperience(experienceId) {

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
    const component = this;
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

      $('#edit-training-modal')
        .on('hidden.bs.modal', function (e) {
          component.editor.Training = false;
        })
        .on('shown.bs.modal', function (e) {
          $(this).find('.select2').select2({
            width: "100%"
          });
        })

      // $('.dd').nestable({
      //   maxDepth: 0
      // });

      $('#edit-training-modal').modal({
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
