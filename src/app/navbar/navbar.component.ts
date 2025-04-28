import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthenticationService } from "../services/authentication.service";
import { User } from "../models/users.model";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isMenuOpen = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getUser().subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(["/"]);
  }
}
