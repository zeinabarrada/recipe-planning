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
    const storedUser = localStorage.getItem('currentUser');
if (storedUser) {
  const userData = JSON.parse(storedUser);
  this.currentUser = this.userService.createUser(
    userData.email,
    userData.username,
    userData.password ?? '', // fallback if password isn't stored
    userData.id,
    userData.following ?? [],
    userData.followers ?? []
  );
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
      await this.recipeService.addRecipe(this.newRecipe);
      alert('Recipe submitted successfully!');
      this.newRecipe = new Recipe('', '', [], [], '', '', '', 0, '');
      this.ingredientsInput = '';
      this.router.navigate(['/recipes']); // redirect to recipe list
    } catch (error) {
      console.error('Error submitting recipe:', error);
      alert('Failed to submit recipe.');
    }
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
