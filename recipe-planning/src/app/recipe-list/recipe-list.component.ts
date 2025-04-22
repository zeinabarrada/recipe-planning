import { Component } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../models/recipe.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { User } from '../models/users.model';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-recipe-list',
  imports: [CommonModule, NgFor],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
})
export class RecipeListComponent {
  currentUser: User | null = null;
  recipesObservable: Observable<Recipe[]>;

  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private authService: AuthenticationService
  ) {
    this.recipesObservable = this.recipeService.getRecipes();
    this.currentUser = this.authService.getCurrentUser();
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
