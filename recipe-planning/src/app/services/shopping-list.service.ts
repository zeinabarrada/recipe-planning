import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from '@angular/fire/firestore';
import { ShoppingList, IngredientItem, INGREDIENT_CATEGORIES } from '../models/shopping-list.model';
import { Recipe } from '../models/recipe.model';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  constructor(private firestore: Firestore) {}

  async createShoppingList(userId: string, recipes: Recipe[]): Promise<string> {
    const ingredients = this.organizeIngredients(recipes);
    const shoppingList: ShoppingList = {
      userId,
      dateCreated: new Date(),
      ingredients,
      recipeIds: recipes.map(recipe => recipe.id)
    };

    const docRef = await addDoc(collection(this.firestore, 'shopping-lists'), shoppingList);
    return docRef.id;
  }

  private organizeIngredients(recipes: Recipe[]): IngredientItem[] {
    const ingredientMap = new Map<string, IngredientItem>();

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const normalizedName = ingredient.toLowerCase().trim();
        const existingItem = ingredientMap.get(normalizedName);

        if (existingItem) {
          existingItem.recipes.push(recipe.recipe_name);
        } else {
          ingredientMap.set(normalizedName, {
            name: ingredient,
            category: this.categorizeIngredient(ingredient),
            recipes: [recipe.recipe_name]
          });
        }
      });
    });

    // Sort ingredients by category and name
    return Array.from(ingredientMap.values()).sort((a, b) => {
      if (a.category === b.category) {
        return a.name.localeCompare(b.name);
      }
      return INGREDIENT_CATEGORIES.indexOf(a.category) - INGREDIENT_CATEGORIES.indexOf(b.category);
    });
  }

  private categorizeIngredient(ingredient: string): string {
    const lowerIngredient = ingredient.toLowerCase();
    
    // Define category patterns
    const categoryPatterns = {
      'Produce': /(fresh|vegetable|fruit|lettuce|tomato|onion|potato|carrot|pepper|garlic|herb)/,
      'Meat & Seafood': /(chicken|beef|pork|fish|shrimp|salmon|meat|turkey)/,
      'Dairy & Eggs': /(milk|cheese|cream|yogurt|butter|egg)/,
      'Pantry': /(flour|sugar|rice|pasta|oil|vinegar|sauce|can|bean|stock|broth)/,
      'Spices & Seasonings': /(salt|pepper|spice|seasoning|powder|oregano|basil|thyme)/,
      'Baking': /(baking|powder|soda|yeast|vanilla|chocolate)/,
      'Frozen': /(frozen|ice)/
    };

    // Check each category pattern
    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(lowerIngredient)) {
        return category;
      }
    }

    return 'Other';
  }

  async getShoppingList(listId: string): Promise<ShoppingList | null> {
    const docRef = doc(this.firestore, 'shopping-lists', listId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as ShoppingList : null;
  }

  async getUserShoppingLists(userId: string): Promise<ShoppingList[]> {
    const q = query(
      collection(this.firestore, 'shopping-lists'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as ShoppingList);
  }
} 