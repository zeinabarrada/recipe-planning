import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../models/recipe.model';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { User } from '../models/users.model';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule, NgModel } from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
} from '@angular/fire/firestore';
import { LikeRecipeComponent } from '../like-recipe';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LikeRecipeComponent],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
})
export class RecipeListComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  recipesObservable: Observable<Recipe[]>;
  private userSubscription: Subscription | null = null;
  allRecipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  searchTerm: string = '';
  isFocused: boolean = false;
  selectedRecipeId: string | null = null;
  newRating: { [recipeId: string]: number } = {};
  newReview: { [recipeId: string]: string } = {};
  reviewsMap: { [key: string]: Observable<any[]> } = {};
  userRatings: { [key: string]: number } = {};
  hoverRating: number = 0;
  showReviews: { [key: string]: boolean } = {};
  showAddReview: { [key: string]: boolean } = {};
  showFilters: boolean = false;

  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private authService: AuthenticationService,
    private router: Router,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {
    this.recipesObservable = this.recipeService.getRecipes();
  }

  ngOnInit() {
    this.userSubscription = this.authService.getUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('Current user set to:', this.currentUser);
        if (user) {
          this.loadUserRatings();
        }
      },
      error: (error) => {
        console.error('Error in user subscription:', error);
        this.currentUser = null;
      },
      complete: () => {
        console.log('User subscription completed');
      },
    });
    this.recipeService.getRecipes().subscribe((recipes) => {
      this.allRecipes = recipes;
      console.log('Loaded recipes:', recipes);
      this.filteredRecipes = [...recipes];
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      console.log('User subscription unsubscribed');
    }
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
  onBlur() {
    setTimeout(() => {
      this.isFocused = false;
    }, 200); // Delay to allow clicks to register
  }
  onSearch(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredRecipes = this.allRecipes;
      return;
    }
    this.searchTerm = searchTerm.toLowerCase();
    this.filteredRecipes = this.allRecipes.filter(
      (recipe) =>
        recipe.recipe_name.toLowerCase() === this.searchTerm ||
        recipe.author.toLowerCase() === this.searchTerm
    );
  }
  clearSearch() {
    this.searchTerm = '';
    this.filteredRecipes = [...this.allRecipes];
  }
  displayedRecipes(): Recipe[] {
    return this.filteredRecipes.length > 0 || this.searchTerm
      ? this.filteredRecipes
      : this.allRecipes;
  }
  selectFilter(filterType: string, filterValue: string | number) {
    if (filterValue === '' || filterValue === 0) {
      this.filteredRecipes = [...this.allRecipes];
      return;
    }

    this.filteredRecipes = this.allRecipes.filter((recipe) => {
      switch (filterType) {
        case 'cookingTime':
          return recipe.cooking_time <= filterValue;
        case 'cuisine':
          return recipe.cuisine === filterValue;
        case 'type':
          return recipe.type === filterValue.toString().toLowerCase();
        case 'ingredient':
          return recipe.ingredients.some((ing) =>
            ing.toLowerCase().includes(filterValue.toString().toLowerCase())
          );
        default:
          return recipe[filterType as keyof Recipe] === filterValue;
      }
    });

    console.log('Filter applied:', {
      filterType,
      filterValue,
      results: this.filteredRecipes.length,
    });
  }

  clearFilters() {
    this.filteredRecipes = [...this.allRecipes];
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

  async onLikeToggled(event: { recipeId: string; liked: boolean }) {
    if (!this.currentUser) return;
    // Find the index of the recipe
    const idx = this.allRecipes.findIndex((r) => r.id === event.recipeId);
    if (idx === -1) return;
    const recipe = { ...this.allRecipes[idx] }; // create a new object

    if (event.liked) {
      if (!recipe.likedBy.includes(this.currentUser!.id)) {
        recipe.likedBy = [...recipe.likedBy, this.currentUser!.id];
        recipe.likes++;
      }
    } else {
      if (recipe.likedBy.includes(this.currentUser!.id)) {
        recipe.likedBy = recipe.likedBy.filter(
          (id) => id !== this.currentUser!.id
        );
        recipe.likes = Math.max(0, recipe.likes - 1);
      }
    }

    console.log('Before updateRecipe:', recipe);
    await this.recipeService.updateRecipe(recipe);
    console.log('After updateRecipe:', recipe);
    this.cdr.detectChanges();
  }
  viewProfile(userId: string) {
    console.log('Viewing profile for user:', userId);
    this.router.navigate(['/profile', userId]);
  }
}