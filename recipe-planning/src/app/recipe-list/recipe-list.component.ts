import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { ShoppingListService } from '../services/shopping-list.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
  newRating: number = 5;
  newReview: string = '';
  reviewsMap: { [key: string]: Observable<any[]> } = {}; // recipeId -> reviews array
  userRatings: { [key: string]: number } = {};
  hoverRating: number = 0;
  showReviews: { [key: string]: boolean } = {};
  showAddReview: { [key: string]: boolean } = {};
  showFilters: boolean = false;
  selectedRecipes = new Set<string>();
  showShoppingListButton = false;
  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private authService: AuthenticationService,
    private shoppingListService: ShoppingListService,
    private router: Router,
    private firestore: Firestore
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
      this.filteredRecipes = [];
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
    this.filteredRecipes = [];
  }
  selectFilter(filterType: string, filterValue: string | number) {
    if (filterValue === '' || filterValue === 0) {
      this.filteredRecipes = this.allRecipes;
    } else {
      this.filteredRecipes = this.allRecipes.filter(
        (recipe) => recipe[filterType as keyof Recipe] === filterValue
      );
    }
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
      rating: this.newRating,
      review: this.newReview,
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
      this.newRating = 5;
      this.newReview = '';
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
      this.newRating = 5;
      this.newReview = '';
    }
  }
  toggleRecipeSelection(recipeId: string) {
    if (this.selectedRecipes.has(recipeId)) {
      this.selectedRecipes.delete(recipeId);
    } else {
      this.selectedRecipes.add(recipeId);
    }
    this.showShoppingListButton = this.selectedRecipes.size > 0;
  }

  async generateShoppingList() {
    if (!this.currentUser) {
      alert('Please log in to generate a shopping list');
      return;
    }

    if (this.selectedRecipes.size === 0) {
      alert('Please select at least one recipe');
      return;
    }

    const selectedRecipesList = this.allRecipes.filter((recipe) =>
      this.selectedRecipes.has(recipe.id)
    );

    try {
      const listId = await this.shoppingListService.createShoppingList(
        this.currentUser.id,
        selectedRecipesList
      );
      this.router.navigate(['/shopping-list', listId]);
    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('Failed to generate shopping list. Please try again.');
    }
  }
}
