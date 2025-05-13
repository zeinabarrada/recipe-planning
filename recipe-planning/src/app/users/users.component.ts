import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { RecipeService } from '../services/recipe.service';
import { User } from '../models/users.model';
import { Recipe } from '../models/recipe.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  currentUserFollowing: string[] = [];
  currentUserFollowers: string[] = [];

  constructor(
    private userService: UserService,
    private recipeService: RecipeService,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  async ngOnInit() {
    this.authService.getUser().subscribe((user) => {
      this.currentUser = user;
      this.currentUserFollowing = user?.following || [];
      this.loadUsers();
    });
  }
  async loadUsers() {
    const usersCollection = await this.userService.getAllUsers();
    this.users = usersCollection;
    this.filteredUsers = usersCollection.filter(
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
    this.router.navigate(['/user', userId]);
  }
  isFollowing(userId: string): boolean {
    return this.currentUserFollowing.includes(userId);
  }
  async toggleFollow(user: User) {
    if (this.isFollowing(user.id)) {
      this.userService.unfollowUser(
        {
          id: this.currentUser?.id,
          getFollowing: () => this.currentUserFollowing,
        } as User,
        user
      );
      this.currentUserFollowing = this.currentUserFollowing.filter(
        (id) => id !== user.id
      );
      this.currentUserFollowers = this.currentUserFollowers.filter(
        (id) => id !== user.id
      );
    } else {
      this.userService.followUser(
        {
          id: this.currentUser?.id,
          getFollowing: () => this.currentUserFollowing,
        } as User,
        user
      );
      this.currentUserFollowing.push(user.id);
      this.currentUserFollowers.push(user.id);
    }
  }
}
