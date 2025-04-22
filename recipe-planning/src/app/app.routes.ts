import { Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
export const routes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'profile/:id', component: UserProfileComponent },
  {
    path: 'recipes',
    loadComponent: () =>
      import('./recipe-list/recipe-list.component').then(
        (m) => m.RecipeListComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
