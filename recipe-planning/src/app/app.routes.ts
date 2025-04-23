import { Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { AddRecipeComponent } from './post-recipe/post-recipe.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthenticationComponent,
    title: 'Login/Signup - Recipe Planner',
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
    path: '**',
    redirectTo: '',
  }
];
