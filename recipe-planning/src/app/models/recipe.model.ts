export interface Recipe {
  id?: string;
  recipe_name: string;
  ingredients: string[];
  instructions: string[];
  nutrition_facts: string;
  image_path: string;
  author: string;
  created_at?: Date;
}
