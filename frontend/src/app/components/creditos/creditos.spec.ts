import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditosComponent } from './creditos';

describe('CreditosComponent', () => {
  let component: CreditosComponent;
  let fixture: ComponentFixture<CreditosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
