import { Firestore } from '@angular/fire/firestore';

export class Meal {
    constructor(
        public firestore: Firestore,
        public id: string = '',
        public userID: string,
        public mealPlans: string[] = []
    ) { }
}
