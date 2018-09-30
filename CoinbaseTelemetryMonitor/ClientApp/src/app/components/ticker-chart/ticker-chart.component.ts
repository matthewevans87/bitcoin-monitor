import { Component, OnInit, AfterViewInit, ElementRef, ViewChild  } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Ticker } from '../../models/ticker';
import { TickerDataService } from '../../services/ticker-data.service';
import { Subject, Observable } from 'rxjs';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-ticker-chart',
  templateUrl: './ticker-chart.component.html',
  styleUrls: ['./ticker-chart.component.css']
})
export class TickerChartComponent implements OnInit, AfterViewInit {

  public latestTicker: Ticker = undefined;
  public numberOfPoints = 25;
  public chart: Chart;
  public dataPoints: number[] = [];
  public labels: any[] = [];
  @ViewChild('canvas') canvas: ElementRef;

  constructor(private tickerDataService: TickerDataService) {
  }

  ngOnInit(): void {
    this.tickerDataService.getTickerStream()
    .pipe()
    .subscribe(ticker => {
      this.latestTicker = ticker;
      console.log(ticker);
      this.addTickerToChart(ticker);
    });
  }

  ngAfterViewInit() {
    const context = this.canvas.nativeElement.getContext('2d');
    setTimeout(() => {
      this.chart = new Chart(context, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [
            {
              lineTension: 0,
              data: this.dataPoints,
              borderColor: '#3cba9f',
              fill: false
            },
          ]
        },
        options: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              type: 'time',
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Time'
              }
            }],
            yAxes: [{
              ticks: {
                  // Include a dollar sign in the ticks
                  callback: function(value, index, values) {
                    const currencyPipe = new CurrencyPipe('en-US');
                    return currencyPipe.transform(value, 'USD');
                  }
              },
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'USD'
              }
            }],
          }
        }
      });
    });

  }

  private addTickerToChart(ticker: Ticker): void {

    this.dataPoints.push(ticker.price);
    this.labels.push(ticker.time);

    if (this.dataPoints.length >= this.numberOfPoints) {
      this.dataPoints.splice(0, 1);
      this.labels.splice(0, 1);

    }
    this.chart.update();
  }



  onSelect(event) {
    console.log(event);
  }

}
