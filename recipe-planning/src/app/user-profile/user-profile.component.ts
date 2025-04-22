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
    try {
      this.currentUser = this.authService.getCurrentUser();
      console.log("Current user:", this.currentUser);

      if (!this.currentUser) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (userData.email) {
          this.currentUser = new User(
            this.firestore,
            userData.email,
            userData.username,
            userData.password,
            userData.id
          );
          console.log("Created user from localStorage:", this.currentUser.username);
        }
      }

      const route = this.route.snapshot.paramMap.get('id');
      if (route) {
        this.targetUser = await this.userService.getUserById(route);
      }

      // Update following state after both users are loaded
      if (this.currentUser && this.targetUser) {
        this.updateFollowingState();
      }
    } catch (error) {
      console.error('Error initializing component:', error);
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
