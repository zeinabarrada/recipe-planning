import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDoc, query, where, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Recipe } from '../models/recipe.model';
import { UserService } from './user.service';


type MealType = 'breakfast' | 'lunch' | 'dinner';
type DayMeals = {
    [key in MealType]?: Recipe;
};
type MealPlan = (Recipe | null)[][];

interface MealPlanDocument {
    id: string;
    userId: string;
    mealPlan: MealPlan;
}

@Injectable({
    providedIn: 'root'
})
export class MealPlanService {
    private readonly daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    private readonly mealTypes = ['breakfast', 'lunch', 'dinner'];

    constructor(
        private firestore: Firestore,
        private userService: UserService
    ) { }

    private convertToFirestoreFormat(mealPlan: MealPlan): { [key: string]: { [key: string]: Recipe | null } } {
        const result: { [key: string]: { [key: string]: Recipe | null } } = {};

        mealPlan.forEach((dayMeals, dayIndex) => {
            result[this.daysOfWeek[dayIndex]] = {};
            dayMeals.forEach((recipe, mealIndex) => {
                result[this.daysOfWeek[dayIndex]][this.mealTypes[mealIndex]] = recipe;
            });
        });

        return result;
    }

    private convertFromFirestoreFormat(firestoreData: { [key: string]: { [key: string]: Recipe | null } }): MealPlan {
        const result: MealPlan = Array(7).fill(null).map(() => Array(3).fill(null));

        this.daysOfWeek.forEach((day, dayIndex) => {
            if (firestoreData[day]) {
                this.mealTypes.forEach((mealType, mealIndex) => {
                    result[dayIndex][mealIndex] = firestoreData[day][mealType] || null;
                });
            }
        });

        return result;
    }

    async saveMealPlan(userId: string, mealPlan: MealPlan) {
        try {
            const userRef = doc(this.firestore, `users/${userId}`);
            const userSnap = await getDoc(userRef);

            let mealPlanId: string;
            const firestoreFormat = this.convertToFirestoreFormat(mealPlan);

            if (userSnap.exists() && userSnap.data()["mealPlanId"]) {
                // User already has a meal plan, update it
                mealPlanId = userSnap.data()["mealPlanId"];
                const mealPlanRef = doc(this.firestore, `mealPlans/${mealPlanId}`);
                await updateDoc(mealPlanRef, {
                    userId,
                    mealPlan: firestoreFormat
                });
                console.log("Meal plan updated for user:", userId);
            } else {
                // No meal plan yet, create a new one
                mealPlanId = uuidv4();
                const mealPlanRef = doc(this.firestore, `mealPlans/${mealPlanId}`);
                await setDoc(mealPlanRef, {
                    userId,
                    mealPlan: firestoreFormat
                });

                // Update user's mealPlanId
                await updateDoc(userRef, {
                    mealPlanId: mealPlanId
                });
                console.log("Meal plan created and linked to user:", userId);
            }

            return mealPlanId;

        } catch (error) {
            console.error("Error saving meal plan:", error);
            throw error;
        }
    }


    async getMealPlan(mealPlanId: string): Promise<MealPlanDocument | null> {
        if (!mealPlanId) return null;

        try {
            console.log("Fetching meal plan with ID:", mealPlanId);
            const docRef = doc(this.firestore, 'mealPlans', mealPlanId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("Meal plan data:", data);

                return {
                    id: docSnap.id,
                    userId: data['userId'],
                    mealPlan: this.convertFromFirestoreFormat(data['mealPlan'])
                };
            } else {
                console.warn("No meal plan found with ID:", mealPlanId);
            }
        } catch (error) {
            console.error("Error fetching meal plan:", error);
        }

        return null;
    }

} 
