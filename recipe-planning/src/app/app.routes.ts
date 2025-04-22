<<<<<<< HEAD
import { Routes } from "@angular/router";
import { AuthenticationComponent } from "./authentication/authentication.component";
import { UserProfileComponent } from "./user-profile/user-profile.component";


=======
import { Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
>>>>>>> 6717b96d3d02d81dbe3b3dc2c2112da53fcaf47d
export const routes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'profile/:id', component: UserProfileComponent },
  { path: 'recipes', component: RecipeListComponent },
  { path: '**', redirectTo: '' },
];
