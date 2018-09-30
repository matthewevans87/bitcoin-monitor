import { Injectable } from '@angular/core';
import { HubConnectionBuilder } from '@aspnet/signalr';
import { Ticker } from '../models/ticker';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TickerDataService {

  private connection = new HubConnectionBuilder()
    .withUrl('/tickerHub')
    .build();

  private $tickers = new Subject<Ticker>();

  constructor() {
    this.init();
  }

  private init() {

    this.connection.on('PriceUpdate', data => {

      this.$tickers.next({
        ask: 0,
        bid: 0,
        price: data as number,
        size: 0,
        time: new Date(),
        trade_id: 0,
        volume: 0
      });
    });

    this.connection.start().catch((err) => {
      return console.error(err.toString());
    });
  }

  public getTickerStream(): Observable<Ticker> {
    return this.$tickers.asObservable();
  }
}
