import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { NgForm } from '@angular/forms';
import { config } from '../../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, concat, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
declare var $: any;

@Component({
  selector: 'app-edit-taxonomy',
  templateUrl: './edit-taxonomy.component.html',
  styleUrls: ['./edit-taxonomy.component.css']
})
export class EditTaxonomyComponent implements OnInit {
  public loading: boolean = false;
  public loadingReplace: boolean = false;
  public replace: any = {};

  public Terms = [];
  public byInput = new EventEmitter<string>();
  public by: any;

  @Input() public term: any;
  @Input() public taxonomy: string;
  @Output() private refresh = new EventEmitter();

  constructor(
    private Http: HttpClient
  ) { }

  ngOnInit() {
    this.typeahead();
  }

  public open() {
    $('#edit-taxonomy-modal').modal('show');

    $('#replace-taxonomy-modal')
      .on('hide.bs.modal', (event) => {
        this.by = '';
      })
  }

  public onUpdate(Form: NgForm) {
    if (Form.valid) {
      this.loading = true;
      let Values = Form.value;
      let formData = new FormData()
      formData.append('term', JSON.stringify(Values));
      this.Http.post(`${config.itApi}/taxonomy/${Values.term_id}/update`, formData)
        .subscribe(
          data => {
            let response: any = data;
            if (response.success) {
              $('#edit-taxonomy-modal').modal('hide');
              this.refresh.emit();
              swal('Succès', response.message, 'success');
            } else {
              swal('Erreur', "Une erreur s'est produite", 'warning');
            }
            this.loading = false;
          },
          error => {
            this.loading = false;
            swal('Erreur', error.message, 'error');
          }
        )
    }
  }

  public onReplace(): void | false {
    this.replace = _.clone(this.term);
    this.replace.name = '';
    if (_.isEmpty(this.replace)) return false;
    $('#edit-taxonomy-modal').modal('hide');
    $('#replace-taxonomy-modal').modal('show');
  }

  public onSubmitReplace(Rf: NgForm): void {
    if (Rf.valid) {
      this.loading = true;
      let values = Rf.value;
      let Fm = new FormData()
      Fm.append('params', JSON.stringify({ by: values.by, taxonomy: values.taxonomy }));
      this.Http.post(`${config.itApi}/taxonomy/${values.needle}/replace`, Fm)
        .subscribe(resp => {
          let data: any = resp;
          if (data.success) {
            this.refresh.emit();
            swal('Succès', data.message, 'success');
            $('#replace-taxonomy-modal').modal('hide');
          } else {
            swal('Erreur', data.message, 'warning');
          }

          this.loading = false;
        }, error => {
          this.loading = false;
        })
    }
  }

  private typeahead() {
    this.byInput.pipe(
      debounceTime(200),
      tap(() => this.loadingReplace = true),
      switchMap(term => this.Http.get<any>(`${config.itApi}/tax/search/${this.taxonomy}/${term}`).pipe(
        catchError(() => of([])), // empty list on error
        tap(() => this.loadingReplace = false)
      ))
    )
      .subscribe(items => {
        this.Terms = items;
      })
  }

  public onRemove(): void {
    this.loading = true;
    let formData = new FormData()
    formData.append('term', JSON.stringify({ taxonomy: this.taxonomy }));

    this.Http.post(`${config.itApi}/taxonomy/${this.term.term_id}/delete`, formData)
      .subscribe(
        data => {
          let response: any = data;
          if (response.success) {
            $('#edit-taxonomy-modal').modal('hide');
            this.refresh.emit();
            swal('Succès', response.message, 'success');
          } else {
            swal('Erreur', "Une erreur s'est produite", 'warning');
          }
          this.loading = false;
        },
        error => {
          this.loading = false;
          swal('Erreur', error.message, 'error');
        }
      )
  }

}
