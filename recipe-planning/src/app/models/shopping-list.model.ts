export interface ShoppingListItem {
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
}

export interface ShoppingList {
  id?: string;
  userId: string;
  items: ShoppingListItem[];
  createdAt: Date;
  recipeIds: string[];
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