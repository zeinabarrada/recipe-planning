import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { CommonModule } from '@angular/common';
import { User } from '../models/users.model';
import { FollowButtonComponent } from '../follow-button/follow-button.component';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../models/recipe.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FollowButtonComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  targetUser: User | null = null;
  isFollowing: boolean = false;
  savedRecipes: Recipe[] = [];

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) { }

  async ngOnInit() {
    this.authService.getUser().subscribe(async (user) => {
      this.currentUser = user;
      if (this.currentUser) {
        this.userService.loadFollowing(this.currentUser).subscribe({
          next: () => {
            console.log(
              'Current user following:',
              this.currentUser?.getFollowing()
            );
            this.updateFollowingState();
            this.loadSavedRecipes(this.currentUser!.id);
          },
          error: (error) => {
            console.error('Error loading following:', error);
          },
        });
      }
    });

    const targetUserId = this.route.snapshot.paramMap.get('id');
    if (targetUserId) {
      this.targetUser = await this.userService.getUserByIdInstance(
        targetUserId
      );
      console.log('Target user:', this.targetUser);
      this.updateFollowingState();
    }
  }

  private updateFollowingState() {
    if (
      this.currentUser &&
      this.targetUser &&
      this.currentUser.id &&
      this.targetUser.id
    ) {
      const following = this.currentUser.getFollowing();
      this.isFollowing = following.includes(this.targetUser.id);
    }
  }

  async onFollow() {
    if (
      this.currentUser &&
      this.targetUser &&
      this.currentUser.id &&
      this.targetUser.id
    ) {
      await this.userService.followUser(this.currentUser, this.targetUser);
      this.isFollowing = true;

      // Refresh both users' data
      this.currentUser = await this.userService.getUserByIdInstance(this.currentUser.id);
      this.targetUser = await this.userService.getUserByIdInstance(this.targetUser.id);
      this.authService.updateCurrentUser(this.currentUser);
    } else {
      console.error('(onFollowFunction) Cannot follow: Invalid user IDs', {
        currentUserId: this.currentUser?.id,
        targetUserId: this.targetUser?.id,
      });
    }
  }

  async onUnfollow() {
    if (
      this.currentUser &&
      this.targetUser &&
      this.currentUser.id &&
      this.targetUser.id
    ) {
      await this.userService.unfollowUser(this.currentUser, this.targetUser);
      this.isFollowing = false;

      // Refresh both users' data
      this.currentUser = await this.userService.getUserByIdInstance(this.currentUser.id);
      this.targetUser = await this.userService.getUserByIdInstance(this.targetUser.id);
      this.authService.updateCurrentUser(this.currentUser);
    } else {
      console.error('Cannot unfollow: Invalid user IDs', {
        currentUserId: this.currentUser?.id,
        targetUserId: this.targetUser?.id,
      });
    }
  }
  loadSavedRecipes(userId: string): void {
    if (!userId) {
      console.error('Invalid user ID provided to loadSavedRecipes');
      return;
    }

    this.userService.getSavedRecipes(userId).subscribe({
      next: (savedRecipeIds) => {
        console.log('Saved recipe IDs:', savedRecipeIds);
        if (savedRecipeIds.length === 0) {
          this.savedRecipes = [];
          return;
        }

        const recipeObservables = savedRecipeIds.map((id) =>
          this.recipeService.getRecipeById(id)
        );

        forkJoin(recipeObservables).subscribe({
          next: (recipes) => {
            console.log('Loaded recipes:', recipes);
            this.savedRecipes = recipes;
          },
          error: (error) => {
            console.error('Error loading saved recipes:', error);
            this.savedRecipes = [];
          },
        });
      },
      error: (error) => {
        console.error('Error fetching saved recipe IDs:', error);
        this.savedRecipes = [];
      },
    });
  }
}
