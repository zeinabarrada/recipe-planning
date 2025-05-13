import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { CommonModule } from '@angular/common';
import { User } from '../models/users.model';
import { FollowButtonComponent } from '../follow-button/follow-button.component';
import { ActivatedRoute, Router } from '@angular/router';
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

  targetUserPostedRecipes: Recipe[] = [];
  currentUserPostedRecipes: Recipe[] = [];

  mealPlanId: string = '';

  followersList: User[] = [];
  followingList: User[] = [];

  followingIds: string[] = [];
  followersIds: string[] = [];
  activeTab: string = 'recipes';

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.authService.getUser().subscribe(async (user) => {
      if (user && user.id) {
        this.currentUser = user;
        this.mealPlanId = this.currentUser.mealPlanId;
        this.loadSavedRecipes();
        await this.loadFollowersList();
        await this.loadFollowingList();
        this.loadCurrentUserPostedRecipes();
      } else {
        console.warn('User not properly initialized yet');
      }
    });

    const targetUserId = this.route.snapshot.paramMap.get('id');
    if (targetUserId) {
      try {
        this.targetUser = await this.userService.getUserByIdInstance(
          targetUserId
        );
        if (this.targetUser) {
          // Load followers for the target user
          this.loadTargetUserPostedRecipes();
          this.followersIds = this.targetUser.getFollowers();
          this.followersList = [];
          for (const id of this.followersIds) {
            try {
              const user = await this.userService.getUserByIdInstance(id);
              this.followersList.push(user);
            } catch (error) {
              console.error('Error loading follower:', error);
            }
          }

          // Refresh target user data to get latest followers count
          this.targetUser = await this.userService.getUserByIdInstance(
            targetUserId
          );

          // Check if current user is following target user
          if (this.currentUser) {
            this.isFollowing = this.currentUser
              .getFollowing()
              .includes(this.targetUser.id);
          }
        }
      } catch (error) {
        console.error('Error loading target user:', error);
      }
    }
  }

  async onFollow() {
    if (
      this.currentUser && this.targetUser &&
      this.currentUser.id &&
      this.targetUser.id
    ) {
      await this.userService.followUser(this.currentUser, this.targetUser);
      this.isFollowing = true;

      // Refresh both users' data
      this.currentUser = await this.userService.getUserByIdInstance(
        this.currentUser.id
      );
      this.targetUser = await this.userService.getUserByIdInstance(
        this.targetUser.id
      );
      this.authService.updateCurrentUser(this.currentUser);

      // Reload followers list
      await this.loadFollowersList();
    } else {
      console.error('(component) Cannot follow: Invalid user IDs', {
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
      this.currentUser = await this.userService.getUserByIdInstance(
        this.currentUser.id
      );
      this.targetUser = await this.userService.getUserByIdInstance(
        this.targetUser.id
      );
      this.authService.updateCurrentUser(this.currentUser);

      // Reload followers list
      await this.loadFollowersList();
    } else {
      console.error('(component) Cannot unfollow: Invalid user IDs', {
        currentUserId: this.currentUser?.id,
        targetUserId: this.targetUser?.id,
      });
    }
  }

  loadSavedRecipes(): void {
    if (!this.currentUser) {
      console.error('Invalid user ID provided to loadSavedRecipes');
      return;
    }

    this.userService.getSavedRecipes(this.currentUser).subscribe({
      next: (savedRecipeIds) => {
        console.log('Saved recipe IDs:', savedRecipeIds);
        if (savedRecipeIds.length === 0) {
          this.savedRecipes = [];
          return;
        }

        const recipeObservables = savedRecipeIds.map((recipe) =>
          this.recipeService.getRecipeById(recipe.id)
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

  async loadFollowersList() {
    if (!this.currentUser) return;
    this.followersList = [];

    // Get fresh user data from Firestore
    const freshUser = await this.userService.getUserByIdInstance(
      this.currentUser.id
    );
    this.followersIds = freshUser.getFollowers();

    for (const id of this.followersIds) {
      try {
        const user = await this.userService.getUserByIdInstance(id);
        this.followersList.push(user);
      } catch (error) {
        console.error('Error loading follower:', error);
      }
    }
  }

  async loadFollowingList() {
    if (!this.currentUser) return;
    this.followingList = [];

    // Get fresh user data from Firestore
    const freshUser = await this.userService.getUserByIdInstance(
      this.currentUser.id
    );
    this.followingIds = freshUser.getFollowing();

    for (const id of this.followingIds) {
      try {
        const user = await this.userService.getUserByIdInstance(id);
        this.followingList.push(user);
      } catch (error) {
        console.error('Error loading following user:', error);
      }
    }
  }

  async removeFollower(followerId: string) {
    if (!this.currentUser) return;

    const follower = await this.userService.getUserByIdInstance(followerId);
    await this.userService.unfollowUser(follower, this.currentUser);

    // Refresh the lists
    await this.loadFollowersList();
    this.currentUser = await this.userService.getUserByIdInstance(
      this.currentUser.id
    );
    this.authService.updateCurrentUser(this.currentUser);
  }

  async unfollowUser(userId: string) {
    if (!this.currentUser) return;

    const userToUnfollow = await this.userService.getUserByIdInstance(userId);
    await this.userService.unfollowUser(this.currentUser, userToUnfollow);

    // Refresh the lists
    await this.loadFollowingList();
    this.currentUser = await this.userService.getUserByIdInstance(
      this.currentUser.id
    );
    this.authService.updateCurrentUser(this.currentUser);
  }

  getFirstLetter(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  viewProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  loadTargetUserPostedRecipes() {
    if (!this.targetUser) return;

    this.recipeService.getRecipes().subscribe((recipes) => {
      this.targetUserPostedRecipes = recipes.filter((recipe) => recipe.authorId === this.targetUser?.id);
      console.log('Posted recipes:', this.targetUserPostedRecipes);
    });
  }

  loadCurrentUserPostedRecipes() {
    if (!this.currentUser) return;
    this.recipeService.getRecipes().subscribe((recipes) => {
      this.currentUserPostedRecipes = recipes.filter((recipe) => recipe.authorId === this.currentUser?.id);
      console.log('Posted recipes:', this.currentUserPostedRecipes);
    });
  }
}
