import { Component, NgModule, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { User } from '../models/users.model';
import { FollowButtonComponent } from '../follow-button/follow-button.component';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { Firestore } from '@angular/fire/firestore';

@Component({
  imports: [CommonModule, FollowButtonComponent],
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  targetUser: User | null = null;
  isFollowing: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private firestore: Firestore
  ) { }

  async ngOnInit() {
    // Get initial value
    this.currentUser = this.authService.getCurrentUser();
    console.log("Initial current user:", this.currentUser);

    if (this.currentUser == null) {
      // Also check localStorage for current user
      this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log("Retrieved user from localStorage:", this.currentUser);
    }

    // Subscribe to changes
    this.authService.getCurrentUserObservable().subscribe(user => {
      this.currentUser = user;
      this.updateFollowingState();
    });

    const route = this.route.snapshot.paramMap.get('id');
    console.log('Route:', route);
    if (route) {
      this.targetUser = await this.userService.getUserById(route);
      console.log("User from route:", this.targetUser);
      this.updateFollowingState();
    }
  }

  private updateFollowingState() {
    if (this.currentUser && this.targetUser) {
      this.isFollowing = this.currentUser.getFollowing().includes(this.targetUser);
    }
  }

  onFollow() {
    if (this.currentUser && this.targetUser) {
      this.currentUser.follow(this.targetUser);
      this.isFollowing = true;
    }
  }

  onUnfollow() {
    if (this.currentUser && this.targetUser) {
      this.currentUser.unfollow(this.targetUser);
      this.isFollowing = false;
    }
  }
}
