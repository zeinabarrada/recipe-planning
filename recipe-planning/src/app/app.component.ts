import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthenticationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'recipe-planning';
}
