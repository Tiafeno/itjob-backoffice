import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../environments/environment';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
declare var $:any;

@Component({
  selector: 'app-archived-candidate',
  templateUrl: './archived-candidate.component.html',
  styleUrls: ['./archived-candidate.component.css']
})
export class ArchivedCandidateComponent implements OnInit {
  private table: any;
  public selected: any = 0;
  @Input() private helper: any;
  @Output() private refresh = new EventEmitter();
  constructor(
    private Http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  reject(): void {
    this.changeArchiveStatusCandidate(0, this.selected).subscribe(response => {
      this.table.ajax.reload(null, false);
      this.selected = 0;
    });
  }

  openArchivedLists(): boolean {
    this.helper.setLoading(true);
    let archivedLists = $('#archived-table');
    if ( $.fn.DataTable.isDataTable( '#archived-table' ) ) {
      this.helper.setLoading(false);
      this.table.ajax.reload(null, false);
      $('#archived-candidate-modal').modal('show');
      return false;
    }
    
    this.table = archivedLists
    .DataTable({
      pageLength: 10,
      fixedHeader: true,
      responsive: true,
      select: 'single',
      dom: '<"top"i><"info"r>t<"bottom"flp><"clear">',
      processing: true,
      page: 0,
      serverSide: true,
      columns: [
        { data: 'ID' },
        { data: 'privateInformations.firstname' },
        { data: 'privateInformations.lastname' },
        {
          data: 'isActive', render: (data, type, row) => {
            let status = data && row.state === 'publish' ? 'Publier' : (row.state === 'pending' ? "En attente" : "Désactiver");
            let style = data && row.state === 'publish' ? 'primary' : (row.state === 'pending' ? "warning" : "danger");
            return `<span class="badge update-status badge-${style}">${status}</span>`;
          }
        },
        { data: 'reference' },
        {
          data: 'featured', render: (data) => {
            let value: string = data ? 'à la une' : 'standard';
            let style: string = data ? 'primary' : 'secondary';
            return `<span class="badge update-featured badge-${style} text-uppercase">${value}</span>`;
          }
        },
        {
          data: null,
          render: (data, type, row, meta) => `<span data-id='${row.ID}' class='edit-candidate badge badge-blue'>Modifier</span>`
        }
      ],
      initComplete: (setting, json) => {
        this.helper.setLoading(false);
        $('#archived-candidate-modal').modal('show');
      },
      ajax: {
        url: `${config.itApi}/candidate/archive/`,
        dataType: 'json',
        data: {
          order: false,
        },
        type: 'POST',
        beforeSend: function (xhr) {
          let currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (currentUser && currentUser.token) {
            xhr.setRequestHeader("Authorization",
              `Bearer ${currentUser.token}`);
          }
        }
      }
    });

    this.table
      .on('select',  (e, dt, type, indexes) => {
        let data = this.table.rows( indexes ).data();
        this.selected = _.isEmpty(data[0]) ? 0 : data[0];
      })
      .on('deselect', (e, dt, type, indexes) => {
        this.selected = 0;
      });

    $('#archived-table tbody')
      .on('click', '.edit-candidate', (e) => {
        e.preventDefault();
        $('#archived-candidate-modal').modal('hide');
        let data = $(e.currentTarget).data();
        this.router.navigate(['/candidate', data.id, 'edit']);
      })
    
      return true;
  }

  changeArchiveStatusCandidate(status: number, candidate: any): Observable<any> {
    if (candidate !== 0 && _.isObject(candidate)) {
      return this.Http.get(`${config.itApi}/candidate/${candidate.ID}?ref=archived&val=${status}`, { responseType: 'json'})
    }
    return Observable.of(false);
  }

}
