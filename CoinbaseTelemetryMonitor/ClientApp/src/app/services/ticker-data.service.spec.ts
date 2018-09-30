import { TestBed } from '@angular/core/testing';

import { TickerDataService } from './ticker-data.service';

describe('TickerDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TickerDataService = TestBed.get(TickerDataService);
    expect(service).toBeTruthy();
  });
});
