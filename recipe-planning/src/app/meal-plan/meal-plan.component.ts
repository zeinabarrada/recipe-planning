import { Component, OnInit } from '@angular/core';
import { User } from '../models/users.model';
import { Recipe } from '../models/recipe.model';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { RecipeService } from '../services/recipe.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

type MealType = 'breakfast' | 'lunch' | 'dinner';
type DayMeals = {
  [key in MealType]?: Recipe;
};

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './meal-plan.component.html',
  styleUrls: ['./meal-plan.component.css']
})
export class MealPlanComponent implements OnInit {
  currentUser: User | null = null;
  followingRecipes: Recipe[] = [];
  otherRecipes: Recipe[] = [];
  mealPlan: { [key: string]: DayMeals } = {};
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
  mealTypes = ['breakfast', 'lunch', 'dinner'] as const;
  selectedRecipe: Recipe | null = null;

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private recipeService: RecipeService
  ) { }

  async ngOnInit() {
    this.authService.getUser().subscribe(async (user) => {
      this.currentUser = user;
      if (this.currentUser) {
        await this.loadRecipes();
        this.initializeMealPlan();
      }
    });
  }

  private initializeMealPlan() {
    this.daysOfWeek.forEach(day => {
      this.mealPlan[day] = {};
    });
  }

  async loadRecipes() {
    if (!this.currentUser) return;

    try {
      // Get all recipes
      const allRecipes = await this.recipeService.getRecipes().toPromise();
      if (!allRecipes) return;

      // Get following users
      const followingIds = this.currentUser.getFollowing();

      // Filter recipes by following users
      this.followingRecipes = allRecipes.filter(recipe =>
        followingIds.includes(recipe.author)
      );

      // Filter recipes from other users
      this.otherRecipes = allRecipes.filter(recipe =>
        !followingIds.includes(recipe.author)
      );
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  }

  selectRecipe(recipe: Recipe) {
    this.selectedRecipe = recipe;
  }

  addRecipeToMealPlan(day: string, mealType: MealType, recipe: Recipe) {
    if (this.mealPlan[day]) {
      this.mealPlan[day][mealType] = recipe;
    }
  }

  removeRecipeFromMealPlan(day: string, mealType: MealType) {
    if (this.mealPlan[day]) {
      delete this.mealPlan[day][mealType];
    }
  }

  saveMealPlan() {
    if (!this.currentUser) return;
    // TODO: Implement saving meal plan to Firestore
    console.log('Meal plan to save:', this.mealPlan);
  }
}
