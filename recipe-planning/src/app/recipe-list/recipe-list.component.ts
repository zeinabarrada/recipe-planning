import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../models/recipe.model';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../models/users.model';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication.service';
@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-list.component.html',
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
}
