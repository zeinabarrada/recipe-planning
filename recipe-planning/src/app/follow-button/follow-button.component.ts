import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { User } from '../models/users.model';
import { AuthenticationService } from '../authentication/authentication.service';
import { NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-follow-button',
  imports: [NgIf, CommonModule],
  templateUrl: './follow-button.component.html',
  styleUrl: './follow-button.component.css'
})
export class FollowButtonComponent implements OnInit {
  @Input() user!: User;
  @Input() isFollowing: boolean = false;
  @Output() follow = new EventEmitter<void>();
  @Output() unfollow = new EventEmitter<void>();

  currentUser: User | null = null;

  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log(this.currentUser);

    if (this.currentUser) {
      this.checkFollow(this.user);
    }
  }

  onFollow() {
    if (this.currentUser) {
      this.currentUser.follow(this.user);
      this.isFollowing = true;
      this.follow.emit();
    }
  }

  onUnfollow() {
    if (this.currentUser) {
      this.currentUser.unfollow(this.user);
      this.isFollowing = false;
      this.unfollow.emit();
    }
  }

  checkFollow(user: User) {
    this.isFollowing = user.getFollowing().includes(this.user);
  }
}
