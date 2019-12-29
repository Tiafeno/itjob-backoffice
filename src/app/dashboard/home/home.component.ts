import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { Helpers } from '../../helpers';
import * as moment from 'moment';
import * as _ from 'lodash';
import Chart from 'chart.js';
import { tinyMceSettings } from '../../../environments/environment';
import { ErrorService } from '../../services/error.service';
declare var $: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  public Dashboard: {
    candidate: { percent?: any },
    company: { percent?: any },
    offer: { percent?: any }
  };
  public loading: boolean = false;
  public tinySettings: any = {};
  private visits: { unit: string, fields: Array<string>, data: Array<any> };
  constructor(
    private requestServices: RequestService,
    private errnoService: ErrorService,
    private cd: ChangeDetectorRef
  ) {
    this.tinySettings = tinyMceSettings;
  }

  ngOnInit() {
    moment.locale('fr');
    Helpers.setLoading(true);
    this.loading = true;
    this.requestServices.collectDashboard()
      .subscribe(
        response => {
          this.Dashboard = _.cloneDeep(response);
          let candidate: any = this.Dashboard.candidate;
          let company: any = this.Dashboard.company
          let offer: any = this.Dashboard.offer;
          this.Dashboard.candidate.percent = (parseInt(candidate.countActive) * 100) / parseInt(candidate.count);
          this.Dashboard.company.percent = (parseInt(company.countActive) * 100) / parseInt(company.count);
          this.Dashboard.offer.percent = (parseInt(offer.countActive) * 100) / parseInt(offer.count);

          this.requestServices.getStats()
            .subscribe((stats: any) => {
              this.loading = false;
              this.visits = _.clone(stats.visits);
              const period: Array<string> = _.map(this.visits.data, value => { return value[0]; });
              const views: Array<number> = _.map(this.visits.data, value => { return value[1]; });
              const visitors: Array<number> = _.map(this.visits.data, value => { return value[2]; });

              this.cd.detectChanges();
              this.generateChartsVisit(period, visitors, views);
              Helpers.setLoading(false);
              this.loadScript();
            }, error => {
              this.loading = false;
              Helpers.setLoading(false);
              this.loadScript();
            });
        },
        error => {
          this.errnoService.handler(error);
          this.loading = false;
          Helpers.setLoading(false);
        });
  }

  ngAfterViewInit() { }

  public generateChartsVisit(_labels: Array<string> = [], _visitors: Array<number> = [], _views: Array<number> = []) {
    const canvas: any = document.getElementById("visitors_chart");
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    _labels = _.map(_labels, label => {
      return moment(label, "YYYY-MM-DD").format('DD MMM YY');
    });
    let visitors_chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: _labels,
        datasets: [
          {
            label: "Nombre de visites",
            data: _visitors,
            borderColor: '#5198d9',
            backgroundColor: '#5198d9',
            pointBackgroundColor: '#5198d9',
            pointBorderColor: '#000000',
            borderWidth: 1,
            pointBorderWidth: 1,
            pointRadius: 0,
            pointHitRadius: 30,
          },
          {
            label: "Nombre de vues",
            data: _views,
            borderColor: '#0a4b78',
            backgroundColor: '#0a4b78',
            pointBackgroundColor: '#0a4b78',
            pointBorderColor: '#000000',
            borderWidth: 1,
            pointBorderWidth: 1,
            pointRadius: 0,
            pointHitRadius: 30,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        showScale: false,
        scales: {
          xAxes: [{
            gridLines: {
              display: true,
            },
          }],
          yAxes: [{
            gridLines: {
              display: true,
              drawBorder: true,
            },
          }]
        },
        legend: {
          labels: {
            boxWidth: 12
          }
        },
      }
    });
  }

  

  loadScript() {
    setTimeout(() => {
      $('.easypie').each(function () {
        $(this).easyPieChart({
          trackColor: $(this).attr('data-trackColor') || '#f2f2f2',
          scaleColor: false,
        });
      });

      // let visitors_data = {
      //   1: {
      //     data: [
      //       [28, 48, 40, 35, 70, 33, 32],
      //     ],
      //     labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      //   },
      //   2: {
      //     data: [
      //       [55, 35, 32, 14, 40, 33, 22],
      //     ],
      //     labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      //   },
      //   3: {
      //     data: [
      //       [45, 35, 28, 64, 40, 30, 32, 60, 50, 29, 33, 48],
      //       [54, 62, 35, 80, 40, 85, 42, 30, 41, 73, 68, 57],
      //     ],
      //     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      //   },
      // };

      // $('#chart_tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      //   var id = $(this).attr('data-id');
      //   if (id && +id in visitors_data) {
      //     visitors_chart.data.labels = visitors_data[id].labels;
      //     var datasets = visitors_chart.data.datasets;
      //     $.each(datasets, function (index, value) {
      //       datasets[index].data = visitors_data[id].data[index];
      //     });
      //   }
      //   visitors_chart.update();
      // });
    }, 600);

  }


}
