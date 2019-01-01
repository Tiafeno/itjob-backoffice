import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { NgForm } from '@angular/forms';
import { config } from '../../../../environments/environment';
declare var $: any;

@Component({
  selector: 'app-edit-taxonomy',
  templateUrl: './edit-taxonomy.component.html',
  styleUrls: ['./edit-taxonomy.component.css']
})
export class EditTaxonomyComponent implements OnInit {
  public loading: boolean = false;
  @Input() public term: any;
  @Input() public taxonomy: string;
  @Output() private refresh = new EventEmitter();

  constructor(
    private Http: HttpClient
  ) { }

  ngOnInit() {
  }

  public open() {
    $('#edit-taxonomy-modal').modal('show');
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
