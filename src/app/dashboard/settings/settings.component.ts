import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { config } from '../../../environments/environment';
import WPAPI from 'wpapi';
import * as _ from 'lodash';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, AfterViewInit {
  public wp: any;
  public users: any[];
  public loading: boolean = false;
  public Form: any = {};
  constructor(
    private authService: AuthService
  ) {
    this.wp = new WPAPI({ endpoint: config.apiEndpoint });
    let currentUser = this.authService.getCurrentUser();
    this.wp.setHeaders({ Authorization: `Bearer ${currentUser.token}` });

    var namespace = 'wp/v2'; // use the WP API namespace
    var routeUsers = '/users/(?P<id>)'; // route string - allows optional ID parameter
    this.wp.users = this.wp.registerRoute(namespace, routeUsers, {
      params: ['roles', 'context']
    });
  }

  onEditUser(user: any): void {
    // Réfuser l'accès au commercial de modifier cette option
    if (!this.authService.notUserAccess("contributor")) return;
    if (!this.authService.notUserAccess("editor")) return;
    
    this.Form.email = _.clone(user.email);
    this.Form.ID = _.clone(user.id);
    $('#edit-user-modal').modal('show');
  }

  onSubmitForm(Form: NgForm): void {
    if (Form.valid) {
      let values: any = _.clone(Form.value);
      let userId: number = parseInt(values.ID);
      this.wp.users().id(userId).update({
        password: $.trim(values.pwd)
      }).then(
        resp => {
          $('#edit-user-modal').modal('hide');
          swal('Succès', "Modification effectuer avec succès", 'success');
        }, 
        error => {
          swal('Erreur', "Une erreur s'est produite. Veuillez réessayer ultérieurement", 'error');
        })
    }
  }

  ngOnInit() {
    $('#edit-user-modal').on('hide.bs.modal', (e) => {
      this.Form.pwd   = "";
      this.Form.pwdconf = "";
    });
  }

  ngAfterViewInit() {
    this.loading = true;
    this.wp.users().roles('administrator,editor,contributor').context('edit').then(resp => {
      if (_.isArray(resp)) {

        this.users = _.clone(resp);
        this.loading = false;
      }
    });
  }

}
