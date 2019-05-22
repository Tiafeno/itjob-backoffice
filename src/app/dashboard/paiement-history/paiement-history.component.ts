import { Component, OnInit } from '@angular/core';
import { config } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import * as moment from 'moment';
declare var $:any;

@Component({
  selector: 'app-paiement-history',
  templateUrl: './paiement-history.component.html',
  styleUrls: ['./paiement-history.component.css']
})
export class PaiementHistoryComponent implements OnInit {
  public table: any;
  constructor(
    public auth: AuthService
  ) { }

  ngOnInit() {
    moment.locale('fr');
    const getData = (ev: any): any => {
      let el = $(ev.currentTarget).parents('tr');
      let data = this.table.row(el).data();
      return data;
    };
    const paiementTable = $('#paiement-table');
    this.table = paiementTable.DataTable({
      pageLength: 10,
      page: 1,
      select: 'single',
      ordering: false, // Activer ou désactiver l'affichage d'ordre
      fixedHeader: true,
      responsive: false,
      dom: '<"top"i><"info"r>t<"bottom"flp><"clear">',
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.16/i18n/French.json"
      },
      processing: true,
      serverSide: true,
      columns: [
        {data: 'id'},
        {data: 'billing', render: (data) => {
          return `${data.first_name} ${data.last_name}`;
        }},
        {data: 'line_items', render: (data) => {
          return data[0].name;
        }},
        {data: 'payment_method_title', render: (data) => {
          return data;
        }},
        {data: 'status', render: (data) => {
          return `<span class="badge badge-pill badge-default">${data}</span>`;
        }},
        {data: 'date_created', render: (data) => {
          return moment(data).format('LLL');
        }}
      ],
      initComplete: (setting, json) => {
      },
      ajax: {
        url: `${config.itApi}/paiement-history/`,
        dataType: 'json',
        data: {
          order: false,
        },
        beforeSend: (xhr) => {
          let currentUser = this.auth.getCurrentUser();
          if (currentUser && currentUser.token) {
            xhr.setRequestHeader("Authorization",
              `Bearer ${currentUser.token}`);
          }
        },
        type: 'POST',
      }
    });
  }

}
