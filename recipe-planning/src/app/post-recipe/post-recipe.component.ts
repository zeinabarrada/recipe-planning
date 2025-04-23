import { Component } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { UserService } from '../services/user.service';
import { Recipe } from '../models/recipe.model';
import { User } from '../models/users.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'post-recipe',
  templateUrl: './post-recipe.component.html',
  styleUrls: ['./post-recipe.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AddRecipeComponent {
  currentUser: User | null = null;
  newRecipe: Recipe = new Recipe('', '', [], [], '', '', '', 0, '');
  ingredientsInput: string = '';

  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private router: Router
  ) {
    this.loadCurrentUser();
  }

  async loadCurrentUser() {
    const userId = localStorage.getItem('userId');
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
      alert('Please log in to add a recipe.');
      return;
    }
  
    this.newRecipe.author = this.currentUser.username;
  
    try {
      console.log('Saving recipe:', this.newRecipe);
      await this.recipeService.saveRecipe(this.newRecipe);
      alert('Recipe submitted successfully!');
      this.newRecipe = new Recipe('', '', [], [], '', '', '', 0, '');
      this.ingredientsInput = '';
      // Navigate to recipes page after success (optional)
      // this.router.navigate(['/recipes']);
    } catch (error) {
      console.error('Error submitting recipe:', error);
      alert('Failed to submit recipe.');
    }
  }
}
