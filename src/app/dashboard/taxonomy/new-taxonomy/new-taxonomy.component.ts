import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../environments/environment';
declare var $:any;
@Component({
  selector: 'app-new-taxonomy',
  templateUrl: './new-taxonomy.component.html',
  styleUrls: ['./new-taxonomy.component.css']
})
export class NewTaxonomyComponent implements OnInit {
  public loading: boolean = false;
  public title: string = '';
  @Input() public taxonomy: string;
  @Output() private refresh = new EventEmitter();
  constructor(
    private Http: HttpClient
  ) { }

  ngOnInit() {
    $('#added-taxonomy-modal')
      .on('hide.bs.modal', (event) => {
        this.title = '';
      })
  }

  public open() {
    $('#added-taxonomy-modal').modal('show');
  }

  public onAddTerm(Form: NgForm): void {
    if (Form.valid) {
      this.loading = true;
      let Values = Form.value;
      let formData = new FormData()
      formData.append('title', this.title);
      this.Http.post(`${config.itApi}/taxonomy/${this.taxonomy}`, formData)
        .subscribe(
          data => {
            let response: any = data;
            if (response.success) {
              $('#added-taxonomy-modal').modal('hide');
              this.refresh.emit();
              swal('Succès', response.message, 'success');
            } else {
              swal('Information', response.message, 'info');
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

}
