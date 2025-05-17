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
import { Firestore } from '@angular/fire/firestore';
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
  recipe!: Recipe;
  showFilters: boolean = false;

  constructor(
    private recipeService: RecipeService,
    private authService: AuthenticationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.recipesObservable = this.recipeService.getRecipes();
  }

  ngOnInit() {
    this.userSubscription = this.authService.getUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('Current user set to:', this.currentUser);
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
  viewProfile(userId: string) {
    console.log('Viewing profile for user:', userId);
    this.router.navigate(['/profile', userId]);
  }
  async onLikeToggled(event: { recipeId: string; liked: boolean }) {
    if (!this.currentUser) return;

    const recipe = this.filteredRecipes.find((r) => r.id === event.recipeId);
    if (!recipe) return;

    if (event.liked) {
      if (!recipe.likedBy.includes(this.currentUser.id)) {
        recipe.likedBy.push(this.currentUser.id);
        recipe.likes++;
      }
    } else {
      const idx = recipe.likedBy.indexOf(this.currentUser.id);
      if (idx > -1) {
        recipe.likedBy.splice(idx, 1);
        recipe.likes = Math.max(0, recipe.likes - 1);
      }
    }
    await this.recipeService.updateRecipe(recipe);
  }
}
