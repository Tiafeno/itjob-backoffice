import { Component, OnInit, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';

import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../environments/environment';
declare var $:any;
@Component({
  selector: 'app-status-changer',
  templateUrl: './status-changer.component.html',
  styleUrls: ['./status-changer.component.css']
})
export class StatusChangerComponent implements OnInit, AfterViewInit {
  private postId:number = 0;
  public status:string;
  public currentStatus:string;
  public loading: boolean = false;
  public warning: boolean = false

  @Output() refresh = new EventEmitter();
  @Input() posttype: string;

  constructor(
    private Http: HttpClient
  ) { }

  public onOpenDialog(postId: number, type: any) {
    this.status = _.clone(type);
    this.currentStatus = _.clone(type);
    this.postId = postId;
    $('#edit-status-changer-modal').modal('show');
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let component = this;
    $('#edit-status-changer-modal')
      .on('hidden.bs.modal', function (e) {
        component.warning = false;
      })
  }

  public onUpdateStatus(): boolean {
    if (this.status === this.currentStatus) {
      this.warning = true;
      return false;
    }
    if (!_.isEmpty(this.status) && this.postId !== 0) {
      this.loading = true;
      let changeStatus = this.Http.get(`${config.itApi}/post/${this.postId}?action=change_status&val=${this.status}`, { responseType: 'json' });
      changeStatus.subscribe(response => {
        let resp: any = response;
        this.loading = false;
        if (resp.success) {
          $('#edit-status-changer-modal').modal('hide');
          this.refresh.emit();
        }
      }, error => {
        this.loading = false;
        console.log(error);
      })
    }
  }

}
