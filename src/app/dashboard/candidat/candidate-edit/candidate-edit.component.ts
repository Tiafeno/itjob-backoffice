import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateService } from '../../../services/candidate.service';
import * as WPAPI from 'wpapi';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as lightbox from 'lightbox2';
import swal from 'sweetalert2';
import { Helpers } from '../../../helpers';
import { NgForm } from '@angular/forms';
import { RequestService } from '../../../services/request.service';
import { config } from '../../../../environments/environment';
import { PlatformLocation } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
declare var $: any;
declare var jsPDF: any;
declare var Bloodhound: any;
declare var rasterizeHTML: any;
declare var html2canvas: any;

@Component({
   selector: 'app-candidate-edit',
   templateUrl: './candidate-edit.component.html',
   styleUrls: ['./candidate-edit.component.css'],
   encapsulation: ViewEncapsulation.None
})
export class CandidateEditComponent implements OnInit, AfterViewInit {
   public id: number;
   public WPEndpoint: any;
   public loadingPdf: boolean = false;
   public loadingForm: boolean = false;
   public loadingSave: boolean = false;
   public loadingSaveExperience: boolean = false;
   public loadingSaveTraining: boolean = false;
   public modeExperience: string = null; // edit or new
   public modeTraining: string = null; // edit or new
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
   public noAvatar: string;
   public inputAvatar: FileList;
   public Months: Array<any> = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
   public Years: Array<number> = _.range(1959, new Date().getFullYear() + 1);
   public tinyMCESettings: any = {
      language: 'fr_FR',
      menubar: false,
      content_css: [
         '//fonts.googleapis.com/css?family=Montserrat:300,300i,400,400i',
         '//www.tinymce.com/css/codepen.min.css'
      ],
      content_style: ".mce-content-body p { margin: 5px 0; }",
      skin_url: '/assets/tinymce/skins/lightgray',
      inline: false,
      statusbar: true,
      resize: true,
      browser_spellcheck: true,
      min_height: 320,
      height: 320,
      toolbar: 'undo redo | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat ',
      plugins: ['lists'],
   };
   constructor(
      private route: ActivatedRoute,
      private candidatService: CandidateService,
      private requestServices: RequestService,
      private authService: AuthService,
      private Http: HttpClient,
      public platformLocation: PlatformLocation
   ) {
      moment.locale('fr');
      this.noAvatar = (this.platformLocation as any).location.origin + "/assets/img/image.png";
      this.Candidate.status = true;
      this.editor.Form = {};
      this.editor.Form.Address = {};
      this.avatar.preview = _.clone(this.noAvatar);
   }

