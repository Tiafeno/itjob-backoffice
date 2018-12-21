import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../environments/environment';
declare var $:any;
@Component({
  selector: 'app-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.css']
})
export class SwitcherComponent implements OnInit, AfterViewInit  {
  private account:number = 0;
  private currentAccount:number = 0;
  private postId:number = 0;
  public loading: boolean = false;
  public warning: boolean = false;

  @Output() refresh = new EventEmitter();

  constructor( private http: HttpClient) { }
  ngOnInit() { }
  ngAfterViewInit() {
    let component = this;
    $('#edit-switcher-modal')
      .on('hidden.bs.modal', function (e) {
        component.warning = false;
      })
  }
  public onOpenDialog(postId: number, type: number) {
    this.account = _.clone(type);
    this.currentAccount = _.clone(type);
    this.postId = postId;
    $('#edit-switcher-modal').modal('show');
  }

  public onUpdateAccount(): boolean {
    if (this.account === this.currentAccount) {
      this.warning = true;
      return false;
    }
    if (this.account !== 0 && this.postId !== 0) {
      this.loading = true;
      let changeAccount = this.http.get(`${config.itApi}/company/${this.postId}?ref=account&type=${this.account}`, { responseType: 'json' });
      changeAccount.subscribe(response => {
        let resp: any = response;
        this.loading = false;
        if (resp.success) {
          $('#edit-switcher-modal').modal('hide');
          this.refresh.emit();
        }
      })
    }
  }

}
