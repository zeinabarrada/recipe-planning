import { Component } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { UserService } from '../services/user.service';
import { Recipe } from '../models/recipe.model';
import { User } from '../models/users.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'post-recipe',
  templateUrl: './post-recipe.component.html',
  styleUrls: ['./post-recipe.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class AddRecipeComponent {
  currentUser: User | null = null;
  newRecipe: Recipe = new Recipe(
    '',
    '',
    '',
    [],
    [],
    '',
    [],
    '',
    '',
    '',
    0,
    '',
    '',
    [],
    0,
    []
  );
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
    'Other',
  ];
  mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  instructionsInput: string = '';

  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.loadCurrentUser();
    this.newRecipe = {
      id: '',
      recipe_name: '',
      imagePath: '',
      ingredients: [],
      instructions: [],
      type: '',
      meal: [],
      authorId: '',
      author: '',
      nutrition_facts: '',
      time: 0,
      cuisine: '',
      cooking_time: '',
      ratings: [],
      likes: 0,
      likedBy: [],
    };
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
    if (!this.newRecipe.imagePath.trim()) {
      alert('Please enter an image path');
      return false;
    }
    if (!this.newRecipe.nutrition_facts.trim()) {
      alert('Please enter nutrition facts');
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
    if (!this.newRecipe.meal || this.newRecipe.meal.length === 0) {
      alert('Please select a meal type');
      return false;
    }
    return true;
  }

  handleIngredientsInput(input: string): void {
    if (!input) {
      this.newRecipe.ingredients = [];
      return;
    }
    this.newRecipe.ingredients = input
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
  }

  handleInstructionsInput(input: string): void {
    if (!input) {
      this.newRecipe.instructions = [];
      return;
    }
    // Split by period or new line, trim, and filter empty
    this.newRecipe.instructions = input
      .split(/\.|\n/)
      .map((item) => item.trim())
      .filter((item) => item !== '');
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
    this.newRecipe.cooking_time = String(this.newRecipe.cooking_time);

    try {
      const newId = await this.recipeService.addRecipe(this.newRecipe);
      this.newRecipe.id = newId;
      alert('Recipe submitted successfully!');
      // Wait for Firestore to emit the new recipe before navigating
      const sub = this.recipeService.getRecipes().subscribe((recipes) => {
        if (recipes.some((r) => r.id === newId)) {
          sub.unsubscribe();
          this.resetForm();
          this.router.navigate(['/recipes']);
        }
      });
    } catch (error) {
      console.error('Error submitting recipe:', error);
      alert('Failed to submit recipe.');
    }
  }

  resetForm() {
    this.newRecipe = new Recipe(
      '',
      '',
      '',
      [],
      [],
      '',
      [],
      '',
      '',
      '',
      0,
      '',
      '',
      [],
      0,
      []
    );
    this.ingredientsInput = '';
    this.instructionsInput = '';
  }

  navigateToRecipes() {
    this.router.navigate(['/recipes']);
  }
}
