import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { User } from '../models/users.model';
import { AuthenticationService } from '../services/authentication.service';
import { NgIf, CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
@Component({
  selector: 'app-follow-button',
  imports: [NgIf, CommonModule],
  templateUrl: './follow-button.component.html',
  styleUrl: './follow-button.component.css'
})
export class FollowButtonComponent implements OnInit {
  @Input() targetUser!: User;
  @Input() isFollowing: boolean = false;
  @Output() follow = new EventEmitter<void>();
  @Output() unfollow = new EventEmitter<void>();

  currentUser: User | null = null;


  constructor(private authService: AuthenticationService, private userService: UserService) {
    this.authService.getUser().subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    console.log('current user', this.currentUser);

    if (this.currentUser) {
      this.checkFollow(this.targetUser);
    }
  }

  onFollow() {
    if (this.currentUser && this.targetUser) {
      this.currentUser.follow(this.targetUser.id);
      this.userService.followUser(this.currentUser, this.targetUser);
      this.isFollowing = true;
      this.follow.emit();
      console.log('following', this.currentUser.getFollowing());
      this.authService.updateCurrentUser(this.currentUser);
    }
  }

  onUnfollow() {
    if (this.currentUser && this.targetUser) {
      this.currentUser.unfollow(this.targetUser.id);
      this.userService.unfollowUser(this.currentUser, this.targetUser);
      this.isFollowing = false;
      this.unfollow.emit();
      console.log('following', this.currentUser.getFollowing());
      this.authService.updateCurrentUser(this.currentUser);
    }
  }

  checkFollow(targetUser: User) {
    this.isFollowing = this.currentUser?.getFollowing().includes(targetUser.id) || false;
  }
}
