import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../environments/environment';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Helpers } from '../../../helpers';
declare var $: any;

@Component({
  selector: 'app-company-offers',
  templateUrl: './company-offers.component.html',
  styleUrls: ['./company-offers.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CompanyOffersComponent implements OnInit {
  public loading: boolean = false;
  public table: any;
  public Company: any = {};
  public Offers: any = {};
  constructor(
    private Http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  public viewOffers(companyId: number) {
    Helpers.setLoading(true);
    this.loading = true;
    this.Http.get(`${config.itApi}/company/${companyId}?ref=collect_offers`, { responseType: 'json' })
      .subscribe(response => {
        let result: any = _.clone(response);
        this.Company = _.cloneDeep(result.companyInfo);
        this.Offers = result.offers ? _.cloneDeep(result.offers) : [];
        Helpers.setLoading(false);
        this.loadTable();
      })
  }

  loadTable(): void {
    const offerLists = $('#offers-table');
    if ($.fn.DataTable.isDataTable('#offers-table')) {
      this.table.destroy();
      offerLists.find('tbody').empty();
    }

    this.table = offerLists.DataTable({
      pageLength: 10,
      page: 1,
      fixedHeader: false,
      responsive: true,
      sDom: 'rtip',
      data: this.Offers,
      columns: [
        { data: 'postPromote', render: (data) => data },
        { data: 'reference' },
        {
          data: 'rateplan', render: (data) => {
            let plan: string = data === 'sereine' ? 'SEREINE' : (data === 'premium' ? 'PREMIUM' : 'STANDARD');
            let style: string = data === 'sereine' ? 'blue' : (data === 'premium' ? 'success' : 'secondary');
            return `<span class="badge badge-${style}">${plan}</span>`;
          }
        },
        {
          data: 'datePublication', render: (data) => {
            if (_.isUndefined(data)) return 'Non renseigner';
            return data;
          }
        },
        {
          data: 'activated', render: (data, type, row) => {
            let status = data && row.offer_status === 'publish' ? 'Publier' : (row.offer_status === 'pending' ? "En attente" : "Désactiver");
            let style = data && row.offer_status === 'publish' ? 'primary' : (row.offer_status === 'pending' ? "warning" : "danger");
            return `<span class="badge badge-${style}">${status}</span>`;
          }
        },
        { data: 'dateLimit', render: (data) => { return moment(data).fromNow(); } },
        {
          data: null,
          render: (data, type, row) => `<span data-id='${row.ID}' class='edit-offer badge badge-blue'>Modifier</span>`
        }
      ],
      initComplete: () => {
        $('#company-offers-modal').modal('show');
      },
    });

    $('#offers-table tbody')
      // Modifier l'offre (allez vers la page de modification)
      .on('click', '.edit-offer', (e) => {
        e.preventDefault();
        // Réfuser l'accès au commercial de modifier cette option
        if (!this.authService.hasAccess()) {
          return;
        }
        let data = $(e.currentTarget).data();
        $('#company-offers-modal').modal('hide');
        this.router.navigate(['/offer', parseInt(data.id), 'edit']);
      })
  }

}
