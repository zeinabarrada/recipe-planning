import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { Recipe } from '../models/recipe.model';
import { RecipeService } from '../services/recipe.service';
import { User } from '../models/users.model';
import { LikeRecipeComponent } from '../like-recipe';

@Component({
  selector: 'app-recipe-detail',
  imports: [LikeRecipeComponent],
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

  async onLikeToggled(event: { recipeId: string, liked: boolean }) {
    if (!this.recipe || !this.currentUser) return;
    if (event.liked) {
      if (!this.recipe.likedBy.includes(this.currentUser.id)) {
        this.recipe.likedBy.push(this.currentUser.id);
        this.recipe.likes++;
      }
    } else {
      const idx = this.recipe.likedBy.indexOf(this.currentUser.id);
      if (idx > -1) {
        this.recipe.likedBy.splice(idx, 1);
        this.recipe.likes = Math.max(0, this.recipe.likes - 1);
      }
    }
    await this.recipeService.updateRecipe(this.recipe);
  }
}
