import { TestBed } from '@angular/core/testing';

import { ApiAlpay } from './api-alpay';

describe('ApiAlpay', () => {
  let service: ApiAlpay;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiAlpay);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
