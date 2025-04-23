import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  getDocs,
  getDoc,
  doc,
} from '@angular/fire/firestore';
import { Recipe } from '../models/recipe.model';
import { BehaviorSubject, from, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  public recipes = new BehaviorSubject<Recipe[]>([]);
  constructor(private firestore: Firestore) {}

  getRecipes(): Observable<Recipe[]> {
    const recipesCollection = collection(this.firestore, 'recipes');
    const recipes = collectionData(recipesCollection, { idField: 'id' }); // Include the document ID as 'id'
    return recipes as Observable<Recipe[]>; // This will return recipes with their 'id' field
  }

  getRecipeById(recipeId: string): Observable<Recipe> {
    const recipeRef = doc(this.firestore, 'recipes', recipeId);
    return from(
      getDoc(recipeRef).then((snapshot) => {
        const data = snapshot.data();
        if (!data) {
          throw new Error(`No recipe found with ID: ${recipeId}`);
        }
        return new Recipe(
          data['recipe_name'],
          data['author'],
          data['nutrition_facts'],
          data['ingredients'],
          data['instructions'],
          data['type'],
          recipeId
        );
      })
    );
  }
}
