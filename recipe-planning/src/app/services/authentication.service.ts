import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/users.model';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUser = new BehaviorSubject<User | null>(null);
  private users: User[] = [];
  isAuth = new BehaviorSubject<boolean>(false);

  constructor(private firestore: Firestore, private userService: UserService) {
    this.initializeUsers();
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      this.currentUser.next(
        this.userService.createUser(
          userData.email,
          userData.username,
          userData.password,
          userData.id,
          userData.following,
          userData.followers
        )
      );
    }
  }

  async initializeUsers() {
    const usersCollection = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    this.users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return this.userService.createUser(
        data['email'],
        data['username'],
        data['password'],
        doc.id,
        data['following'],
        data['followers']
      );
    });
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
      JSON.stringify({ email, username, password, id: user.id })
    );
  }

  async login(username: string, password: string) {
    const user = this.users.find(
      (user) => user.username === username && user.getPassword() === password
    );

    if (user) {
      this.isAuth.next(true);
      this.currentUser.next(user);
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          email: user.email,
          username: user.username,
          id: user.id,
        })
      );
    }
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
        following: user.getFollowing(),
        followers: user.getFollowers(),
      })
    );
  }
}
