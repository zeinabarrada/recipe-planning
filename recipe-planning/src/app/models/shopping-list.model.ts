export interface IngredientItem {
  name: string;
  quantity?: string;
  category: string;
  recipes: string[]; // names of recipes that need this ingredient
}

export interface ShoppingList {
  id?: string;
  userId: string;
  dateCreated: Date;
  ingredients: IngredientItem[];
  recipeIds: string[]; // IDs of recipes included in this list
}

// Common ingredient categories for organization
export const INGREDIENT_CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry',
  'Spices & Seasonings',
  'Baking',
  'Frozen',
  'Other'
]; 