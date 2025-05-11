import { Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { AddRecipeComponent } from './post-recipe/post-recipe.component';
import { MealPlanComponent } from './meal-plan/meal-plan.component';
import { ShoppingListsComponent } from './shopping-list/shopping-lists.component';

import { LandingComponent } from './landing/landing.component';
import { RegisterComponent } from './authentication/register/register.component';
import { LoginComponent } from './authentication/login/login.component';
export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'Recipe Planner',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register - Recipe Planner',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Recipe Planner',
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    title: 'My Profile - Recipe Planner',
  },
  {
    path: 'profile/:id',
    component: UserProfileComponent,
    title: 'User Profile - Recipe Planner',
  },
  {
    path: 'recipes',
    component: RecipeListComponent,
    title: 'Recipes - Recipe Planner',
  },
  {
    path: 'add-recipe',
    component: AddRecipeComponent,
    title: 'Add Recipe',
  },
  {
    path: 'recipe/:id',
    loadComponent: () =>
      import('./recipe-detail/recipe-detail.component').then(
        (m) => m.RecipeDetailComponent
      ),
  },
  {
    path: 'meal',
    component: MealPlanComponent,
    title: 'Meal Plan - Recipe Planner',
  },
  {
    path: 'shopping-lists',
    component: ShoppingListsComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
