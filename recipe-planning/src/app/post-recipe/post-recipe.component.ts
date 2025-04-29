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
  newRecipe: Recipe = new Recipe('', '', '', [], [], '', '', '', '', 0, '', '');
  ingredientsInput: string = '';
  cuisineTypes = [
    'Italian',
    'Mexican',
    'Chinese',
    'Japanese',
    'Indian',
    'Thai',
    'Mediterranean',
    'American',
    'French',
    'Greek',
    'Other'
  ];

  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private router: Router
  ) {
    this.loadCurrentUser();
  }

  async loadCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      this.currentUser = this.userService.createUser(
        userData.email,
        userData.username,
        userData.password ?? '',
        userData.id,
        userData.following ?? [],
        userData.followers ?? []
      );
    }
  }

  validateRecipe(): boolean {
    if (!this.newRecipe.recipe_name.trim()) {
      alert('Please enter a recipe name');
      return false;
    }
    if (this.newRecipe.ingredients.length === 0) {
      alert('Please add at least one ingredient');
      return false;
    }
    if (!this.newRecipe.cooking_time) {
      alert('Please enter cooking time');
      return false;
    }
    if (!this.newRecipe.cuisine) {
      alert('Please select a cuisine type');
      return false;
    }
    return true;
  }

  async submitRecipe() {
    if (!this.currentUser) {
      console.error('User not logged in');
      alert('Please log in to add a recipe.');
      return;
    }

    if (!this.validateRecipe()) {
      return;
    }

    this.newRecipe.author = this.currentUser.username;
    this.newRecipe.authorId = this.currentUser.id;

    try {
      await this.recipeService.addRecipe(this.newRecipe);
      alert('Recipe submitted successfully!');
      this.resetForm();
      this.router.navigate(['/recipes']);
    } catch (error) {
      console.error('Error submitting recipe:', error);
      alert('Failed to submit recipe.');
    }
  }

  resetForm() {
    this.newRecipe = new Recipe('', '', '', [], [], '', '', '', '', 0, '', '');
    this.ingredientsInput = '';
  }

  handleIngredientsInput(input: string): void {
    if (!input) {
      this.newRecipe.ingredients = [];
      return;
    }
    this.newRecipe.ingredients = input.split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
  }
}
