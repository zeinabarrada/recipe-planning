import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, deleteDoc } from '@angular/fire/firestore';
import { User } from '../models/users.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private firestore: Firestore) { }

    async saveUser(user: User) {
        const usersRef = collection(this.firestore, 'users');
        const docRef = await addDoc(usersRef, {
            email: user.email,
            username: user.username,
            password: user.getPassword()
        });
        user.id = docRef.id;
        return user;
    }

    async followUser(currentUser: User, targetUser: User) {
        const followingRef = collection(this.firestore, 'users', currentUser.id, 'following');
        await addDoc(followingRef, { userId: targetUser.id });
        currentUser.follow(targetUser);
    }

    async unfollowUser(currentUser: User, targetUser: User) {
        const followingRef = collection(this.firestore, 'users', currentUser.id, 'following');
        const followingDoc = doc(followingRef, targetUser.id);
        await deleteDoc(followingDoc);
        currentUser.unfollow(targetUser);
    }

    async getFollowing(user: User): Promise<User[]> {
        const followingRef = collection(this.firestore, 'users', user.id, 'following');
        const snapshot = await getDocs(followingRef);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return new User(this.firestore, data['email'], data['username'], data['password'], data['id']);
        });
    }

    async getFollowers(user: User): Promise<User[]> {
        const followersRef = collection(this.firestore, 'users', user.id, 'followers');
        const snapshot = await getDocs(followersRef);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return new User(this.firestore, data['email'], data['username'], data['password'], data['id']);
        });
    }

    async getUserById(id: string): Promise<User> {
        const userRef = doc(collection(this.firestore, 'users'), id);
        const snapshot = await getDoc(userRef);
        const data = snapshot.data();
        if (!data) throw new Error('User not found');
        return new User(this.firestore, data['email'], data['username'], data['password'], data['id']);
    }
} 
