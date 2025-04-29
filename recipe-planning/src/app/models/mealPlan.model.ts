import { Firestore } from '@angular/fire/firestore';
import { Recipe } from './recipe.model';

export class MealPlan {
    public id: string = '';
    public mealPlan: (Recipe | null)[][] = Array(7).fill(null).map(() => Array(3).fill(null));
}
