import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Recipe } from '../models/recipe.model';
import { User } from '../models/users.model';

@Component({
  selector: 'app-like-recipe',
  templateUrl: './like-recipe.component.html',
  styleUrls: ['./like-recipe.component.css']
})
export class LikeRecipeComponent {
  @Input() recipe!: Recipe;
  @Input() currentUser!: User | null;
  @Output() likeToggled = new EventEmitter<{ recipeId: string, liked: boolean }>();

  get isLiked(): boolean {
    return !!(this.currentUser && this.recipe.likedBy.includes(this.currentUser.id));
  }

  toggleLike() {
    if (!this.currentUser) return;
    this.likeToggled.emit({ recipeId: this.recipe.id, liked: !this.isLiked });
  }
} 