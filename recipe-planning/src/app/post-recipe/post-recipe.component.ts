import { Component } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { UserService } from '../services/user.service';
import { Recipe } from '../models/recipe.model';
import { User } from '../models/users.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'post-recipe',
  templateUrl: './post-recipe.component.html',
  styleUrls: ['./post-recipe.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AddRecipeComponent {
  currentUser: User | null = null; // should be set based on your auth flow
  newRecipe: Recipe = new Recipe('', '', [], [], '', '', '', 0, '');

  constructor(
    private recipeService: RecipeService,
    private userService: UserService
  ) {
    // Ideally, set currentUser via your auth system or user state management
    this.loadCurrentUser(); 
  }

  async loadCurrentUser() {
    const userId = localStorage.getItem('userId'); // or wherever you're storing auth state
    if (userId) {
      try {
        this.currentUser = await this.userService.getUserByIdInstance(userId);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
  }

  async submitRecipe() {
    if (!this.currentUser) {
      console.error('User not logged in');
      return;
    }

    this.newRecipe.author = this.currentUser.username;

    // Add the recipe to the general recipes collection
    await this.recipeService.addRecipe(this.newRecipe);

    console.log('Recipe submitted successfully');
    this.newRecipe = new Recipe('', '', [], [], '', '', '', 0, ''); // reset form
  }
}
