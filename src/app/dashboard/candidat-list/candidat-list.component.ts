import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RequestService } from '../../services/request.service';

import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'app-candidat',
  templateUrl: './candidat-list.component.html',
  styleUrls: ['./candidat-list.component.css']
})
export class CandidatListComponent implements OnInit, AfterViewInit {
  public listsCandidat: Array<any>;
  constructor(public requestService: RequestService) {
  }

  ngOnInit() {
    // Ajouter ici un code pour recuperer les candidats...
    this.requestService
      .getCandidateLists()
      .subscribe(data => {
        this.listsCandidat = _.map(data, (value, index) => {
          value.jobNotif = value.jobNotif ? 'Oui' : 'Non';
          value.trainingNotif = value.trainingNotif ? 'Oui' : 'Non';
          return value;
        });

        setTimeout(() => {
          const table = $('#orders-table').DataTable({
            pageLength: 10,
            fixedHeader: true,
            responsive: false,
            "sDom": 'rtip',
            columnDefs: [{
              targets: 'no-sort',
              orderable: false
            }]
          });
          $('#key-search').on('keyup', function () {
            table.search(this.value).draw();
          });
          $('#type-filter').on('change', function () {
            table.column(4).search($(this).val()).draw();
          });
        }, 600);

      });
  }

  ngAfterViewInit() {

  }

}
