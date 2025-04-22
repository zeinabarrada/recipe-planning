import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../models/recipe.model';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../models/users.model';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../authentication/authentication.service';
@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h1>INLINE TEST</h1>
    <p>Only static content here.</p>
  `,
  styleUrl: './recipe-list.component.css',
})
export class RecipeListComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  recipesObservable: Observable<Recipe[]>;
  private userSubscription: Subscription | null = null;

  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private authService: AuthenticationService
  ) {
    console.log('RecipeListComponent constructor called');
    this.recipesObservable = this.recipeService.getRecipes();
  }

  ngOnInit() {
    console.log('RecipeListComponent ngOnInit called');
    this.userSubscription = this.authService.getUser().subscribe({
      next: (user) => {
        console.log('User subscription next called with:', user);
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
  }

  ngOnDestroy() {
    console.log('RecipeListComponent ngOnDestroy called');
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      console.log('User subscription unsubscribed');
    }
  }

  saveRecipe(recipe: Recipe) {
    if (!this.currentUser) {
      console.error('No user is logged in.');
      return;
    }

    this.userService.saveRecipe(this.currentUser, recipe).then(() => {
      console.log(`Recipe "${recipe.recipe_name}" saved!`);
    });
  }
}
