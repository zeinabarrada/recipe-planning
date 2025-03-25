import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private users: { email: string; username: string; password: string }[] = [];
  isAuth = new BehaviorSubject<boolean>(false);

  constructor() {}
  register(email: string, username: string, password: string) {
    this.users.push({ email, username, password });
    this.isAuth.next(true);
    console.log(this.users);
  }
  login(username: string, password: string) {
    const user = this.users.find(
      (user) => user.username === username && user.password === password
    ); // searching in array if this username exist
    if (user) {
      this.isAuth.next(true);
    }
  }
  logout() {
    this.isAuth.next(false);
  }
}
