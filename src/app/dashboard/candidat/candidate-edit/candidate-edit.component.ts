import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateService } from '../../../services/candidate.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { Helpers } from '../../../helpers';
import { NgForm } from '@angular/forms';
import { RequestService } from '../../../services/request.service';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../environments/environment';
import { PlatformLocation } from '@angular/common';
import { sample } from 'rxjs/operators';
declare var $: any;
declare var Bloodhound: any;

@Component({
  selector: 'app-candidate-edit',
  templateUrl: './candidate-edit.component.html',
  styleUrls: ['./candidate-edit.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CandidateEditComponent implements OnInit, AfterViewInit {
  public id: number;
  public loadingForm: boolean = false;
  public loadingSave: boolean = false;
  public loadingSaveExperience: boolean = false;
  public loadingSaveTraining: boolean = false;
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
  public avatar: any = {};
  public inputAvatar: FileList;
  public apiUploadEndPoint: string = `${config.itApi}/upload/`;
  public Months: Array<any> = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  public Years: Array<number> = _.range(1959, new Date().getFullYear() + 1);
  public tinyMCESettings: any = {
    skin_url: '/assets/tinymce/skins/lightgray',
    inline: false,
    statusbar: false,
    browser_spellcheck: true,
    height: 320,
    plugins: '',
  };
  constructor(
    private Http: HttpClient,
    private route: ActivatedRoute,
    private candidatService: CandidateService,
    private requestServices: RequestService,
    public platformLocation: PlatformLocation
  ) {
    this.Candidate.status = true;
    this.editor.Form = {};
    this.editor.Form.Address = {};
    this.avatar.preview = (this.platformLocation as any).location.origin + "/assets/img/image.png";
  }

  ngOnInit() {
    moment.locale('fr');
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
    this.avatar.preview = this.Candidate.privateInformations.avatar ? this.Candidate.privateInformations.avatar[0] : this.avatar.preview;
    this.avatar.value = '';
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
    let jobNotif = this.Candidate.jobNotif;
    let trainingNotif = this.Candidate.trainingNotif;
    let currentJobs = _.isArray(jobSought) ? _.map(jobSought, 'term_id') : (_.isObject(jobSought) ? jobSought.name : '');
    let args = {
      ID: this.Candidate.ID,
      isActive: this.Candidate.isActive,
      Reference: this.Candidate.reference,
      Greeting: _.isObject(this.Candidate.greeting) ? this.Candidate.greeting.value : this.Candidate.greeting,
      Region: !_.isObject(this.Candidate.region) ? null : this.Candidate.region.term_id,
      Softwares: _.isArray(this.Candidate.softwares) ? _.map(this.Candidate.softwares, 'term_id') : [],
      State: this.Candidate.isActive && this.Candidate.state === 'publish' ? 1 : (this.Candidate.state === 'pending' ? "pending" : 0),
      Status: _.isObject(this.Candidate.status) ? parseInt(this.Candidate.status.value) : null,
      DriveLicences: _.isArray(this.Candidate.driveLicences) ? _.map(dLicences, (dLicence) => {
        dLicence.checked = _.indexOf(currentDriveLicences, dLicence.id) >= 0;
        return dLicence;
      }) : dLicences,
      Town: _.isObject(pI.address.country) ? pI.address.country.term_id : null,
      Address: pI.address,
      Jobs: _.isArray(currentJobs) ? currentJobs : [],
      _Jobs: !_.isArray(currentJobs) ? currentJobs : false,
      Language: _.isArray(this.Candidate.languages) ? _.map(this.Candidate.languages, 'term_id') : [],
      Cellphones: _.map(cellphones, (cel, index) => { return { value: cel, id: index } }),
      Avatar: pI.avatar,
      Firstname: pI.firstname,
      Lastname: pI.lastname,
      Email: pI.author.data.user_email,
      Birthday: !_.isEmpty(pI.birthday_date) ? moment(pI.birthday_date, 'DD/MM/YYYY').format("MM/DD/YYYY") : null,
      Interest: this.Candidate.centerInterest,
      jobNotif: this.createJobNotification(jobNotif),
      trainingNotif: this.createTrainNotification(trainingNotif),
      Newsletter: this.Candidate.newsletter,
      Divers: this.Candidate.centerInterest.various,
      Project: this.Candidate.centerInterest.projet
    };
    this.setEditorForm(args);
    this.ngReadyContent();
  }

  // Crée une notification pour les emplois
  createJobNotification(Notif: any): any {
    let Notification: any = {};
    if (_.isObject(Notif)) {
      Notification.notification = Notif.notification;
      Notification.branch_activity = _.isObject(Notif.branch_activity) ? Notif.branch_activity.term_id : 0;
      Notification.job_sought = Notif.job_sought;
      return Notification;
    } else {
      return { notification: false, branch_activity: 0, job_sought: '' };
    }
  }

  // Crée une object notification pour les formation
  createTrainNotification(Notif: any): any {
    let Notification: any = {};
    if (_.isObject(Notif)) {
      Notification.notification = Notif.notification;
      Notification.branch_activity = _.isObject(Notif.branch_activity) ? Notif.branch_activity.term_id : 0;
      return Notification;
    } else {
      return { notification: false, branch_activity: 0 };
    }
  }

  /**
   * Crée un champ pour une numéro de téléphone
   */
  onAddedCellphone() {
    let index = this.editor.Form.Cellphones.length;
    this.editor.Form.Cellphones.push({ value: '', id: index });
  }

  /**
   * Effacer un numéro dans le formulaire
   * @param cellId number
   */
  onRemoveCellphone(cellId: number) {
    this.editor.Form.Cellphones = _.reject(this.editor.Form.Cellphones, { id: cellId });
  }

  /**
   * Afficher une formulaire de modification de formation
   * @param tId - Formation id
   */
  onEditTraining(tId: number) {
    let currentTraining = _.find(this.editor.trainings, ['ID', tId]);
    if (!_.isObject(currentTraining)) return false;
    this.editor.Training = _.cloneDeep(currentTraining);
    let dateBegin = String(this.editor.Training.training_dateBegin);
    let dateEnd = String(this.editor.Training.training_dateEnd);
    // Trouver les formats exacte de la date de formation
    let _dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin) : (dateBegin.indexOf(' ') > -1 ? moment(dateBegin, 'MMMM YYYY', true) : moment(new Date(dateBegin)));
    let _dateEnd = dateEnd.indexOf('/') > -1 ? moment(dateEnd) : (dateEnd.indexOf(' ') > -1 ? moment(dateEnd, 'MMMM YYYY', true) : moment(new Date(dateEnd)));
    this.editor.Training.training_dateBegin = { month: _dateBegin.format('MMMM'), year: _dateBegin.format('YYYY') };
    this.editor.Training.training_dateEnd = { month: _dateEnd.format('MMMM'), year: _dateEnd.format('YYYY') };
    // Afficher le formulaire
    $('#edit-training-modal').modal('show')
  }

  /**
 * Mettre à jours la formation dans la base de donnée avec les autres formations existantes
 * @param trainingId 
 */
  onUpdateTraining(trainingId) {
    if (!_.isEmpty(this.editor.Training) && _.isNumber(trainingId)) {
      this.loadingSaveTraining = true;
      let Trainings = _.reject(this.editor.trainings, ['ID', trainingId]);
      let editTraining = _.clone(this.editor.Training);
      editTraining.validated = true;
      let dateBegin = moment(editTraining.training_dateBegin.month + ' ' + editTraining.training_dateBegin.year, 'MMMM YYYY', true);
      let dateEnd = moment(editTraining.training_dateEnd.month + ' ' + editTraining.training_dateEnd.year, 'MMMM YYYY', true);
      if (!dateBegin.isValid() || !dateEnd.isValid()) return;

      editTraining.training_dateBegin = dateBegin.format('MM/DD/YYYY');
      editTraining.training_dateEnd = dateEnd.format('MM/DD/YYYY');
      this.editor.trainings = _.cloneDeep(Trainings);
      this.editor.trainings.push(editTraining);
      this.editor.trainings = _.orderBy(this.editor.trainings, ['ID'], ['asc']);
      this.candidatService.updateTraining(this.editor.trainings, this.Candidate.ID)
        .subscribe(
          response => {
            this.editor.trainings = _.map(response, (training, index) => {
              training.ID = index;
              return training;
            });
            this.Candidate.loadingSaveTraining = false;
            $('#edit-training-modal').modal('hide');
          },
          error => {
            this.loadingSaveTraining = false;
          });
    } else {
      return false;
    }
  }

  /**
   * Afficher une formulaire de modification de l'expérience
   * @param eId 
   */
  onEditExperience(eId: number) {
    let currentExperience = _.find(this.editor.experiences, ['ID', eId]);
    if (!_.isObject(currentExperience)) return false;
    this.editor.Experience = _.cloneDeep(currentExperience);
    let dateBegin = this.editor.Experience.exp_dateBegin;
    let dateEnd = this.editor.Experience.exp_dateEnd;

    if (_.isNull(dateBegin) || _.isEmpty(dateBegin) || dateBegin === 'Invalid date') {
      if (!_.isEmpty(this.editor.Experience.old_value.exp_dateBegin)) {
        dateBegin = this.editor.Experience.old_value.exp_dateBegin;
      }
    } else {
      dateBegin = String(dateBegin);
    }

    if (_.isNull(dateEnd) || _.isEmpty(dateEnd) || dateEnd === 'Invalid date') {
      if (!_.isEmpty(this.editor.Experience.old_value.exp_dateEnd)) {
        dateEnd = this.editor.Experience.old_value.exp_dateEnd;
      }
    } else {
      dateEnd = String(dateEnd);
    }
    
    let _dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin) : (dateBegin.indexOf(' ') > -1 ? moment(dateBegin, 'MMMM YYYY', true) : moment(dateBegin));
    if (!_dateBegin.isValid()) {
      this.editor.Experience.exp_dateBegin = { month: '', year: '' };
    } else {
      this.editor.Experience.exp_dateBegin = { month: _dateBegin.format('MMMM'), year: _dateBegin.format('YYYY') };
    }

    let _dateEnd = dateEnd.indexOf('/') > -1 ? moment(dateEnd) : (dateEnd.indexOf(' ') > -1 ? moment(dateEnd, 'MMMM YYYY', true) : moment(dateEnd));
    if (!_dateEnd.isValid()) {
      this.editor.Experience.exp_dateEnd = { month: '', year: '' };
    } else {
      this.editor.Experience.exp_dateEnd = { month: _dateEnd.format('MMMM'), year: _dateEnd.format('YYYY') };
    }

    let abranch = this.editor.Experience.exp_branch_activity;
    this.editor.Experience.exp_branch_activity = abranch && _.isObject(abranch) ? abranch.term_id : null;
    $('#edit-experience-modal').modal('show');
  }


  /**
   * Effacer une formation et mettre à jours la base de donné
   * @param trainingId 
   */
  onDeleteTraining(trainingId: any) {
    let id: number = parseInt(trainingId);
    let Training: any = _.reject(this.editor.trainings, ['ID', id]);
    this.loadingSaveTraining = true;
    this.candidatService.updateTraining(Training, this.Candidate.ID)
      .subscribe(response => {
        $('#edit-training-modal').modal('hide');
        this.editor.trainings = _.cloneDeep(Training);
        this.loadingSaveTraining = false;
      });
  }

  /**
   * Mettre à jour l'experience et les autres expériences dans la base de donnée
   * @param experienceId 
   */
  onUpdateExperience(experienceId: any) {
    if (!_.isEmpty(this.editor.Experience) && _.isNumber(experienceId)) {
      this.loadingSaveExperience = true;
      // Crée une nouvelle liste sans l'expérience actuellement modifier
      let Experiences = _.reject(this.editor.experiences, ['ID', experienceId]);
      let editExperience = _.clone(this.editor.Experience);
      editExperience.validated = true;
      let expBegin = _.clone(editExperience.exp_dateBegin);
      let expEnd = _.clone(editExperience.exp_dateEnd);
      let dateBegin = `${expBegin.month} ${expBegin.year}`;
      let dateEnd = `${expEnd.month} ${expEnd.year}`;

      expBegin = moment(dateBegin, 'MMMM YYYY', true);
      expEnd = moment(dateEnd, 'MMMM YYYY', true);

      if (!expBegin.isValid() || !expEnd.isValid()) return;

      editExperience.exp_dateBegin = expBegin.format('MM/DD/YYYY');
      editExperience.exp_dateEnd = expEnd.format('MM/DD/YYYY');

      this.editor.experiences = _.cloneDeep(Experiences); // Modifier la liste des experiences
      this.editor.experiences.push(editExperience); // Ajouter la nouvelle experience dans la liste
      this.editor.experiences = _.orderBy(this.editor.experiences, ['ID'], ['asc']);
      this.candidatService.updateExperience(this.editor.experiences, this.Candidate.ID)
        .subscribe(
          response => {
            this.editor.experiences = _.map(response, (experience, index) => {
              experience.ID = index;
              return experience;
            });
            $('#edit-experience-modal').modal('hide');
            this.loadingSaveExperience = false;
          },
          error => {
            this.loadingSaveExperience = false;
          });
    }
  }

  /**
   * Effacer une expérience et mettre à jours la base de donné
   * @param experienceId 
   */
  onDeleteExperience(experienceId: any) {
    let id: number = parseInt(experienceId);
    let Experiences: any = _.reject(this.editor.experiences, ['ID', id]);
    this.loadingSaveExperience = true;
    this.candidatService.updateExperience(Experiences, this.Candidate.ID)
      .subscribe(response => {
        $('#edit-experience-modal').modal('hide');
        this.editor.experiences = _.cloneDeep(Experiences);
        this.loadingSaveExperience = false;
      });
  }

  /**
   * Cette function se déclanche quand on choisi une image d'avatar
   * @param ev event
   */
  onFileChange(ev: any) {
    if (ev.target.files && ev.target.files[0]) {
      var reader = new FileReader();
      this.inputAvatar = ev.target.files;
      const component = this;
      reader.onload = function (e: any) {
        component.avatar.preview = e.target.result;
      }
      reader.readAsDataURL(ev.target.files[0]);
    }
  }

  /**
   * Vérifier les entrées
   * @param editForm NgForm
   */
  onSubmitForm(editForm: NgForm) {
    if (editForm.valid) {
      this.loadingSave = true;
      let driveLicences = { a_: 0, a: 1, b: 2, c: 3, d: 4 };
      let Form = _.clone(editForm.value);
      Form.cellphones = Object.values(Form.cellphones);
      Form.drivelicences = _.map(Form.drivelicences, (value: any, key) => {
        return value ? driveLicences[key] : '';
      });
      Form.drivelicences = _.without(Form.drivelicences, '');

      if (_.isObject(this.inputAvatar) && this.inputAvatar.length > 0) {
        let file: File = this.inputAvatar[0];
        let formData: FormData = new FormData();
        formData.append('upload', file);
        let headers = new Headers();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        this.Http.post(`${this.apiUploadEndPoint}`, formData)
          .subscribe(
            data => {
              let response: any = data;
              if (response.success) {
                // Success upload
                this.saveCandidate(Form, response.attachment_id);
              } else {
                this.loadingSave = false;
                swal('Erreur', "Une erreur s'est produite", 'warning');
              }
            },
            error => {
              this.loadingSave = false;
              swal('Erreur', error, 'error');
            }
          )
      } else {
        this.saveCandidate(Form);
      }
    } else {
      swal('Avertissement', "Veuillez verifier les champs incorrect dans le formulaire", "error");
    }
  }

  /**
   * Envoyer les modifications au serveur
   * @param Form any
   * @param attachment_id number (facultatif)
   */
  private saveCandidate(Form: any, attachment_id?: number) {
    if (!_.isUndefined(attachment_id))
      Form.attachment_id = attachment_id;
    this.candidatService.saveCandidate(Form.ID, Form)
      .subscribe(response => {
        swal("Modification", "La modification a été effectuée", "success");
        this.loadingSave = false;
      });
  }

  /**
   * Crée une variable pour la modification du formulaire
   * @param contents object
   */
  private setEditorForm(contents) {
    if (!_.isObject(contents)) return false;
    let keys = Object.keys(contents);
    for (let i of keys) {
      this.editor.Form[i] = contents[i];
    }
    Helpers.setLoading(false);
  }

  /**
   * Charger les nom de la ville et les code postal
   */
  townLoadingFn() {
    this.townLoading = true;
    this.requestServices.getTown().subscribe(x => {
      this.Towns = _.cloneDeep(x);
      this.townLoading = false;
    })
  }

  /**
   * Charger les secteurs d'activités
   */
  areaLoadingFn() {
    this.areaLoading = true;
    this.requestServices.getArea().subscribe(x => {
      this.branchActivitys = _.cloneDeep(x)
      this.branchActivitys.push({ name: "Tous les métiers", term_id: 0 });
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
        })


      // $('.dd').nestable({
      //   maxDepth: 0
      // });

      $('#edit-training-modal').modal({
        keyboard: false,
        show: false
      });

      $('.input-group.date').datetimepicker({
        format: "mm/dd/yyyy",
        minView: "days",
        todayBtn: false,
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true
      });
    }, 1500);
  }

  /**
   * Filtrage pour des recherches dans une element "select"
   * @param term 
   * @param item 
   */
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
