import { Component, OnInit } from '@angular/core';
import { User } from '../models/users.model';
import { Recipe } from '../models/recipe.model';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { RecipeService } from '../services/recipe.service';
import { MealPlanService } from '../services/meal-plan.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecipeSelectionDialogComponent } from '../recipe-selection-dialog/recipe-selection-dialog.component';

type MealType = 'breakfast' | 'lunch' | 'dinner';
type DayMeals = {
  [key in MealType]?: Recipe;
};

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './meal-plan.component.html',
  styleUrls: ['./meal-plan.component.css']
})
export class MealPlanComponent implements OnInit {
  currentUser: User | null = null;
  recipes: Recipe[] = [];
  mealPlan: { [key: string]: DayMeals } = {};
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
  mealTypes = ['breakfast', 'lunch', 'dinner'] as const;
  selectedDay: string | null = null;
  selectedMealType: MealType | null = null;

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private recipeService: RecipeService,
    private mealPlanService: MealPlanService,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.authService.getUser().subscribe(async (user) => {
      this.currentUser = user;
      if (this.currentUser) {
        await this.loadRecipes();
        await this.loadMealPlan();
        this.initializeMealPlan();
      }
    });
  }

  private initializeMealPlan() {
    this.daysOfWeek.forEach(day => {
      if (!this.mealPlan[day]) {
        this.mealPlan[day] = {};
      }
    });
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

  async loadMealPlan() {
    if (!this.currentUser) return;

    try {
      const savedMealPlan = await this.mealPlanService.getMealPlan(this.currentUser.id);
      if (savedMealPlan) {
        this.mealPlan = savedMealPlan.mealPlan;
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  }

  async selectRecipe(day: string, mealType: MealType) {
    this.selectedDay = day;
    this.selectedMealType = mealType;

    const dialogRef = this.dialog.open(RecipeSelectionDialogComponent, {
      width: '80%',
      data: { recipes: this.recipes }
    });

    dialogRef.afterClosed().subscribe((selectedRecipe: Recipe) => {
      if (selectedRecipe) {
        this.addRecipeToMealPlan(day, mealType, selectedRecipe);
      }
    });
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

  async saveMealPlan() {
    if (!this.currentUser) return;

    try {
      await this.mealPlanService.saveMealPlan(this.currentUser.id, this.mealPlan);
      console.log('Meal plan saved successfully');
    } catch (error) {
      console.error('Error saving meal plan:', error);
    }
  }

  getRecipeForMeal(day: string, mealType: MealType): Recipe | undefined {
    return this.mealPlan[day]?.[mealType];
  }
}
