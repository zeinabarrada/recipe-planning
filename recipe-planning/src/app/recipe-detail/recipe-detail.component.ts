import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { Recipe } from '../models/recipe.model';
import { RecipeService } from '../services/recipe.service';
import { User } from '../models/users.model';
import { LikeRecipeComponent } from '../like-recipe';
import { UserService } from '../services/user.service';
import { Observable, Subscription } from 'rxjs';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-recipe-detail',
  imports: [LikeRecipeComponent, CommonModule, FormsModule],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.css',
})
export class RecipeDetailComponent {
  recipeId: string = '';
  recipe!: Recipe;
  currentUser: User | null = null;
  newRating: { [recipeId: string]: number } = {};
  newReview: { [recipeId: string]: string } = {};
  reviewsMap: { [key: string]: Observable<any[]> } = {};
  userRatings: { [key: string]: number } = {};
  hoverRating: number = 0;
  showReviews: { [key: string]: boolean } = {};
  showAddReview: { [key: string]: boolean } = {};
  allRecipes: Recipe[] = [];
  selectedRecipeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private recipeService: RecipeService,
    private userService: UserService,
    private firestore: Firestore,
    private router: Router
  ) {
    this.route.params.subscribe((params) => {
      this.recipeId = params['id'];
    });
    this.authService.getUser().subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserRatings();
      }
    });
  }
  ngOnInit() {
    this.recipeService.getRecipeById(this.recipeId).subscribe((recipe) => {
      this.recipe = recipe;
    });
  }

  saveRecipe(recipe: Recipe) {
    console.log('Saving recipe with ID:', recipe.id);
    if (!this.currentUser) {
      console.error('No user is logged in.');
      return;
    }

    this.userService.saveRecipe(this.currentUser, recipe).then(() => {
      console.log(`Recipe "${recipe.recipe_name}" saved!`);
    });
  }

  submitReview(recipeId: string) {
    if (!this.currentUser) {
      console.error('You must be logged in to leave a review.');
      return;
    }

    const reviewData = {
      rating: this.newRating[recipeId] || 5,
      review: this.newReview[recipeId] || '',
      userId: this.currentUser.id,
      userName: this.currentUser.username,
      timestamp: new Date(),
    };

    const reviewsCollection = collection(
      this.firestore,
      `recipes/${recipeId}/reviews`
    );
    addDoc(reviewsCollection, reviewData).then(() => {
      console.log('Review submitted!');
      this.selectedRecipeId = null;
      this.newRating[recipeId] = 5;
      this.newReview[recipeId] = '';
    });
  }

  loadReviewsForRecipe(recipeId: string) {
    const reviewsCollection = collection(
      this.firestore,
      `recipes/${recipeId}/reviews`
    );
    this.reviewsMap[recipeId] = collectionData(reviewsCollection, {
      idField: 'id',
    });
  }

  async loadUserRatings() {
    if (!this.currentUser) return;

    this.allRecipes.forEach(async (recipe) => {
      const rating = await this.recipeService.getUserRating(
        recipe.id,
        this.currentUser!.id
      );
      this.userRatings[recipe.id] = rating;
    });
  }

  async onRatingChange(recipeId: string, rating: number) {
    if (!this.currentUser) return;

    try {
      await this.recipeService.addRating(recipeId, this.currentUser.id, rating);
      this.userRatings[recipeId] = rating;
    } catch (error) {
      console.error('Error adding rating:', error);
    }
  }

  toggleReviews(recipeId: string) {
    this.showReviews[recipeId] = !this.showReviews[recipeId];
    if (this.showReviews[recipeId]) {
      this.loadReviewsForRecipe(recipeId);
    }
  }

  toggleAddReview(recipeId: string) {
    this.showAddReview[recipeId] = !this.showAddReview[recipeId];
    if (!this.showAddReview[recipeId]) {
      this.newRating[recipeId] = 5;
      this.newReview[recipeId] = '';
    }
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const container = img.parentElement;
    if (container) {
      const noImageDiv = document.createElement('div');
      noImageDiv.className = 'no-image';
      noImageDiv.textContent = 'Image not available';
      container.appendChild(noImageDiv);
    }
  }
}
