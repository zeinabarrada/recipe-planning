import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingsReviewsComponent } from './ratings-reviews.component';

describe('RatingsReviewsComponent', () => {
  let component: RatingsReviewsComponent;
  let fixture: ComponentFixture<RatingsReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingsReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatingsReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
