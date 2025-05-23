// src/app/models/user.model.ts
import { Firestore } from '@angular/fire/firestore';

export class User {
  constructor(
    public firestore: Firestore,
    public email: string,
    public username: string,
    private password: string,
    public id: string = '',
    public following: string[] = [],
    public followers: string[] = [],
    public savedRecipes: string[] = [],
    public mealPlanId: string = '',
    public avatar: string = ''
  ) { }

  setCurrentUser(user: User) {
    user.id = this.id;
    user.email = this.email;
    user.username = this.username;
    user.password = this.password;
    user.following = this.following;
    user.followers = this.followers;
    user.savedRecipes = this.savedRecipes;
    user.mealPlanId = this.mealPlanId;
    user.avatar = this.avatar;
    return user;
  }

  getPassword(): string {
    return this.password;
  }

  getId(): string {
    return this.id;
  }

  getUser(): User {
    return this;
  }

  getUserByUsername(username: string): User | null {
    if (this.username === username) {
      return this;
    }
    return null;
  }

  follow(userId: string) {
    if (!this.following.includes(userId)) {
      this.following.push(userId);
    }
  }

  unfollow(userId: string) {
    this.following = this.following.filter((id) => id !== userId);
  }

  addFollower(userId: string) {
    if (!this.followers.includes(userId)) {
      this.followers.push(userId);
    }
  }

  removeFollower(userId: string) {
    this.followers = this.followers.filter((id) => id !== userId);
  }

  getFollowing(): string[] {
    return this.following;
  }

  getFollowers(): string[] {
    return this.followers;
  }

  toJSON(): any {
    return {
      email: this.email,
      username: this.username,
      password: this.password,
      id: this.id,
      following: this.following,
      followers: this.followers,
      savedRecipes: this.savedRecipes,
      mealPlanId: this.mealPlanId,      
    };
  }

  static fromJSON(data: any): User {
    const user = new User(
      data.firestore,
      data.email,
      data.username,
      data.password,
      data.id,
      data.following || [],
      data.followers || [],
      data.savedRecipes || [],
      data.mealPlanId || '',
      data.avatar || ''
    );
    return user;
  }
}
