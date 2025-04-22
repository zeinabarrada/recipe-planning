import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/users.model';



@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  private user: User | null = null;
  private users: { email: string; username: string; password: string }[] = [];
  isAuth = new BehaviorSubject<boolean>(false);

  constructor() { }

  register(email: string, username: string, password: string) {
    this.users.push({ email, username, password });
    this.isAuth.next(true);
    console.log(this.users);

    this.user = new User(email, username, password);
    this.getUserData();
  }

  login(username: string, password: string) {
    const user = this.users.find(
      (user) => user.username === username && user.password === password
    ); // searching in array if this username exist
    if (user) {
      this.isAuth.next(true);
      const userInstance = new User(user.email, user.username, user.password);
      this.getUserData();
    }
  }

  logout() {
    this.isAuth.next(false);
  }

  getUserData(): any {
    if (this.user) {
      return this.user.getUser();
    }
    return null;
  }

}