   ngOnInit() {
      Helpers.setLoading(true);
      this.loadingForm = true;
      this.route.parent.params.subscribe(params => {
         this.id = params.id;
         this.candidatService
            .getCandidate(this.id)
            .subscribe(
               candidate => {
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
                     });

                  // Added Endpoints
                  this.WPEndpoint = new WPAPI({
                     endpoint: config.apiEndpoint,
                  });

                  var namespace = 'wp/v2'; // use the WP API namespace
                  var route = '/candidate/(?P<id>\\d+)'; // route string - allows optional ID parameter

                  // wpapi = an instance of `node-wpapi`
                  this.WPEndpoint.candidate = this.WPEndpoint.registerRoute(namespace, route);

                  let currentUser = this.authService.getCurrentUser();
                  this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` })
               }, error => {

               });
      });
   }

   loadForm() {
      let experiences = _.map(this.Candidate.experiences, (experience, index) => {
         experience.ID = index;
         return experience;
      });

      // Afficher les expériences par ordre de date
      this.editor.experiences = _.orderBy(experiences, (exp) => {
         let dateBegin: any = _.isNull(exp.exp_dateBegin) ? exp.old_value.exp_dateBegin : exp.exp_dateBegin;
         if (_.isEmpty(dateBegin) || _.isNull(dateBegin)) return exp.ID;
         dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin) : moment(dateBegin.toLowerCase(), 'MMMM YYYY');
         if (dateBegin.isValid())
            return new Date(dateBegin.format('MM-DD-YYYY'));
         return exp.ID;
      }, ['desc']);

      let trainings = _.map(this.Candidate.trainings, (training, index) => {
         training.ID = index;
         return training;
      });

      // Afficher les formation par ordre de date
      this.editor.trainings = _.orderBy(trainings, (train) => {
         let dateBegin: any = _.isNull(train.training_dateBegin) ? null : train.training_dateBegin;
         if (_.isNull(dateBegin)) return train.ID;
         dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin) : moment(dateBegin.toLowerCase(), 'MMMM YYYY');
         console.info('Formation: ', dateBegin);
         if (dateBegin.isValid())
            return new Date(dateBegin.format('MM-DD-YYYY'));
         return train.ID;
      }, ['desc']);

      this.avatar.preview = this.Candidate.privateInformations.avatar ? this.Candidate.privateInformations.avatar[0] : this.avatar.preview;
      this.avatar.value = this.Candidate.privateInformations.avatar ? true : false;
      let pI = _.clone(this.Candidate.privateInformations);
      let cellphones: Array<any> = _.isArray(pI.cellphone) ? pI.cellphone : [];
      let currentDriveLicences = _.isArray(this.Candidate.driveLicences) ? _.map(this.Candidate.driveLicences, 'value') : [];
      currentDriveLicences = _.map(currentDriveLicences, _.unary(parseInt));
      let dLicencesScheme = [
         { id: 0, value: 'A`', name: 'a_', checked: false },
         { id: 1, value: 'A', name: 'a', checked: false },
         { id: 2, value: 'B', name: 'b', checked: false },
         { id: 3, value: 'C', name: 'c', checked: false },
         { id: 4, value: 'D', name: 'd', checked: false },
         { id: 5, value: 'Aucun', name: 'none', checked: false },
      ];
      let dLicences = _.isArray(this.Candidate.driveLicences) ? _.map(dLicencesScheme, (dLicence) => {
         dLicence.checked = _.indexOf(currentDriveLicences, dLicence.id) >= 0;
         return dLicence;
      }) : dLicencesScheme;

      if (_.every(dLicences, ['checked', false])) {
         dLicences[5].checked = true;
      }

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
         DriveLicences: dLicences,
         Town: _.isObject(pI.address.country) ? pI.address.country.term_id : null,
         Address: pI.address,
         Jobs: _.isArray(currentJobs) ? currentJobs : [],
         _Jobs: !_.isArray(currentJobs) ? currentJobs : false,
         Language: _.isArray(this.Candidate.languages) ? _.map(this.Candidate.languages, 'term_id') : [],
         Cellphones: _.map(cellphones, (cel, index) => { let uniqid = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10); return { value: cel, id: uniqid } }),
         Avatar: pI.avatar,
         Firstname: pI.firstname,
         Lastname: pI.lastname,
         Email: pI.author.data.user_email,
         Birthday: !_.isEmpty(pI.birthday_date) ? moment(pI.birthday_date, 'DD/MM/YYYY').format("DD/MM/YYYY") : null,
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
      let uniqid = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
      this.editor.Form.Cellphones.push({ value: '', id: uniqid });
   }

   /**
    * Effacer un numéro dans le formulaire
    * @param cellId number
    */
   onRemoveCellphone(cellid: string) {
      this.editor.Form.Cellphones = _.reject(this.editor.Form.Cellphones, { id: cellid });
   }

   /**
    * Afficher une formulaire de modification de formation
    * @param tId - Formation id
    */
   onEditTraining(tId: number) {
      this.modeTraining = 'edit';
      this.setTrainingEditor(tId).then(() => {
         // Afficher le formulaire
         $('#edit-training-modal').modal('show')
      }, error => {
         swal('Erreur', "Une erreur s'est produite pendant la chargement de la formation dans l'éditeur");
      })

   }

   /**
    * Mettre à jours la formation dans la base de donnée avec les autres formations existantes
    * @param trainingId
    */
   onUpdateTraining(trainingId: number, validator?: boolean): void {
      if (!_.isUndefined(validator) && validator) {
         this.setTrainingEditor(trainingId).then(() => {
            this.updateTraining(trainingId);
         }, error => {
            swal('Erreur', "Une erreur s'est produite pendant la chargement de la formation dans l'éditeur");
         })
      } else {
         this.updateTraining(trainingId);
      }
   }

