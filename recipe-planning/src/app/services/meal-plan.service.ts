import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, doc, setDoc } from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Recipe } from '../models/recipe.model';

type MealType = 'breakfast' | 'lunch' | 'dinner';
type DayMeals = {
    [key in MealType]?: Recipe;
};
type MealPlan = {
    [day: string]: DayMeals;
};

interface MealPlanDocument {
    id: string;
    userId: string;
    mealPlan: MealPlan;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class MealPlanService {
    constructor(private firestore: Firestore) { }

    async saveMealPlan(userId: string, mealPlan: MealPlan) {
        const mealPlanId = uuidv4();
        const mealPlanRef = doc(this.firestore, `mealPlans/${mealPlanId}`);

        await setDoc(mealPlanRef, {
            userId,
            mealPlan,
        });

        return mealPlanId;
    }

    async getMealPlan(userId: string): Promise<MealPlanDocument | null> {
        const mealPlansCollection = collection(this.firestore, 'mealPlans');
        const q = query(mealPlansCollection, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            } as MealPlanDocument;
        }
        return null;
    }
} 
