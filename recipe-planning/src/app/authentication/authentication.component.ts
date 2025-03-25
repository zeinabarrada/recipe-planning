import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-authentication',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css',
  // Fix for Angular Material animations
})
export class AuthenticationComponent {
  constructor(
    private auth: AuthenticationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  email: string = '';
  username: string = '';
  password: string = '';
  register: boolean = false;
  login: boolean = false;
  isAuthenticated: boolean = false;
  registerForm: FormGroup;
  loginForm: FormGroup;
  handleRegister() {
    if (this.registerForm.valid) {
      this.auth.register(this.email, this.username, this.password);
      console.log(this.email, this.username, this.password);
      this.isAuthenticated = true;
    }
  }
  handleLogin() {
    if (this.loginForm.valid) {
      this.auth.login(this.username, this.password);
      this.isAuthenticated = true;
    }
  }
  handleLogout() {
    this.auth.logout();
    this.email = '';
    this.username = '';
    this.password = '';
    this.isAuthenticated = false;
  }
}