   private updateTraining(trainingId: number): any {
      if (!_.isEmpty(this.editor.Training) && _.isNumber(trainingId)) {
         this.loadingSaveTraining = true;
         let Trainings = _.reject(this.editor.trainings, ['ID', trainingId]);
         let editTraining = _.clone(this.editor.Training);
         editTraining.validated = true;
         let dateBegin = moment(editTraining.training_dateBegin.month + ' ' + editTraining.training_dateBegin.year, 'MMMM YYYY');
         let dateEnd = moment(editTraining.training_dateEnd.month + ' ' + editTraining.training_dateEnd.year, 'MMMM YYYY');
         if (!dateBegin.isValid() || !dateEnd.isValid()) {
            swal('Erreur', "La date n'est pas valide", 'warning');
            return false;
         }

         editTraining.training_dateBegin = dateBegin.format('MM/DD/YYYY');
         editTraining.training_dateEnd = dateEnd.format('MM/DD/YYYY');
         this.editor.trainings = _.cloneDeep(Trainings);
         this.editor.trainings.push(editTraining);
         this.candidatService.updateTraining(this.editor.trainings, this.Candidate.ID)
            .subscribe(
               response => {
                  let trainings = _.map(response, (training, index) => {
                     training.ID = index;
                     return training;
                  });
                  this.editor.trainings = _.orderBy(trainings, (train) => {
                     let dateBegin: any = _.isNull(train.training_dateBegin) ? null : train.training_dateBegin;
                     if (_.isNull(dateBegin)) return train.ID;
                     dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin.toLowerCase()) : moment(dateBegin.toLowerCase(), 'MMMM YYYY');
                     if (dateBegin.isValid())
                        return new Date(dateBegin.format('MM-DD-YYYY'));
                     return train.ID;
                  }, ['desc']);
                  this.loadingSaveTraining = false;
                  $('#edit-training-modal').modal('hide');
               },
               error => {
                  this.loadingSaveTraining = false;
               });
      } else {
         return false;
      }
   }

   private setTrainingEditor(trainingId: number): any {
      return new Promise((resolve, reject) => {
         let currentTraining = _.find(this.editor.trainings, ['ID', trainingId]);
         if (!_.isObject(currentTraining)) reject(false);
         this.editor.Training = _.cloneDeep(currentTraining);
         let dateBegin:string = this.editor.Training.training_dateBegin;
         let dateEnd:string = this.editor.Training.training_dateEnd;
         // Trouver les formats exacte de la date de formation
         let _dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin) : (dateBegin.indexOf(' ') > -1 ? moment(dateBegin, 'MMMM YYYY') : moment(new Date(dateBegin)));
         let _dateEnd = dateEnd.indexOf('/') > -1 ? moment(dateEnd) : (dateEnd.indexOf(' ') > -1 ? moment(dateEnd, 'MMMM YYYY') : moment(new Date(dateEnd)));
         this.editor.Training.training_dateBegin = { month: _dateBegin.format('MMMM'), year: _dateBegin.format('YYYY') };
         this.editor.Training.training_dateEnd = { month: _dateEnd.format('MMMM'), year: _dateEnd.format('YYYY') };

         resolve(true);
      })
   }

   onNewTraining(): void {
      this.modeTraining = 'new';

      let id: number = this.editor.trainings.length;
      this.editor.Training = {
         ID: id,
         training_dateBegin: { month: null, year: null },
         training_dateEnd: { month: null, year: null },
      };

      $('#edit-training-modal').modal('show');
   }

   /**
    * Effacer une formation et mettre à jours la base de donné
    * @param trainingId
    */
   onDeleteTraining(trainingId: any) {
      if (!this.authService.notUserAccess("contributor")) return;

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
    * Afficher une formulaire de modification de l'expérience
    * @param eId
    */
   onEditExperience(eId: number) {
      this.modeExperience = 'edit';
      this.setExperienceEditor(eId).then(
         resp => {
            $('#edit-experience-modal').modal('show');
         },
         error => {

         }
      );

   }

   /**
    * Event click function
    * Ajouter des donnée vide dans le formulaire
    */
   onNewExperience(): void {
      this.modeExperience = 'new';
      let id: number = this.editor.experiences.length;
      this.editor.Experience = {
         ID: id,
         exp_dateBegin: { month: null, year: null },
         exp_dateEnd: { month: null, year: null },
         exp_mission: ''
      };

      $('#edit-experience-modal').modal('show');
   }

   private setExperienceEditor(eId: number): any {
      return new Promise((resolve, reject) => {
         let currentExperience = _.find(this.editor.experiences, ['ID', eId]);
         if (!_.isObject(currentExperience)) reject(false);
         this.editor.Experience = _.cloneDeep(currentExperience);
         let dateBegin:string = this.editor.Experience.exp_dateBegin;
         let dateEnd:string = this.editor.Experience.exp_dateEnd;

         if (_.isNull(dateBegin) || _.isEmpty(dateBegin) || dateBegin === 'Invalid date') {
            if (!_.isEmpty(this.editor.Experience.old_value.exp_dateBegin)) {
               dateBegin = this.editor.Experience.old_value.exp_dateBegin;
            } else {
               dateBegin = '';
            }
         } else {
            dateBegin = dateBegin;
         }

         if (_.isNull(dateEnd) || _.isEmpty(dateEnd) || dateEnd === 'Invalid date') {
            if (!_.isEmpty(this.editor.Experience.old_value.exp_dateEnd)) {
               dateEnd = this.editor.Experience.old_value.exp_dateEnd;
            } else {
               dateEnd = '';
            }
         } else {
            dateEnd = dateEnd;
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

         resolve(true);
      });
   }

   /**
    * Mettre à jour l'experience et les autres expériences dans la base de donnée
    * @param experienceId
    */
   onUpdateExperience(experienceId: any, validator?: boolean) {
      if (!_.isUndefined(validator) && validator) {
         this.setExperienceEditor(experienceId).then(() => {
            this.updateExperience(experienceId);
         })
      } else {
         this.updateExperience(experienceId);
      }

   }

   private updateExperience(eId: number) {
      if (!_.isEmpty(this.editor.Experience) && _.isNumber(eId)) {
         this.loadingSaveExperience = true;
         // Crée une nouvelle liste sans l'expérience actuellement modifier
         let Experiences = _.reject(this.editor.experiences, ['ID', eId]);
         let editExperience = _.clone(this.editor.Experience);
         // Activer l'experience...
         editExperience.validated = true;
         let expBegin = _.clone(editExperience.exp_dateBegin);
         let expEnd = _.clone(editExperience.exp_dateEnd);
         let dateBegin = `${expBegin.month} ${expBegin.year}`;
         let dateEnd = _.isEmpty(expEnd.month) || _.isEmpty(expEnd.year) ? '' : `${expEnd.month} ${expEnd.year}`;

         expBegin = moment(dateBegin, 'MMMM YYYY');
         expEnd = _.isEmpty(dateEnd) ? '' :  moment(dateEnd, 'MMMM YYYY');

         if (!expBegin.isValid()) {
            this.loadingSaveExperience = false;
            return;
         }

         editExperience.exp_dateBegin = expBegin.format('MM/DD/YYYY');
         editExperience.exp_dateEnd = _.isEmpty(expEnd) ? '' : expEnd.format('MM/DD/YYYY');

         this.editor.experiences = _.cloneDeep(Experiences); // Modifier la liste des experiences
         this.editor.experiences.push(editExperience); // Ajouter la nouvelle experience dans la liste

         this.editor.experiences = _.orderBy(this.editor.experiences, (exp) => {
            let dateBegin: any = _.isNull(exp.exp_dateBegin) || _.isEmpty(exp.exp_dateBegin) ? exp.old_value.exp_dateBegin : exp.exp_dateBegin;
            if (_.isEmpty(dateBegin) || _.isNull(dateBegin)) return exp.ID;
            dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin.toLowerCase()) : moment(dateBegin.toLowerCase(), 'MMMM YYYY');
            if (dateBegin.isValid())
               return new Date(dateBegin.format('MM-DD-YYYY'));
            return exp.ID;
         }, ['desc']);

         this.candidatService.updateExperience(this.editor.experiences, this.Candidate.ID)
            .subscribe(
               response => {
                  let experiences = _.map(response, (experience, index) => {
                     experience.ID = index;
                     return experience;
                  });
                  this.editor.experiences = _.orderBy(experiences, (exp) => {
                     let dateBegin: any = _.isNull(exp.exp_dateBegin) ? exp.old_value.exp_dateBegin : exp.exp_dateBegin;
                     if (_.isEmpty(dateBegin) || _.isNull(dateBegin)) return exp.ID;
                     dateBegin = dateBegin.indexOf('/') > -1 ? moment(dateBegin.toLowerCase()) : moment(dateBegin.toLowerCase(), 'MMMM YYYY');
                     if (dateBegin.isValid())
                        return new Date(dateBegin.format('MM-DD-YYYY'));
                     return exp.ID;
                  }, ['desc']);
                  $('#edit-experience-modal').modal('hide');
                  this.loadingSaveExperience = false;
               },
               error => {
                  this.loadingSaveExperience = false;
               });
      } else {
         swal("Erreur", "Impossible de trouver l'expérience", 'error');
      }
   }

   /**
    * Effacer une expérience et mettre à jours la base de donné
    * @param experienceId
    */
   onDeleteExperience(experienceId: any) {
      if (!this.authService.notUserAccess("contributor")) return;

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
         reader.onload = (e: any) => {
            this.avatar.preview = e.target.result;
            this.avatar.value = true;
         }

         this.WPEndpoint.media()
            // Specify a path to the file you want to upload, or a Buffer
            .file(this.inputAvatar[0])
            .create({
               title: this.Candidate.privateInformations.firstname + " " + this.Candidate.privateInformations.lastname,
               alt_text: this.Candidate.title
            })
            .then((attach) => {
               // Your media is now uploaded: let's associate it with a post
               var newImageId = attach.id;
               this.WPEndpoint.media().id(newImageId)
                  .update({
                     post: this.Candidate.ID
                  })
                  .then(m => {
                     reader.readAsDataURL(ev.target.files[0]);
                     this.WPEndpoint.candidate().id(this.Candidate.ID).update({ featured_media: m.id });
                  })
            })
            .then((resp) => {
               console.log('Media ID #' + resp.id);
               console.log('is now associated with Post ID #' + resp.post);
            });
      }
   }

   onRemoveFile(): void {
      if (this.avatar.value) {
         swal({
            title: 'Confirmation',
            text: `Voulez-vous supprimer la photo de profil du candidat ?`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Annuler"
         }).then((result) => {
            if (result.value) {
               this.WPEndpoint.candidate().id(this.Candidate.ID).then(resp => {
                  let post: any = resp;
                  if (_.isNumber(post.featured_media) && post.featured_media !== 0) {
                     this.WPEndpoint.media().id(post.featured_media)
                        .update({
                           post: null
                        })
                        .then(response => {
                           let attachment: any = response;
                           this.WPEndpoint.media().id(attachment.id)
                              .delete({ force: true })
                              .then(() => {
                                 this.WPEndpoint.candidate().id(this.Candidate.ID).update({ featured_media: null });
                                 this.avatar.preview = _.clone(this.noAvatar);
                                 this.avatar.value = false;
                              });
                        });
                  } else {
                     this.avatar.preview = _.clone(this.noAvatar);
                     this.avatar.value = false;
                  }
               })
               // For more information about handling dismissals please visit
               // https://sweetalert2.github.io/#handling-dismissals
            } else if (result.dismiss === swal.DismissReason.cancel) {

            }
         })
      }
   }

   onDownloadCV(): void {
      this.loadingPdf = true;
      this.Http.get(`${config.itApi}/candidate/${this.Candidate.ID}?ref=downloadpdf`)
         .subscribe(response => {
            let options: any = response;
            this.loadingPdf = false;
            window.open( options.link + "?cvId=" + this.Candidate.ID + "&key=" + options.key, '_blank');
         });
   }

   onChangeDriveLicence(Drives: any, name: string): void {
      let Dl: any = Drives.value;
      if (name === 'none') {
         this.editor.Form.DriveLicences = _.forEach(this.editor.Form.DriveLicences, (dLicence) => {
            if (dLicence.name !== 'none' && Dl.none) {
               dLicence.checked = false;
            }
            return dLicence;
         });
      } else {
         this.editor.Form.DriveLicences = _.forEach(this.editor.Form.DriveLicences, (dLicence) => {
            if (dLicence.name === 'none') {
               dLicence.checked = false;
            }
            return dLicence;
         });
      }

   }

   /**
    * Vérifier les entrées
    * @param editForm NgForm
    */
   onSubmitForm(editForm: NgForm): any {
      if (editForm.valid) {
         this.loadingSave = true;
         let driveLicences = { a_: 0, a: 1, b: 2, c: 3, d: 4, none: 5 };
         let Form: any = _.clone(editForm.value);
         Form.cellphones = Object.values(Form.cellphones);
         Form.drivelicences = _.map(Form.drivelicences, (value: any, key) => {
            return value ? driveLicences[key] : -1;
         });
         Form.drivelicences = _.without(Form.drivelicences, -1, 5, undefined);
         this.saveCandidate(Form);
      } else {
         swal('Avertissement', "Veuillez verifier les champs incorrect dans le formulaire", "error");
         return false;
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
      setTimeout(() => {
         lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true
         })

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
            .on('hidden.bs.modal', (e) => {
               this.editor.Training = false;
            })
            .on('shown.bs.modal', function (e) {
               $(this).find('.select2').select2({
                  width: "100%"
               });
            });

         $('#edit-experience-modal')
            .on('hidde.bs.modal', (e) => {
               this.editor.Experience = false;
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
      $('#edit-experience-modal')
         .on('hide.bs.modal', (e) => {
            this.modeExperience = null
         });

      $('#edit-training-modal')
         .on('hide.bs.modal', (e) => {
            this.modeTraining = null
         });
   }

}
