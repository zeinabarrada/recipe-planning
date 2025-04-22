import { Injectable } from '@angular/core';
import {
    Firestore,
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    deleteDoc,
    updateDoc,
} from '@angular/fire/firestore';
import { User } from '../models/users.model';
import { Recipe } from '../models/recipe.model';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(private firestore: Firestore) { }

    async saveUser(user: User) {
        const usersRef = collection(this.firestore, 'users');
        const docRef = await addDoc(usersRef, {
            email: user.email,
            username: user.username,
            password: user.getPassword(),
            following: user.getFollowing(),
            followers: user.getFollowers()
        });
        user.id = docRef.id;
        return user;
    }

    async followUser(currentUser: User, targetUser: User) {
        if (!currentUser.id || !targetUser.id) return;

        const followingRef = collection(this.firestore, 'users', currentUser.id, 'following');
        await addDoc(followingRef, { userId: targetUser.id });
        currentUser.follow(targetUser.id);

        const userRef = doc(this.firestore, 'users', currentUser.id);
        await updateDoc(userRef, {
            following: currentUser.getFollowing()
        });
    }

    async unfollowUser(currentUser: User, targetUser: User) {
        if (!currentUser.id || !targetUser.id) return;

        const followingRef = collection(this.firestore, 'users', currentUser.id, 'following');
        const followingDoc = doc(followingRef, targetUser.id);
        await deleteDoc(followingDoc);
        currentUser.unfollow(targetUser.id);

        const userRef = doc(this.firestore, 'users', currentUser.id);
        await updateDoc(userRef, {
            following: currentUser.getFollowing()
        });
    }

    async getFollowing(user: User): Promise<string[]> {
        const followingRef = collection(this.firestore, 'users', user.id, 'following');
        const snapshot = await getDocs(followingRef);
        return snapshot.docs.map(doc => doc.data()['userId']);
    }

    async getFollowers(user: User): Promise<string[]> {
        const followersRef = collection(this.firestore, 'users', user.id, 'followers');
        const snapshot = await getDocs(followersRef);
        return snapshot.docs.map(doc => doc.data()['userId']);
    }

    async getUserById(id: string): Promise<User> {
        if (!id) throw new Error('User ID is required');

        const userRef = doc(this.firestore, 'users', id);
        const snapshot = await getDoc(userRef);
        const data = snapshot.data();
        if (!data) throw new Error('User not found');
        return this.createUser(
            data['email'],
            data['username'],
            data['password'],
            data['id'],
            data['following'] || [],
            data['followers'] || []
        );
    }

    async loadFollowing(user: User): Promise<void> {
        if (!user.id) return;

        const userRef = doc(this.firestore, 'users', user.id);
        const snapshot = await getDoc(userRef);
        const data = snapshot.data();
        if (data && data['following']) {
            user.following = data['following'];
        }
    }

    createUser(email: string, username: string, password: string, id: string = '', following: string[] = [], followers: string[] = []): User {
        return new User(this.firestore, email, username, password, id, following, followers);
    }
    async saveRecipe(user: User, recipe: Recipe) {
        const recipesRef = collection(
            this.firestore,
            'users',
            user.id,
            'savedRecipes'
        );
        await addDoc(recipesRef, { recipeId: recipe.id });
        user.savedRecipes.push(recipe);
    }
} 
