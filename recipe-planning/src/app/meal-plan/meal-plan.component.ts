import { Component, OnInit } from '@angular/core';
import { User } from '../models/users.model';
import { Recipe } from '../models/recipe.model';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { RecipeService } from '../services/recipe.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-meal-plan',
  templateUrl: './meal-plan.component.html',
  styleUrls: ['./meal-plan.component.css']
})
export class MealPlanComponent implements OnInit {
  currentUser: User | null = null;
  followingRecipes: Recipe[] = [];
  otherRecipes: Recipe[] = [];
  mealPlan: { [key: string]: { breakfast?: Recipe, lunch?: Recipe, dinner?: Recipe } } = {};
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  mealTypes = ['breakfast', 'lunch', 'dinner'];

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

    // Get recipes from following users
    const followingIds = this.currentUser.getFollowing();
    const followingRecipesPromises = followingIds.map(async (userId) => {
      const recipe = await this.recipeService.getRecipeById(userId).toPromise();
      return recipe;
    });

    // Get recipes from other users
    const otherRecipes = await this.recipeService.getRecipes().toPromise();

    try {
      const followingRecipesResults = await Promise.all(followingRecipesPromises);
      this.followingRecipes = followingRecipesResults.filter(recipe => recipe !== null) as Recipe[];

      // Filter out recipes from following users
      this.otherRecipes = (otherRecipes || []).filter(recipe =>
        !followingIds.includes(recipe.author)
      );
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  }

  addRecipeToMealPlan(day: string, mealType: 'breakfast' | 'lunch' | 'dinner', recipe: Recipe) {
    if (this.mealPlan[day]) {
      this.mealPlan[day][mealType] = recipe;
    }
  }

  removeRecipeFromMealPlan(day: string, mealType: 'breakfast' | 'lunch' | 'dinner') {
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
