import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/users.model';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private user: User | null = null;
  private users: { email: string; username: string; password: string }[] = [];
  isAuth = new BehaviorSubject<boolean>(false);

  constructor(private firestore: Firestore) {
    this.initializeUsers();
  }

  async initializeUsers() {
    const usersCollection = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    this.users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        email: data['email'],
        username: data['username'],
        password: data['password']
      };
    });
  }

  async register(email: string, username: string, password: string) {
    const user = new User(this.firestore, email, username, password);
    await user.save();
    
    this.users.push({ email, username, password });
    this.isAuth.next(true);
    this.user = user;
    localStorage.setItem('currentUser', JSON.stringify({ email, username, password, id: user.id }));
    return this.getUserData();
  }

  async login(username: string, password: string) {
    const user = this.users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      this.isAuth.next(true);
      this.user = new User(this.firestore, user.email, user.username, user.password);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return this.getUserData();
    }
    return null;
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
