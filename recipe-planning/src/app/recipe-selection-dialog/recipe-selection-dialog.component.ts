import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Recipe } from '../models/recipe.model';
import { MatButtonModule } from '@angular/material/button';
import { RecipeService } from '../services/recipe.service';

@Component({
    selector: 'app-recipe-selection-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
    <h2 mat-dialog-title>Select a Recipe</h2>
    <mat-dialog-content>
      <div class="recipe-list">
        <div *ngFor="let recipe of recipes" class="recipe-item" (click)="selectRecipe(recipe)">
          <h3>{{ recipe.recipe_name }}</h3>
          <p>{{ recipe.type }}</p>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .recipe-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .recipe-item {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
    .recipe-item:hover {
      background-color: #f5f5f5;
    }
  `]
})
export class RecipeSelectionDialogComponent implements OnInit {
    recipes: Recipe[] = [];

    constructor(
        public dialogRef: MatDialogRef<RecipeSelectionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { recipes: Recipe[] },
        private recipeService: RecipeService,
    ) {
        this.recipes = data.recipes;
    }

    ngOnInit() {
        this.recipeService.getRecipes().subscribe(recipes => {
            this.recipes = recipes;
        });
    }

    selectRecipe(recipe: Recipe) {
        this.dialogRef.close(recipe);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
} 
