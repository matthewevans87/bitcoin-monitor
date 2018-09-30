import { Component, OnInit } from '@angular/core';
import { Ticker } from '../../models/ticker';
import { TickerDataService } from '../../services/ticker-data.service';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-ticker-chart',
  templateUrl: './ticker-chart.component.html',
  styleUrls: ['./ticker-chart.component.css']
})
export class TickerChartComponent implements OnInit {

  public latestTicker: Ticker = undefined;
  public numberOfPoints = 25;

  public dataPoints: any[] = [
    {
      'name': 'Price',
      'series': []
    }
  ];

  view: any[] = [1200, 400];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  showYAxisLabel = true;
  yAxisLabel = 'USD';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };


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

  private addTickerToChart(ticker: Ticker): void {

    const entry = {
      name: ticker.time,
      value: ticker.price
    };

    this.dataPoints[0].series = [...this.dataPoints[0].series, entry];
    this.dataPoints = this.dataPoints.slice();
    if (this.dataPoints[0].series.length >= this.numberOfPoints) {
      this.dataPoints[0].series.splice(0, 1);
    }
  }



  onSelect(event) {
    console.log(event);
  }

}
