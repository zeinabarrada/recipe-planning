import { Routes } from "@angular/router";
import { AuthenticationComponent } from "./authentication/authentication.component";
import { UserProfileComponent } from "./user-profile/user-profile.component";

export const routes: Routes = [
    { path: '', component: AuthenticationComponent },    
    { path: 'profile', component: UserProfileComponent },
];  
