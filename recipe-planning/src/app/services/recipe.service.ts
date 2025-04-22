import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  getDocs,
} from '@angular/fire/firestore';
import { Recipe } from '../models/recipe.model';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  public recipes = new BehaviorSubject<Recipe[]>([]);
  constructor(private firestore: Firestore) {}

  getRecipes(): Observable<Recipe[]> {
    const recipesCollection = collection(this.firestore, 'recipes');
    const recipes = collectionData(recipesCollection);
    return recipes as Observable<Recipe[]>;
  }
  
  addRecipe(recipe: Recipe) {
    const recipesCollection = collection(this.firestore, 'recipes');
    return addDoc(recipesCollection, {
      author: recipe.author,
      imagePath: recipe.imagePath,
      nutrition_facts: recipe.nutrition_facts,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      name:recipe.recipe_name,
      type:recipe.type,
    });
  }


  

}
