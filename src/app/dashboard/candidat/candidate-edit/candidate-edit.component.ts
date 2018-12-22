import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateService } from '../../../services/candidate.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { Helpers } from '../../../helpers';
import { NgForm } from '@angular/forms';
import { RequestService } from '../../../services/request.service';
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
  public loadingSave: boolean = false;
  public townLoading: boolean = false;
  public areaLoading: boolean = false;
  public Candidate: any = {};
  public Regions: any = [];
  public Jobs: any = [];
  public Towns: any = [];
  public Languages: any = [];
  public Softwares: any = [];
  public branchActivitys: any = [];
  public editor: any = {};
  public Months: Array<any> = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  public Years: Array<number> = _.range(1959, new Date().getFullYear() + 1);
  constructor(
    private route: ActivatedRoute,
    private candidatService: CandidateService,
    private requestServices: RequestService
  ) {
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
              this.Languages = _.cloneDeep(responseList[2]);
              this.Softwares = _.cloneDeep(responseList[3]);

              this.townLoadingFn();
              this.areaLoadingFn();

              this.loadForm();
            })
        });
    });
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
    let cellphones: Array<any> = _.isArray(pI.cellphone) ? pI.cellphone : [];
    let currentDriveLicences = _.isArray(this.Candidate.driveLicences) ? _.map(this.Candidate.driveLicences, 'value') : [];
    currentDriveLicences = _.map(currentDriveLicences, _.unary(parseInt));
    let dLicences = [
      { id: 0, value: 'A`', name: 'a_', checked: false },
      { id: 1, value: 'A', name: 'a', checked: false },
      { id: 2, value: 'B', name: 'b', checked: false },
      { id: 3, value: 'C', name: 'c', checked: false },
      { id: 4, value: 'D', name: 'd', checked: false },
    ];
    let jobSought = this.Candidate.jobSought;
    let currentJobs = _.isArray(jobSought) ? _.map(jobSought, 'term_id') : (_.isObject(jobSought) ? jobSought.name : '');
    let args = {
      ID: this.Candidate.ID,
      isActive: this.Candidate.isActive,
      Reference: this.Candidate.reference,
      Greeting: _.isObject(this.Candidate.greeting) ? this.Candidate.greeting.value : this.Candidate.greeting,
      Region: !_.isObject(this.Candidate.region) ? '' : this.Candidate.region.term_id,
      Softwares: _.isArray(this.Candidate.softwares) ? _.map(this.Candidate.softwares, 'term_id') : '',
      State: this.Candidate.isActive && this.Candidate.state === 'publish' ? 1 : (this.Candidate.state === 'pending'  ? "pending" : 0),
      Status: _.isObject(this.Candidate.status) ? parseInt(this.Candidate.status.value) : "",
      DriveLicences: _.isArray(this.Candidate.driveLicences) ? _.map(dLicences, (dLicence) => {
        dLicence.checked = _.indexOf(currentDriveLicences, dLicence.id) >= 0;
        return dLicence;
      }) : dLicences,
      Town: _.isObject(pI.address.country) ? pI.address.country.term_id : '',
      Address: pI.address,
      Jobs: _.isArray(currentJobs) ? currentJobs : false,
      _oldJob: !_.isArray(currentJobs) ? currentJobs : false,
      Language: _.isArray(this.Candidate.languages) ? _.map(this.Candidate.languages, 'term_id') : '',
      Cellphones: _.map(cellphones, (cel, index) => { return {value: cel, id: index} }),
      Avatar: pI.avatar,
      Firstname: pI.firstname,
      Lastname: pI.lastname,
      Birthday: !_.isEmpty(pI.birthday_date) ? moment(pI.birthday_date, 'DD/MM/YYYY').format("MM/DD/YYYY") : '',
      Interest: this.Candidate.centerInterest,
      Divers: this.Candidate.centerInterest.various,
      Project: this.Candidate.centerInterest.projet
    };
    this.setEditorForm(args);
    this.ngReadyContent();
  }

  onAddedCellphone() {
    let index = this.editor.Form.Cellphones.length;
    this.editor.Form.Cellphones.push({value: '', id: index});
  }

  onRemoveCellphone(cellId: number) {
    this.editor.Form.Cellphones = _.reject(this.editor.Form.Cellphones, {id: cellId});
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
    let dateBegin = this.editor.Experience.exp_dateBegin;
    let dateEnd = this.editor.Experience.exp_dateEnd;
    if (_.isNull(dateBegin)) {
      if (!_.isEmpty(this.editor.Experience.old_value.exp_dateBegin)) {
        dateBegin = this.editor.Experience.old_value.exp_dateBegin;
      }
    } else {
      dateBegin = String(dateBegin);
    }
    if (_.isNull(dateEnd)) {
      if (!_.isEmpty(this.editor.Experience.old_value.exp_dateEnd)) {
        dateEnd = this.editor.Experience.old_value.exp_dateEnd;
      }
    } else {
      dateEnd = String(dateEnd);
    }
    moment.locale('fr');
    if (dateBegin !== null) {
      let _dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin) : (dateBegin.indexOf(' ') > -1 ? moment(dateBegin, 'MMMM YYYY', 'fr') : moment(new Date(dateBegin)));
      if (_dateBegin.format('YYYY') === 'Invalid date') {
        this.editor.Experience.exp_dateBegin = null;
      } else {
        this.editor.Experience.exp_dateBegin = { month: _dateBegin.format('MMMM'), year: _dateBegin.format('YYYY') };
      }
    } else {
      this.editor.Experience.exp_dateBegin = null;
    }

    if (dateEnd !== null) {
      let _dateEnd = dateEnd.indexOf('/') > -1 ? moment(dateEnd) : (dateEnd.indexOf(' ') > -1 ? moment(dateEnd, 'MMMM YYYY', 'fr') : moment(new Date(dateEnd)));
      if (_dateEnd.format('YYYY') === 'Invalid date') {
        this.editor.Experience.exp_dateEnd = null;
      } else {
        this.editor.Experience.exp_dateEnd = { month: _dateEnd.format('MMMM'), year: _dateEnd.format('YYYY') };
      }
    } else {
      this.editor.Experience.exp_dateEnd = null;
    }
    let abranch = this.editor.Experience.exp_branch_activity;
    this.editor.Experience.exp_branch_activity = abranch && _.isObject(abranch) ? abranch.term_id : abranch;

    $('#edit-experience-modal').modal('show');
  }

  onUpdateTraining(trainingId) {
    if (!_.isEmpty(this.editor.Training) && _.isNumber(trainingId)) {
      let Trainings = _.reject(this.editor.trainings, ['ID', trainingId]);
      let editTraining = _.clone(this.editor.Training);
      editTraining.validated = true;
      editTraining.training_dateBegin = moment(editTraining.training_dateBegin.month + ' ' + editTraining.training_dateBegin.year).format('MM/DD/YYYY');
      editTraining.training_dateEnd = moment(editTraining.training_dateEnd.month + ' ' + editTraining.training_dateEnd.year).format('MM/DD/YYYY');
      if (editTraining.training_dateBegin === "Invalid date" || editTraining.training_dateEnd === "Invalid date") return;

      this.editor.trainings = _.cloneDeep(Trainings);
      this.editor.trainings.push(editTraining);
      this.editor.trainings = _.orderBy(this.editor.trainings, ['ID'], ['asc']);
      this.candidatService.updateTraining(this.editor.trainings, this.Candidate.ID)
        .subscribe(response => {
          $('#edit-training-modal').modal('hide');
        });
    } else {
      return false;
    }
  }

  onUpdateExperience(experienceId) {
    if (!_.isEmpty(this.editor.Experience) && _.isNumber(experienceId)) {
      let Experiences = _.reject(this.editor.experiences, ['ID', experienceId]);
      let editExperience = _.clone(this.editor.Experience);
      editExperience.validated = true;
      editExperience.exp_dateBegin = moment(editExperience.exp_dateBegin.month + ' ' + editExperience.exp_dateBegin.year).format('MM/DD/YYYY');
      editExperience.exp_dateEnd = moment(editExperience.exp_dateEnd.month + ' ' + editExperience.exp_dateEnd.year).format('MM/DD/YYYY');
      if (editExperience.exp_dateBegin === "Invalid date" || editExperience.exp_dateEnd === "Invalid date") return;

      this.editor.experiences = _.cloneDeep(Experiences);
      this.editor.experiences.push(editExperience);
      this.editor.experiences = _.orderBy(this.editor.experiences, ['ID'], ['asc']);
      this.candidatService.updateExperience(this.editor.experiences, this.Candidate.ID)
        .subscribe(response => {
          $('#edit-experience-modal').modal('hide');
        });
    } else {
      return false;
    }
  }

  onSubmitForm(editForm: NgForm) {
    if (editForm.valid) {
      this.loadingSave = true;
      let driveLicences = {a_:0, a:1, b:2, c:3, d:4};
      let Form = _.clone(editForm.value);
      Form.cellphones = Object.values(Form.cellphones);
      Form.drivelicences = _.map(Form.drivelicences, (value: any, key) =>{
        return value ? driveLicences[key] : '';
      });
      Form.drivelicences = _.without(Form.drivelicences, '');
      console.log(Form);
      this.candidatService.saveCandidate(Form.ID, Form)
        .subscribe(response => {
          swal("Modification", "La modification a été effectuée", "success");
          this.loadingSave = false;
        });
    }
  }

  private setEditorForm(contents) {
    if (!_.isObject(contents)) return false;
    let keys = Object.keys(contents);
    for (let i of keys) {
      this.editor.Form[i] = contents[i];
    }
    Helpers.setLoading(false);
  }

  townLoadingFn() {
    this.townLoading = true;
    this.requestServices.getTown().subscribe(x => {
      this.Towns = _.cloneDeep(x);
      this.townLoading = false;
    })
  }

  areaLoadingFn() {
    this.areaLoading = true;
    this.requestServices.getArea().subscribe(x => {
      this.branchActivitys = _.cloneDeep(x)
      this.areaLoading = false;
    })
  }

  ngReadyContent() {
    this.loadingForm = false;
    const component = this;
    setTimeout(() => {
      $(".select2").select2({
        element: 'tag label label-success',
        placeholder: "Select a item",
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
        });

      $('#edit-experience-modal')
        .on('hidde.bs.modal', function (e) {
          component.editor.Experience = false;
        })
        .on('shown.bs.modal', function (e) {
          $(this).find('.select2').select2({
            width: "100%"
          });
          $('#summernote-experience').summernote({
            callbacks: {
              onChange: (contents, $editable) => {
                component.editor.Experience.exp_mission = contents;
              }
            }
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

  customSearchFn(term: string, item: any) {
    var inTerm = [];
    term = term.toLocaleLowerCase();
    var paramTerms = $.trim(term).split(' ');
    $.each(paramTerms, (index, value) => {
      if (item.name.toLocaleLowerCase().indexOf($.trim(value).toLowerCase()) > -1) {
        inTerm.push(true);
      } else {
        inTerm.push(false);
      }
    });
    return _.every(inTerm, (boolean) => boolean === true);
  }

  ngAfterViewInit() {

  }

}
