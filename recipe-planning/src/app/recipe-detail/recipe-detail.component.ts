import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { Recipe } from '../models/recipe.model';
import { RecipeService } from '../services/recipe.service';
import { User } from '../models/users.model';
@Component({
  selector: 'app-recipe-detail',
  imports: [],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.css',
})
export class RecipeDetailComponent {
  recipeId: string = '';
  recipe: Recipe | null = null;
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private recipeService: RecipeService
  ) {
    this.route.params.subscribe((params) => {
      this.recipeId = params['id'];
    });
    this.authService.getUser().subscribe((user) => {
      this.currentUser = user;
    });
  }
  ngOnInit() {
    this.recipeService.getRecipeById(this.recipeId).subscribe((recipe) => {
      this.recipe = recipe;
    });
  }
}
