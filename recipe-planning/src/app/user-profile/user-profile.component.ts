import { Component, input, OnInit } from '@angular/core';
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
export class UserProfileComponent {
  waitingForFollow: boolean = false;
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

  followersCount: number = 0;
  followingCount: number = 0;

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.authService.getUser().subscribe(async (user) => {
      if (user && user.id) {
        this.currentUser = user;
        this.mealPlanId = this.currentUser.mealPlanId;
        this.loadSavedRecipes();
        await this.loadFollowersList();
        await this.loadFollowingList();
        this.loadCurrentUserPostedRecipes();
      }
    });

    const targetUserId = this.route.snapshot.paramMap.get('id');
    if (targetUserId) {
      try {
        this.targetUser = await this.userService.getUserByIdInstance(
          targetUserId
        );

        if (this.targetUser) {
          this.followersCount = this.targetUser.getFollowers().length;
          this.followingCount = this.targetUser.getFollowing().length;
          this.isFollowing =
            this.currentUser?.following.includes(this.targetUser?.id) || false;
          this.loadTargetUserPostedRecipes();
        }
      } catch (error) {
        console.error('Error loading target user:', error);
      }
    }
  }

  async onFollow() {
    if (this.currentUser && this.targetUser) {
      this.followersCount = this.followersCount + 1;
      await this.userService.followUser(this.currentUser, this.targetUser);
      this.isFollowing = true;
      this.authService.updateCurrentUser(this.currentUser);
    }
  }

  async onUnfollow() {
    if (this.currentUser && this.targetUser) {
      this.followersCount = this.followersCount - 1;
      await this.userService.unfollowUser(this.currentUser, this.targetUser);
      this.isFollowing = false;
      this.authService.updateCurrentUser(this.currentUser);
    }
  }

  loadSavedRecipes(): void {
    if (!this.currentUser) {
      console.error('Invalid user ID provided to loadSavedRecipes');
      return;
    }

    this.userService.getSavedRecipes(this.currentUser).subscribe({
      next: (savedRecipe) => {
        if (savedRecipe.length === 0) {
          this.savedRecipes = [];
          return;
        }
        this.savedRecipes = savedRecipe;
      },
      error: (error) => {
        this.savedRecipes = [];
      },
    });
  }

  async loadFollowersList() {
    if (!this.currentUser) return;
    this.followersList = [];

    this.followersIds = this.currentUser.getFollowers();

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
    this.followingIds = this.currentUser.getFollowing();

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
    await this.loadFollowersList();
    await this.loadFollowingList();
    this.authService.updateCurrentUser(this.currentUser);
  }

  async unfollowUser(userId: string) {
    if (!this.currentUser) return;
    const userToUnfollow = await this.userService.getUserByIdInstance(userId);
    await this.userService.unfollowUser(this.currentUser, userToUnfollow);
    await this.loadFollowingList();
    await this.loadFollowersList();
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
      this.targetUserPostedRecipes = recipes.filter(
        (recipe) => recipe.authorId === this.targetUser?.id
      );
    });
  }

  loadCurrentUserPostedRecipes() {
    if (!this.currentUser) return;

    this.recipeService.getRecipes().subscribe((recipes) => {
      this.currentUserPostedRecipes = recipes.filter(
        (recipe) => recipe.authorId === this.currentUser?.id
      );
    });
  }
}
