import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Recipe } from '../models/recipe.model';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
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

  addRecipe(recipe: Recipe) {
    const recipeCollection = collection(this.firestore, 'recipes');
    addDoc(recipeCollection, {
      recipe_name: recipe.recipe_name,
      author: recipe.author,
      nutrition_facts: recipe.nutrition_facts,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      type: recipe.type,
      time: recipe.time,
      cuisine: recipe.cuisine,
      imagePath: recipe.imagePath,
    });
  }

  async saveRecipe(recipe: Recipe) {
    const recipeId = uuidv4(); // generate unique ID like you're doing for users
    const recipeRef = doc(this.firestore, `recipes/${recipeId}`);
    await setDoc(recipeRef, {
      recipe_name: recipe.recipe_name,
      nutrition_facts: recipe.nutrition_facts,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      type: recipe.type,
      author: recipe.author,
    });
    console.log('Recipe saved with ID:', recipeId);
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
          recipeId,
          data['recipe_name'],
          data['imagePath'],
          data['ingredients'],
          data['instructions'],
          data['type'],
          data['authorId'],
          data['author'],
          data['nutrition_facts'],
          data['time'],
          data['cuisine'],
          data['cooking_time']
        );
      })
    );
  }
  async addReview(recipeId: string, review: { userId: string; userName: string; rating: number; review: string }) {
    const reviewsCollection = collection(this.firestore, `recipes/${recipeId}/reviews`);
    await addDoc(reviewsCollection, {
      ...review,
      createdAt: new Date()
    });
  }
  
  // Get all reviews for a specific recipe
  getReviews(recipeId: string): Observable<any[]> {
    const reviewsCollection = collection(this.firestore, `recipes/${recipeId}/reviews`);
    return collectionData(reviewsCollection, { idField: 'id' }) as Observable<any[]>;
  }

  async addRating(recipeId: string, userId: string, rating: number) {
    const recipeRef = doc(this.firestore, 'recipes', recipeId);
    const recipeDoc = await getDoc(recipeRef);
    
    if (!recipeDoc.exists()) {
      throw new Error('Recipe not found');
    }

    const recipeData = recipeDoc.data();
    const ratings = recipeData['ratings'] || [];
    
    // Remove existing rating if user has already rated
    const existingRatingIndex = ratings.findIndex((r: { userId: string; rating: number }) => r.userId === userId);
    if (existingRatingIndex !== -1) {
      ratings[existingRatingIndex] = { userId, rating };
    } else {
      ratings.push({ userId, rating });
    }

    // Calculate new average rating
    const averageRating = ratings.reduce((acc: number, curr: { userId: string; rating: number }) => acc + curr.rating, 0) / ratings.length;

    // Update the recipe with new ratings and average
    await updateDoc(recipeRef, {
      ratings,
      rate: averageRating
    });
  }

  async getUserRating(recipeId: string, userId: string): Promise<number> {
    const recipeRef = doc(this.firestore, 'recipes', recipeId);
    const recipeDoc = await getDoc(recipeRef);
    
    if (!recipeDoc.exists()) {
      return 0;
    }

    const recipeData = recipeDoc.data();
    const ratings = recipeData['ratings'] || [];
    const userRating = ratings.find((r: { userId: string; rating: number }) => r.userId === userId);
    
    return userRating ? userRating.rating : 0;
  }
}
