import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { User } from '../models/users.model';
import { Recipe } from '../models/recipe.model';
import { UserService } from '../services/user.service';
import { RecipeService } from '../services/recipe.service';
import { AuthenticationService } from '../services/authentication.service';
import { FollowButtonComponent } from '../follow-button/follow-button.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FollowButtonComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  userStats: {
    [userId: string]: {
      recipeCount: number;
      followersCount: number;
      recentRecipe: Recipe | null;
    };
  } = {};
  searchTerm: string = '';
  currentUser: User | null = null;
  targetUser: User | null = null;

  constructor(
    private userService: UserService,
    private recipeService: RecipeService,
    private router: Router,
    private authService: AuthenticationService
  ) { }

  async ngOnInit() {
    this.authService.getUser().subscribe((user) => {
      this.currentUser = user;
      this.loadUsers();
    });
  }

  async loadUsers() {
    this.users = await this.authService.initializeUsers();
    this.filteredUsers = this.users.filter(
      (user) => user.id !== this.currentUser?.id
    );
    for (const user of this.users) {
      const recipes = await this.recipeService.getRecipesByUserId(user.id);
      const recipeCount = recipes.length;
      const recentRecipe = recipes.length > 0 ? recipes[0] : null;
      const followersCount = user.getFollowers().length;
      this.userStats[user.id] = { recipeCount, followersCount, recentRecipe };
    }
  }

  onSearch(term: string) {
    this.filteredUsers = this.users.filter((user) =>
      user.username.toLowerCase().includes(term.toLowerCase())
    );
  }

  viewProfile(userId: string) {
    this.userService.getUserByIdInstance(userId).then((user) => {
      this.targetUser = user;
      this.router.navigate(['/profile', userId]);
    });
  }

  isFollowing(userId: string): boolean {
    return this.currentUser?.following.includes(userId) || false;
  }

  onFollow(targetUser: User) {
    if (!this.currentUser || !this.targetUser) return;

    this.userService.followUser(this.currentUser, targetUser);

    this.currentUser.following.push(targetUser.id);
    this.targetUser.followers.push(this.currentUser.id);

    this.authService.updateCurrentUser(this.currentUser);
    this.authService.updateCurrentUser(this.targetUser);

    this.userStats[this.targetUser.id].followersCount++;
  }

  onUnfollow(targetUser: User) {
    if (!this.currentUser || !this.targetUser) return;

    this.userService.unfollowUser(this.currentUser, targetUser);

    this.currentUser.following = this.currentUser.following.filter(
      (id) => id !== targetUser.id
    );
    this.targetUser.followers = this.targetUser.followers.filter(
      (id) => id !== this.currentUser?.id
    );

    this.authService.updateCurrentUser(this.currentUser);
    this.authService.updateCurrentUser(this.targetUser);
  }
}
