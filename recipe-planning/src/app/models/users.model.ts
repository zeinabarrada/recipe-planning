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

    getPassword(): string {
        return this.password;
    }

    follow(user: User) {
        this.following.push(user);
        user.followers.push(this);
        const followingRef = collection(this.firestore, 'users', this.id, 'following');
        addDoc(followingRef, {
            userId: user.getId()
        });
    }

    unfollow(user: User) {
        this.following = this.following.filter(u => u !== user);
        user.followers = user.followers.filter(u => u !== this);
        const followingRef = collection(this.firestore, 'users', this.id, 'following');
        const followingDoc = doc(followingRef, user.getId());
        deleteDoc(followingDoc);
    }

    getFollowing(): User[] {
        const followingRef = collection(this.firestore, 'users', this.id, 'following');
        getDocs(followingRef).then((querySnapshot: QuerySnapshot) => {
            this.following = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
                const data = doc.data();
                return new User(this.firestore, data['email'], data['username'], data['password'], data['id']);
            });
        });
        return this.following;
    }

    getFollowers(): User[] {
        const followersRef = collection(this.firestore, 'users', this.id, 'followers');
        getDocs(followersRef).then((querySnapshot: QuerySnapshot) => {
            this.followers = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
                const data = doc.data();
                return new User(this.firestore, data['email'], data['username'], data['password'], data['id']);
            });
        });
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
