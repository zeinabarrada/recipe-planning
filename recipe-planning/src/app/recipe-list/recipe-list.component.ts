import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../models/recipe.model';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../models/users.model';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule, NgModel } from '@angular/forms';
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
  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private authService: AuthenticationService
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
    this.filteredRecipes = this.allRecipes;
  }
}
