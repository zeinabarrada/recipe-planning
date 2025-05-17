import { Component } from '@angular/core';
import { User } from '../models/users.model';
import { Recipe } from '../models/recipe.model';
import { AuthenticationService } from '../services/authentication.service';
import { RecipeService } from '../services/recipe.service';
import { MealPlanService } from '../services/meal-plan.service';
import { ShoppingListService } from '../services/shopping-list.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecipeSelectionDialogComponent } from '../recipe-selection-dialog/recipe-selection-dialog.component';
import { Router } from '@angular/router';
import { MealPlan } from '../models/mealPlan.model';

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './meal-plan.component.html',
  styleUrls: ['./meal-plan.component.css']
})
export class MealPlanComponent {
  currentUser: User | null = null;
  mealPlanId: string = '';
  recipes: Recipe[] = [];
  mealPlan: (Recipe | null)[][] = Array(7).fill(null).map(() => Array(3).fill(null));
  daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
  showShoppingListButton = false;

  constructor(
    private authService: AuthenticationService,
    private recipeService: RecipeService,
    private mealPlanService: MealPlanService,
    private shoppingListService: ShoppingListService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.authService.getUser()?.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.mealPlanId = this.currentUser.mealPlanId;
      }
    });
  }

  async ngOnInit() {
    this.loadRecipes();
    this.loadMealPlan();
  }

  async loadMealPlan() {
    if (!this.currentUser || !this.mealPlanId) return;

    try {
      const meal = await this.mealPlanService.getMealPlan(this.mealPlanId);
      if (!meal) {
        console.warn(`No meal plan document found for id ${this.mealPlanId}`);
        return;
      }
      this.mealPlan = meal.mealPlan;
      this.showShoppingListButton = true;
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  }

  loadRecipes() {
    this.recipeService.getRecipes().subscribe({
      next: (allRecipes) => {
        this.recipes = allRecipes;
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
      }
    });
  }

  selectRecipe(dayIndex: number, mealIndex: number) {
    const dialogRef = this.dialog.open(RecipeSelectionDialogComponent, {
      width: '80%',
      data: { recipes: this.recipes }
    });

    dialogRef.afterClosed().subscribe((selectedRecipe: Recipe) => {
      if (selectedRecipe) {
        this.mealPlan[dayIndex][mealIndex] = selectedRecipe;
        this.showShoppingListButton = true;
      }
    });
  }

  removeRecipeFromMealPlan(dayIndex: number, mealIndex: number) {
    const recipe = this.mealPlan[dayIndex][mealIndex];

    if (recipe) {
      this.mealPlan[dayIndex][mealIndex] = null;
    }
  }

  async saveMealPlan() {
    if (!this.currentUser) return;

    try {
      this.mealPlanId = await this.mealPlanService.saveMealPlan(this.currentUser.id, this.mealPlan);
    } catch (error) {
      console.error('Error saving meal plan:', error);
    }
  }

  getRecipeForMeal(dayIndex: number, mealIndex: number): Recipe | null {
    return this.mealPlan[dayIndex][mealIndex];
  }

  private getAllPlannedRecipes(): Recipe[] {
    const plannedRecipes: Recipe[] = [];

    for (let dayIndex = 0; dayIndex < this.mealPlan.length; dayIndex++) {
      for (let mealIndex = 0; mealIndex < this.mealPlan[dayIndex].length; mealIndex++) {
        const recipe = this.mealPlan[dayIndex][mealIndex];
        if (recipe) {
          if (!plannedRecipes.some(r => r.id === recipe.id)) {
            plannedRecipes.push(recipe);
          }
        }
      }
    }

    return plannedRecipes;
  }

  async generateShoppingList() {
    if (!this.currentUser) {
      alert('Please log in to generate a shopping list');
      return;
    }

    const plannedRecipes = this.getAllPlannedRecipes();

    if (plannedRecipes.length === 0) {
      alert('Please add at least one recipe to your meal plan');
      return;
    }

    try {
      const listId = await this.shoppingListService.createShoppingList(
        this.currentUser.id,
        plannedRecipes
      );

      // Navigate to the shopping list view in the same tab
      this.router.navigate(['/shopping-list', listId], { skipLocationChange: false });
    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('Failed to generate shopping list. Please try again.');
    }
  }
}
