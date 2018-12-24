import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
declare var $:any;
import { config } from '../../../../environments/environment';

@Component({
  selector: 'app-featured-switcher',
  templateUrl: './featured-switcher.component.html',
  styleUrls: ['./featured-switcher.component.css']
})
export class FeaturedSwitcherComponent implements OnInit, AfterViewInit {
  private postId:number = 0;
  public position:number;
  public currentPosition:number;
  public loading: boolean = false;
  public warning: boolean = false

  @Output() refresh = new EventEmitter();

  constructor(
    private Http: HttpClient
  ) { }

  public onOpen(postId: number, position: number): void {
    this.position = _.clone(position);
    this.currentPosition = _.clone(position);
    this.postId = postId;
    $('#edit-featured-modal').modal('show');
  }

  public onUpdate(): boolean {
    if (this.position === this.currentPosition) {
      this.warning = true;
      return false;
    }
    if (!_.isEmpty(this.position) && this.postId !== 0) {
      this.loading = true;
      let changePosition = this.Http.get(`${config.itApi}/candidate/${this.postId}?ref=featured&val=${this.position}`, { responseType: 'json' });
      changePosition.subscribe(response => {
        let resp: any = response;
        this.loading = false;
        if (resp.success) {
          $('#edit-featured-modal').modal('hide');
          this.refresh.emit();
        }
      })
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    let component = this;
    $('#edit-featured-modal')
      .on('hidden.bs.modal', function (e) {
        component.warning = false;
      })
    
  }

}
