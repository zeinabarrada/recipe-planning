import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    CommonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  constructor(
    private auth: AuthenticationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  isAuthenticated: boolean = false;
  registerForm: FormGroup;

  handleRegister() {
    console.log('button clicked');
    if (this.registerForm.valid) {
      const email = this.registerForm.value.email;
      const username = this.registerForm.value.username;
      const password = this.registerForm.value.password;
      this.auth.register(email, username, password);
      console.log(email, username, password);
      this.isAuthenticated = true;
      this.router.navigate(['/profile']);
    }
  }
}
