import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { User } from '../models/users.model';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { UserService } from '../services/user.service';
import { Recipe } from '../models/recipe.model';
import { RecipeService } from './recipe.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUser = new BehaviorSubject<User | null>(null);
  private users: User[] = [];
  isAuth = new BehaviorSubject<boolean>(false);

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private recipeService: RecipeService
  ) {
    // get users from database
    this.initializeUsers();

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const user = this.userService.createUser(
          userData.email,
          userData.username,
          userData.password,
          userData.id,
          userData.following || [],
          userData.followers || [],
          userData.savedRecipes || [],
          userData.mealPlanId || null
        );
        this.currentUser.next(user);
        this.isAuth.next(true);
        console.error('stored user:', this.currentUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  async initializeUsers() {
    const usersCollection = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    this.users = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        return this.userService.createUser(
          data['email'],
          data['username'],
          data['password'],
          doc.id,
          data['following'] || [],
          data['followers'] || [],
          data['savedRecipes'] || [],
          data['mealPlanId'] || null
        );
      })
    );
    console.log('Initialized users:', this.users);
  }

  async register(email: string, username: string, password: string) {
    const user = this.userService.createUser(email, username, password);
    await this.userService.saveUser(user);

    this.users.push(user);
    this.isAuth.next(true);
    this.currentUser.next(user);
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        email: user.email,
        username: user.username,
        password: user.getPassword(),
        id: user.id,
        following: user.getFollowing(),
        followers: user.getFollowers(),
      })
    );
  }

  async login(username: string, password: string): Promise<User | null> {
    const user = this.users.find(
      (u) => u.username === username && u.getPassword() === password
    );
    if (user) {
      const freshUser = await this.userService.getUserByIdInstance(user.id);
      this.currentUser.next(freshUser);
      this.isAuth.next(true);
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          email: freshUser.email,
          username: freshUser.username,
          id: freshUser.id,
          avatar: freshUser.avatar,
          following: freshUser.getFollowing(),
          followers: freshUser.getFollowers(),
          savedRecipes: freshUser.savedRecipes,
          mealPlanId: freshUser.mealPlanId,
        })
      );
      return freshUser;
    }
    console.log('Log in user not found');
    return null;
  }

  logout() {
    this.isAuth.next(false);
    this.currentUser.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  getUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  updateCurrentUser(user: User) {
    this.currentUser.next(user);
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        email: user.email,
        username: user.username,
        id: user.id,
        avatar: user.avatar,
        following: user.getFollowing(),
        followers: user.getFollowers(),
        savedRecipes: user.savedRecipes,
        mealPlanId: user.mealPlanId,
      })
    );
  }
}
