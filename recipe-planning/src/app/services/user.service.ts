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
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: Firestore) {}

  async saveUser(user: User) {
    const usersRef = collection(this.firestore, 'users');
    const docRef = await addDoc(usersRef, {
      email: user.email,
      username: user.username,
      password: user.getPassword(),
      following: user.getFollowing(),
      followers: user.getFollowers(),
      savedRecipes: user.savedRecipes,
      mealPlanId: user.mealPlanId,
    });
    user.id = docRef.id;
    return user;
  }

  async followUser(currentUser: User, targetUser: User) {
    if (
      !currentUser.id ||
      !targetUser.id ||
      currentUser.id.trim() === '' ||
      targetUser.id.trim() === ''
    ) {
      console.error(
        '(followUserFunction)Invalid user IDs for follow operation:',
        {
          currentUserId: currentUser.id,
          targetUserId: targetUser.id,
        }
      );
      return;
    }

    // Add to following collection
    const followingRef = collection(
      this.firestore,
      'users',
      currentUser.id,
      'following'
    );
    await addDoc(followingRef, { userId: targetUser.id });
    console.log('(followUserFunction) Following user:', {
      currentUserId: currentUser.id,
      targetUserId: targetUser.id,
    });

    // Update current user's following list
    currentUser.follow(targetUser.id);
    const userRef = doc(this.firestore, 'users', currentUser.id);
    await updateDoc(userRef, {
      following: currentUser.getFollowing(),
    });

    // Add to target user's followers
    const targetUserRef = doc(this.firestore, 'users', targetUser.id);
    const targetUserData = (await getDoc(targetUserRef)).data();
    if (targetUserData) {
      const followers = targetUserData['followers'] || [];
      if (!followers.includes(currentUser.id)) {
        followers.push(currentUser.id);
        await updateDoc(targetUserRef, {
          followers: followers,
        });
        // Update the target user's followers list in memory
        targetUser.addFollower(currentUser.id);
      }
    }
  }

  async unfollowUser(currentUser: User, targetUser: User) {
    if (
      !currentUser.id ||
      !targetUser.id ||
      currentUser.id.trim() === '' ||
      targetUser.id.trim() === ''
    ) {
      console.error('Invalid user IDs for unfollow operation:', {
        currentUserId: currentUser.id,
        targetUserId: targetUser.id,
      });
      return;
    }

    // Remove from following collection
    const followingRef = collection(
      this.firestore,
      'users',
      currentUser.id,
      'following'
    );
    const followingSnapshot = await getDocs(followingRef);
    const followingDoc = followingSnapshot.docs.find(
      (doc) => doc.data()['userId'] === targetUser.id
    );

    if (followingDoc) {
      await deleteDoc(followingDoc.ref);
    }

    // Update current user's following list
    currentUser.unfollow(targetUser.id);
    const userRef = doc(this.firestore, 'users', currentUser.id);
    await updateDoc(userRef, {
      following: currentUser.getFollowing(),
    });

    // Remove from target user's followers
    const targetUserRef = doc(this.firestore, 'users', targetUser.id);
    const targetUserData = (await getDoc(targetUserRef)).data();
    if (targetUserData) {
      const followers = targetUserData['followers'] || [];
      const updatedFollowers = followers.filter(
        (id: string) => id !== currentUser.id
      );
      await updateDoc(targetUserRef, {
        followers: updatedFollowers,
      });
      // Update the target user's followers list in memory
      targetUser.removeFollower(currentUser.id);
    }
  }

  getFollowing(user: User): Observable<string[]> {
    if (!user.id) return from(Promise.resolve([]));

    const followingRef = collection(
      this.firestore,
      'users',
      user.id,
      'following'
    );
    return from(
      getDocs(followingRef).then((snapshot) =>
        snapshot.docs.map((doc) => doc.data()['userId'])
      )
    );
  }

  getFollowers(user: User): Observable<string[]> {
    if (!user.id) return from(Promise.resolve([]));

    const followersRef = collection(
      this.firestore,
      'users',
      user.id,
      'followers'
    );
    return from(
      getDocs(followersRef).then((snapshot) =>
        snapshot.docs.map((doc) => doc.data()['userId'])
      )
    );
  }

  async getUserByIdInstance(id: string): Promise<User> {
    if (!id) throw new Error('User ID is required');

    const userRef = doc(this.firestore, 'users', id);
    const snapshot = await getDoc(userRef);
    const data = snapshot.data();
    if (!data) throw new Error('User not found');

    return this.createUser(
      data['email'],
      data['username'],
      data['password'],
      id,
      data['following'] || [],
      data['followers'] || [],
      data['savedRecipes'] || [],
      data['mealPlanId'] || ''
    );
  }

  getUserById(id: string): Observable<User> {
    if (!id) return from(Promise.reject(new Error('User ID is required')));

    const userRef = doc(this.firestore, 'users', id);
    return from(
      getDoc(userRef).then((snapshot) => {
        const data = snapshot.data();
        if (!data) throw new Error('User not found');
        return this.createUser(
          data['email'],
          data['username'],
          data['password'],
          data['id'],
          data['following'] || [],
          data['followers'] || [],
          data['savedRecipes'] || [],
          data['mealPlanId'] || ''
        );
      })
    );
  }

  loadFollowing(user: User): Observable<void> {
    if (!user.id) return from(Promise.resolve());

    const userRef = doc(this.firestore, 'users', user.id);
    return from(
      getDoc(userRef).then((snapshot) => {
        const data = snapshot.data();
        if (data && data['following']) {
          user.following = data['following'].filter(
            (id: string) => id && id.trim() !== ''
          );

          if (user.following.length !== data['following'].length) {
            updateDoc(userRef, {
              following: user.following,
            });
          }
        }
      })
    );
  }

  createUser(
    email: string,
    username: string,
    password: string,
    id: string = '',
    following: string[] = [],
    followers: string[] = [],
    savedRecipes: string[] = [],
    mealPlanId: string = '',
    avatar: string = ''
  ): User {
    return new User(
      this.firestore,
      email,
      username,
      password,
      id,
      following,
      followers,
      savedRecipes,
      mealPlanId,
      avatar
    );
  }

  async saveRecipe(user: User, recipe: Recipe) {
    if (!recipe.id) {
      console.error('Invalid recipe ID, cannot save to Firestore.');
      return;
    }

    // Check if recipe is already saved
    const savedRecipesRef = collection(
      this.firestore,
      'users',
      user.id,
      'savedRecipes'
    );
    const snapshot = await getDocs(savedRecipesRef);
    const isAlreadySaved = snapshot.docs.some(
      (doc) => doc.data()['recipeId'] === recipe.id
    );

    if (isAlreadySaved) {
      console.log('Recipe already saved');
      return;
    }

    // Save new recipe
    const docRef = await addDoc(savedRecipesRef, { recipeId: recipe.id });
    console.log('Recipe saved with ID:', docRef.id);
    if (!user.savedRecipes.includes(docRef.id)) {
      user.savedRecipes.push(docRef.id);
    }
  }

  getSavedRecipes(user: User): Observable<Recipe[]> {
    if (!user.id) {
      console.error('Invalid user ID provided to getSavedRecipes');
      return from(Promise.resolve([]));
    }

    const savedRecipesRef = collection(
      this.firestore,
      'users',
      user.id,
      'savedRecipes'
    );
    return from(
      getDocs(savedRecipesRef).then(async (snapshot) => {
        const savedRecipeIds = snapshot.docs.map(
          (doc) => doc.data()['recipeId']
        );

        // Get all recipe documents
        const recipesRef = collection(this.firestore, 'recipes');
        const recipesSnapshot = await getDocs(recipesRef);

        // Filter recipes that are in savedRecipeIds
        return recipesSnapshot.docs
          .filter((doc) => savedRecipeIds.includes(doc.id))
          .map((doc) => {
            const data = doc.data();
            return new Recipe(
              doc.id,
              data['recipe_name'],
              data['imagePath'],
              data['ingredients'],
              data['instructions'],
              data['type'],
              data['authorId'],
              data['author'],
              data['nutrition_facts'],
              data['time'],
              data['cuisine'],
              data['cooking_time']
            );
          });
      })
    );
  }

  async getMealPlanId(userId: string): Promise<string | null> {
    if (!userId) {
      console.error('Invalid user ID provided to getMealPlan');
      return null;
    }

    const userRef = doc(this.firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData || !userData['mealPlanId']) {
      console.log('No meal plan found for user');
      return null;
    }

    return userData['mealPlanId'];
  }
}
