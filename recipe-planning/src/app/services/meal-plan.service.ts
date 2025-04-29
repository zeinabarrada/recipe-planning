import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, doc, setDoc, updateDoc } from '@angular/fire/firestore';
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
        const mealPlanId = uuidv4();
        const mealPlanRef = doc(this.firestore, `mealPlans/${mealPlanId}`);
        const firestoreFormat = this.convertToFirestoreFormat(mealPlan);

        await setDoc(mealPlanRef, {
            userId,
            mealPlan: firestoreFormat,
        });

        // Update user's mealPlanId
        const userRef = doc(this.firestore, `users/${userId}`);
        await updateDoc(userRef, {
            mealPlanId: mealPlanId
        });

        return mealPlanId;
    }

    async getMealPlan(userId: string): Promise<MealPlanDocument | null> {
        const userRef = doc(this.firestore, `users/${userId}`);
        const userDoc = await getDocs(query(collection(this.firestore, 'users'), where('id', '==', userId)));

        if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            const mealPlanId = userData['mealPlanId'];

            if (mealPlanId) {
                const mealPlanRef = doc(this.firestore, `mealPlans/${mealPlanId}`);
                const mealPlanDoc = await getDocs(query(collection(this.firestore, 'mealPlans'), where('id', '==', mealPlanId)));

                if (!mealPlanDoc.empty) {
                    const data = mealPlanDoc.docs[0].data();
                    return {
                        id: mealPlanDoc.docs[0].id,
                        userId: data['userId'],
                        mealPlan: this.convertFromFirestoreFormat(data['mealPlan'])
                    };
                }
            }
        }
        return null;
    }
} 
