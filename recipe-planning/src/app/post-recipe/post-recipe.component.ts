
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecipeService } from '../services/recipe.service';


@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.css']
})
export class RecipeFormComponent {
  recipeForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,

  ) {
    this.recipeForm = this.fb.group({
      recipe_name: ['', Validators.required],
      ingredients: this.fb.array([this.createIngredient()], Validators.required),
      instructions: this.fb.array([this.createInstruction()], Validators.required),
      nutrition_facts: ['', Validators.required],
      image_path: ['']
    });
  }

  // Form array methods
  createIngredient(): FormGroup {
    return this.fb.group({ item: ['', Validators.required] });
  }

  addIngredient() {
    this.ingredients.push(this.createIngredient());
  }


  // Similar methods for instructions
  // ...

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async onSubmit() {
    if (this.recipeForm.invalid) return;

    const user = await this.authService.getCurrentUser();
    if (!user) return;

    let imageUrl = '';
    if (this.selectedFile) {
      imageUrl = await this.imageUpload.uploadImage(this.selectedFile);
    }

    const newRecipe: Recipe = {
      ...this.recipeForm.value,
      author: user.uid,
      image_path: imageUrl,
      ingredients: this.recipeForm.value.ingredients.map((i: any) => i.item),
      instructions: this.recipeForm.value.instructions.map((i: any) => i.step)
    };

    this.recipeService.createRecipe(newRecipe);
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get instructions() {
    return this.recipeForm.get('instructions') as FormArray;
  }
}
