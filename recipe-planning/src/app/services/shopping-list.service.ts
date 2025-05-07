import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, deleteDoc } from '@angular/fire/firestore';
import { ShoppingList, ShoppingListItem, INGREDIENT_CATEGORIES } from '../models/shopping-list.model';
import { Recipe } from '../models/recipe.model';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private readonly ingredientCategories: { [key: string]: string[] } = {
    'Produce': ['apple', 'banana', 'tomato', 'onion', 'garlic', 'lettuce', 'carrot', 'potato', 'herbs'],
    'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'lamb', 'turkey'],
    'Dairy & Eggs': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg'],
    'Pantry': ['flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'pasta', 'rice'],
    'Spices & Seasonings': ['cinnamon', 'cumin', 'paprika', 'oregano', 'basil'],
    'Canned & Jarred': ['tomato sauce', 'beans', 'corn', 'broth'],
    'Other': []
  };

  constructor(private firestore: Firestore) {}

  private categorizeIngredient(ingredient: string): string {
    ingredient = ingredient.toLowerCase();
    for (const [category, items] of Object.entries(this.ingredientCategories)) {
      if (items.some(item => ingredient.includes(item))) {
        return category;
      }
    }
    return 'Other';
  }

  private parseIngredient(ingredientString: string): ShoppingListItem {
    // Basic parsing of ingredient strings like "2 cups flour" or "1 lb chicken"
    const regex = /^(\d*\.?\d*)\s*([a-zA-Z]*)\s*(.+)$/;
    const match = ingredientString.match(regex);

    if (match) {
      const [, quantity, unit, ingredient] = match;
      return {
        ingredient: ingredient.trim(),
        quantity: parseFloat(quantity) || 1,
        unit: unit.trim() || 'unit',
        category: this.categorizeIngredient(ingredient)
      };
    }

    return {
      ingredient: ingredientString,
      quantity: 1,
      unit: 'unit',
      category: this.categorizeIngredient(ingredientString)
    };
  }

  private aggregateIngredients(recipes: Recipe[]): ShoppingListItem[] {
    const ingredientMap = new Map<string, ShoppingListItem>();

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredientString => {
        const parsedIngredient = this.parseIngredient(ingredientString);
        const key = `${parsedIngredient.ingredient}-${parsedIngredient.unit}`;

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.quantity += parsedIngredient.quantity;
        } else {
          ingredientMap.set(key, parsedIngredient);
        }
      });
    });

    return Array.from(ingredientMap.values())
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  async createShoppingList(userId: string, recipes: Recipe[]): Promise<string> {
    const items = this.aggregateIngredients(recipes);
    
    const shoppingList: ShoppingList = {
      userId,
      items,
      createdAt: new Date(),
      recipeIds: recipes.map(recipe => recipe.id)
    };

    const docRef = await addDoc(collection(this.firestore, 'shopping-lists'), shoppingList);
    return docRef.id;
  }

  async getShoppingList(listId: string): Promise<ShoppingList | null> {
    const docRef = doc(this.firestore, 'shopping-lists', listId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ShoppingList;
    }
    return null;
  }

  async getUserShoppingLists(userId: string): Promise<ShoppingList[]> {
    const q = query(
      collection(this.firestore, 'shopping-lists'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as ShoppingList);
  }

  async deleteShoppingList(listId: string): Promise<void> {
    const docRef = doc(this.firestore, 'shopping-lists', listId);
    await deleteDoc(docRef);
  }
} 