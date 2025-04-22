import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingReviewsComponent } from './rating-reviews.component';

describe('RatingReviewsComponent', () => {
  let component: RatingReviewsComponent;
  let fixture: ComponentFixture<RatingReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatingReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
