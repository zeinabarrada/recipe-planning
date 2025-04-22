import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/users.model';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private user: User | null = null;
  private users: User[] = [];
  isAuth = new BehaviorSubject<boolean>(false);

  constructor(private firestore: Firestore) {
    this.initializeUsers();
  }

  async initializeUsers() {
    const usersCollection = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    this.users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return new User(
        this.firestore,
        data['email'],
        data['username'],
        data['password'],
        doc.id
      );
    });
    console.log('Initialized users:', this.users);
  }

  async register(email: string, username: string, password: string) {
    const user = new User(this.firestore, email, username, password);
    await user.save();
    this.users.push(user);
    this.isAuth.next(true);
    this.user = user;
    localStorage.setItem('currentUser', JSON.stringify({ email, username, password, id: user.id }));
  }

  async login(username: string, password: string) {
    const user = this.users.find(
      (user) => user.username === username && user.getPassword() === password
    );
    if (user) {
      this.isAuth.next(true);
      this.user = user;
      localStorage.setItem('currentUser', JSON.stringify({
        email: user.email,
        username: user.username,
        id: user.id
      }));
    }
  }

  logout() {
    this.isAuth.next(false);
    this.user = null;
    localStorage.removeItem('currentUser');
  }

  getUserData(): User | null {
    return this.user;
  }
}

