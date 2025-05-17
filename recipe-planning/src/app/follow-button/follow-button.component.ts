import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { User } from '../models/users.model';
import { AuthenticationService } from '../services/authentication.service';
import { NgIf, CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './follow-button.component.html',
  styleUrls: ['./follow-button.component.css']
})
export class FollowButtonComponent {
  @Input() targetUser!: User;
  @Input() isFollowing: boolean = false;
  @Output() follow = new EventEmitter<void>();
  @Output() unfollow = new EventEmitter<void>();

  currentUser: User | null = null;
  waitingForFollow: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private userService: UserService) { }

  ngOnInit() {
    this.authService.getUser()?.subscribe((user) => {
      this.currentUser = user;
    });
  }

  async onFollow() {
    if (this.currentUser && this.targetUser) {
      this.waitingForFollow = true;
      try {
        await this.userService.followUser(this.currentUser, this.targetUser);
        this.isFollowing = true;
        this.follow.emit();
        this.authService.updateCurrentUser(this.currentUser);
      } finally {
        this.waitingForFollow = false;
      }
    }
  }

  async onUnfollow() {
    if (this.currentUser && this.targetUser) {
      this.waitingForFollow = true;
      try {
        await this.userService.unfollowUser(this.currentUser, this.targetUser);
        this.isFollowing = false;
        this.unfollow.emit();
        this.authService.updateCurrentUser(this.currentUser);
      } finally {
        this.waitingForFollow = false;
      }
    }
  }
}
