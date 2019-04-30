import {Component, Input, OnInit} from '@angular/core';
import  * as WPAPI from 'wpapi';
import {config} from "../../../environments/environment";
import {AuthService} from "../../services/auth.service";
import * as _ from "lodash";
import {NgForm} from "@angular/forms";
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  public EndPoint: any;
  public WalletId: number = 0;
  public formWallet: any = {};
  public loading: boolean = false;
  public credit: number = 0;

  constructor(
    private Auth: AuthService
  ) { }
  @Input() userId: number = 0;

  ngOnInit() {// Added Endpoints
    this.loading = true;
    this.EndPoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    const namespace = 'wp/v2';
    const route = '/wallets/(?P<id>\\d+)';
    this.EndPoint.wallet = this.EndPoint.registerRoute(namespace, route, {
      params: ['meta_key', 'meta_value']
    });
    const currentUser = this.Auth.getCurrentUser();
    this.EndPoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` });

    this.loadWallet();
  }

  onUpdateWallet(Form: NgForm): void {
    // Réfuser l'accès au commercial de modifier cette option
    if (!this.Auth.notUserAccess("contributor")) return;
    if (!this.Auth.notUserAccess("editor")) return;

    if (Form.valid) {

      this.loading = true;
      const data: any = Form.value;
      if (this.WalletId !== 0) {
        this.credit = _.isNaN(this.credit) ? 10 : this.credit;
        let newCredit: number = data.credit + this.credit;
        this.EndPoint.wallet().id(this.WalletId).update({ wallet: newCredit }).then(resp => {
          $('#edit-wallet-modal').modal('hide');
          this.loadWallet();
        })
      } else {
        this.loading = false;
        this.EndPoint.wallet().create({
          title: `#${this.userId}`,
          status: 'publish',
          wallet: Form.value.credit,
          user: this.userId,
          date_create: moment().format("YYYY-MM-DD h:mm:ss")
        })
          .then(resp => {
            $('#edit-wallet-modal').modal('hide');
            this.loadWallet();
          })
      }
    }
  }

  loadWallet() {
    this.EndPoint.wallet().meta_key('user').meta_value(this.userId).then(resp => {
      let results: Array<any> = _.clone(resp);
      if (_.isEmpty(results)) {
        this.loading = false;
        this.credit = 10;
        return false;
      }
      let wallet: any = results[0];
      this.credit = parseInt(wallet.wallet);
      this.WalletId = parseInt(wallet.id);
      this.loading = false;
      this.formWallet = {};
    });
  }

}
