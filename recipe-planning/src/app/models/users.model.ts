// src/app/models/user.model.ts
import { addDoc, collection, doc, Firestore, deleteDoc, getDocs, QuerySnapshot, QueryDocumentSnapshot } from "@angular/fire/firestore";

export class User {

    constructor(
        public firestore: Firestore,
        public email: string,
        public username: string,
        private password: string,
        public id: string = '',
        public following: User[] = [],
        public followers: User[] = [],
    ) { }

    getPassword(): string {
        return this.password;
    }

    getId(): string {
        return this.id;
    }

    getUser(): User {
        return this;
    }

    getUserByEmail(email: string): User | null {
        if (this.email === email) {
            return this;
        }
        return null;
    }

    getUserByUsername(username: string): User | null {
        if (this.username === username) {
            return this;
        }
        return null;
    }

    follow(targetUser: User) {
        if (!this.following.includes(targetUser)) {
            this.following.push(targetUser);
            targetUser.followers.push(this);
        }
    }

    unfollow(targetUser: User) {
        this.following = this.following.filter(u => u !== targetUser);
        targetUser.followers = targetUser.followers.filter(u => u !== this);
    }

    getFollowing(): User[] {
        return this.following;
    }

    getFollowers(): User[] {
        return this.followers;
    }

    async save() {
        const usersRef = collection(this.firestore, 'users');
        const docRef = await addDoc(usersRef, {
            email: this.email,
            username: this.username,
            password: this.password
        });
        this.id = docRef.id;
        return this;
    }
}
