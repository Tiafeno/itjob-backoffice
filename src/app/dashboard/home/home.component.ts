import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { Helpers } from '../../helpers';

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
    candidate: {percent?: any},
    company: {percent?: any},
    offer: {percent?: any}
  };
  public loading: boolean = false;
  public tinySettings: any = {};
  private $data = [];
  constructor(
    private requestServices: RequestService,
    private errnoService: ErrorService
    ) {
    this.tinySettings = tinyMceSettings;
  }

  ngOnInit() {
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
            .subscribe(stats => {
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

  loadScript() {
    setTimeout(() => {
      $('.easypie').each(function () {
        $(this).easyPieChart({
          trackColor: $(this).attr('data-trackColor') || '#f2f2f2',
          scaleColor: false,
        });
      });

      var canvas: any = document.getElementById("visitors_chart");
      var ctx: CanvasRenderingContext2D = canvas.getContext("2d");
      var visitors_chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          datasets: [
            {
              label: "Nombre de vues",
              data: [64, 54, 60, 65, 52, 85, 48],
              borderColor: 'rgba(104,218,221,1)',
              backgroundColor: 'rgba(104,218,221,1)',
              pointBackgroundColor: 'rgba(104,218,221,1)',
              pointBorderColor: 'rgba(104,218,221,1)',
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
                display: false,
              },
            }],
            yAxes: [{
              gridLines: {
                display: false,
                drawBorder: false,
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

      let visitors_data = {
        1: {
          data: [
            [28, 48, 40, 35, 70, 33, 32],
          ],
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
        2: {
          data: [
            [55, 35, 32, 14, 40, 33, 22],
          ],
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
        3: {
          data: [
            [45, 35, 28, 64, 40, 30, 32, 60, 50, 29, 33, 48],
            [54, 62, 35, 80, 40, 85, 42, 30, 41, 73, 68, 57],
          ],
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        },
      };

      $('#chart_tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var id = $(this).attr('data-id');
        if (id && +id in visitors_data) {
          visitors_chart.data.labels = visitors_data[id].labels;
          var datasets = visitors_chart.data.datasets;
          $.each(datasets, function (index, value) {
            datasets[index].data = visitors_data[id].data[index];
          });
        }
        visitors_chart.update();
      });
    }, 600);

  }


}
