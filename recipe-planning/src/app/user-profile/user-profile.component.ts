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
      this.authService.getUser().subscribe(async (user) => {
        this.currentUser = user;
        if (this.currentUser) {
          await this.userService.loadFollowing(this.currentUser);
        }
        console.log("Current user:", this.currentUser);
        this.updateFollowingState();
      });

      const route = this.route.snapshot.paramMap.get('id');
      if (route) {
        this.targetUser = await this.userService.getUserById(route);
        if (this.targetUser) {
          await this.userService.loadFollowing(this.targetUser);
        }
        this.updateFollowingState();
      }
    } catch (error) {
      console.error('Error initializing component:', error);
    }
  }

  private updateFollowingState() {
    if (this.currentUser && this.targetUser) {
      this.isFollowing = this.currentUser.getFollowing().includes(this.targetUser.id);
    }
  }

  async onFollow() {
    if (this.currentUser && this.targetUser) {
      await this.userService.followUser(this.currentUser, this.targetUser);
      this.isFollowing = true;
    }
  }

  async onUnfollow() {
    if (this.currentUser && this.targetUser) {
      await this.userService.unfollowUser(this.currentUser, this.targetUser);
      this.isFollowing = false;
    }
  }
}
