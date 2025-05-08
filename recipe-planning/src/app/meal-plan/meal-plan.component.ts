import { Component, OnInit } from '@angular/core';
import { User } from '../models/users.model';
import { Recipe } from '../models/recipe.model';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { RecipeService } from '../services/recipe.service';
import { MealPlanService } from '../services/meal-plan.service';
import { ShoppingListService } from '../services/shopping-list.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecipeSelectionDialogComponent } from '../recipe-selection-dialog/recipe-selection-dialog.component';
import { ShoppingListDialogComponent } from '../shopping-list/shopping-list-dialog.component';
import { Router } from '@angular/router';
import { MealPlan } from '../models/mealPlan.model';

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './meal-plan.component.html',
  styleUrls: ['./meal-plan.component.css']
})
export class MealPlanComponent implements OnInit {
  currentUser: User | null = null;
  mealPlanId: string = '';
  recipes: Recipe[] = [];
  mealPlan: (Recipe | null)[][] = Array(7).fill(null).map(() => Array(3).fill(null));
  daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
  selectedRecipes = new Set<string>();
  showShoppingListButton = false;

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private recipeService: RecipeService,
    private mealPlanService: MealPlanService,
    private shoppingListService: ShoppingListService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  async ngOnInit() {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const user = this.userService.createUser(
          userData.email,
          userData.username,
          userData.password,
          userData.id,
          userData.following || [],
          userData.followers || [],
          userData.savedRecipes || [],
          userData.mealPlanId || null,
        );
        this.currentUser = user;
        this.mealPlanId = this.currentUser.mealPlanId;
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    this.loadRecipes();

    this.loadMealPlan();

  }

  private async loadMealPlan() {
    if (!this.currentUser || !this.mealPlanId) return;

    try {
      // getMealPlan may return null if no document exists
      const doc = await this.mealPlanService.getMealPlan(this.mealPlanId);
      if (!doc) {
        console.warn(`No meal plan document found for id ${this.mealPlanId}`);
        return;
      }
      // doc is a MealPlan instance
      this.mealPlan = doc.mealPlan;
      console.log("mealplan", this.mealPlan);
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  }

  async loadRecipes() {
    try {
      const allRecipes = await this.recipeService.getRecipes().toPromise();
      if (allRecipes) {
        this.recipes = allRecipes;
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  }

  selectRecipe(dayIndex: number, mealIndex: number) {
    const dialogRef = this.dialog.open(RecipeSelectionDialogComponent, {
      width: '80%',
      data: { recipes: this.recipes }
    });

    dialogRef.afterClosed().subscribe((selectedRecipe: Recipe) => {
      if (selectedRecipe) {
        this.mealPlan[dayIndex][mealIndex] = selectedRecipe;
        this.selectedRecipes.add(selectedRecipe.id);
        this.showShoppingListButton = this.selectedRecipes.size > 0;
      }
    });
  }

  removeRecipeFromMealPlan(dayIndex: number, mealIndex: number) {
    const recipe = this.mealPlan[dayIndex][mealIndex];
    if (recipe) {
      this.selectedRecipes.delete(recipe.id);
      this.showShoppingListButton = this.selectedRecipes.size > 0;
    }
    this.mealPlan[dayIndex][mealIndex] = null;
  }

  async saveMealPlan() {
    if (!this.currentUser) return;

    try {
      this.mealPlanId = await this.mealPlanService.saveMealPlan(this.currentUser.id, this.mealPlan);
      console.log('Meal plan saved successfully');
      this.currentUser.mealPlanId = this.mealPlanId;
    } catch (error) {
      console.error('Error saving meal plan:', error);
    }
  }

  getRecipeForMeal(dayIndex: number, mealIndex: number): Recipe | null {
    return this.mealPlan[dayIndex][mealIndex];
  }

  private getAllPlannedRecipes(): Recipe[] {
    const plannedRecipes: Recipe[] = [];
    
    // Iterate through the meal plan grid
    for (let dayIndex = 0; dayIndex < this.mealPlan.length; dayIndex++) {
      for (let mealIndex = 0; mealIndex < this.mealPlan[dayIndex].length; mealIndex++) {
        const recipe = this.mealPlan[dayIndex][mealIndex];
        if (recipe) {
          // Check if recipe is already in the list to avoid duplicates
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

      // Get the created shopping list
      const shoppingList = await this.shoppingListService.getShoppingList(listId);
      
      if (shoppingList) {
        // Open the shopping list dialog
        const dialogRef = this.dialog.open(ShoppingListDialogComponent, {
          width: '600px',
          data: { shoppingList }
        });

        // Handle dialog close
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log('Shopping list saved with checked items:', result);
          }
        });
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('Failed to generate shopping list. Please try again.');
    }
  }
}
