import { Component, NgModule, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { User } from '../models/users.model';
import { FollowButtonComponent } from '../follow-button/follow-button.component';

@Component({
  imports: [CommonModule, FollowButtonComponent],
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isFollowing: boolean = false;

  constructor(private authService: AuthenticationService) { }

  async ngOnInit() {
    this.user = this.authService.getCurrentUser();
    console.log(this.user);
  }

  onFollow() {
    if (this.user) {
      this.user.follow(this.user);
      this.isFollowing = true;
    }
  }

  onUnfollow() {
    if (this.user) {
      this.user.unfollow(this.user);
      this.isFollowing = false;
    }
  }
}
