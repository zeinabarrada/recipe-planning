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

  followersList: User[] = [];
  followingList: User[] = [];

  followingIds: string[] = [];
  followersIds: string[] = [];

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) { }

  async ngOnInit() {
    this.authService.getUser().subscribe(async (user) => {
      this.currentUser = user;
      await this.loadSavedRecipes(this.currentUser!.id);
      await this.loadFollowersList();
      await this.loadFollowingList();
    });

    const targetUserId = this.route.snapshot.paramMap.get('id');
    if (targetUserId) {
      this.targetUser = await this.userService.getUserByIdInstance(targetUserId);
      this.isFollowing = this.followingIds.includes(this.targetUser.id);
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
      this.currentUser = await this.userService.getUserByIdInstance(this.currentUser.id);
      this.targetUser = await this.userService.getUserByIdInstance(this.targetUser.id);
      this.authService.updateCurrentUser(this.currentUser);
    } else {
      console.error('(component) Cannot unfollow: Invalid user IDs', {
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
    console.log('Followers list:', this.followersList);
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
    console.log('Following list:', this.followingList);
  }

  async removeFollower(followerId: string) {
    if (!this.currentUser) return;

    const follower = await this.userService.getUserByIdInstance(followerId);
    await this.userService.unfollowUser(follower, this.currentUser);

    // Refresh the lists
    await this.loadFollowersList();
    this.currentUser = await this.userService.getUserByIdInstance(this.currentUser.id);
    this.authService.updateCurrentUser(this.currentUser);
  }

  async unfollowUser(userId: string) {
    if (!this.currentUser) return;

    const userToUnfollow = await this.userService.getUserByIdInstance(userId);
    await this.userService.unfollowUser(this.currentUser, userToUnfollow);

    // Refresh the lists
    await this.loadFollowingList();
    this.currentUser = await this.userService.getUserByIdInstance(this.currentUser.id);
    this.authService.updateCurrentUser(this.currentUser);
  }
}
