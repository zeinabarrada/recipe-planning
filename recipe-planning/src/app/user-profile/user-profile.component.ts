import { Component, NgModule, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { User } from '../models/users.model';

@Component({
  imports: [CommonModule],
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    this.user = this.authService.getUserData();
    console.log(this.user);
  }
}
