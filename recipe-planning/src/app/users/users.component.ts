import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { RecipeService } from '../services/recipe.service';
import { User } from '../models/users.model';
import { Recipe } from '../models/recipe.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private userService: UserService,
    private recipeService: RecipeService
  ) {}

  async ngOnInit() {
    // Fetch all users
    const usersCollection = await this.userService.getAllUsers();
    this.users = usersCollection;
    this.filteredUsers = usersCollection;
    for (const user of this.users) {
      const recipes = await this.recipeService.getRecipesByUserId(user.id);
      const recipeCount = recipes.length;
      const recentRecipe = recipes.length > 0 ? recipes[0] : null;
      const followersCount = user.getFollowers().length;
      this.userStats[user.id] = { recipeCount, followersCount, recentRecipe };
    }
    console.log(this.userStats);
  }

  onSearch(term: string) {
    this.filteredUsers = this.users.filter((user) =>
      user.username.toLowerCase().includes(term.toLowerCase())
    );
  }
}
