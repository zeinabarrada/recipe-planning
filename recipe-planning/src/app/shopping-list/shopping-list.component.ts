import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ShoppingListService } from '../services/shopping-list.service';
import { AuthenticationService } from '../services/authentication.service';
import { ShoppingList } from '../models/shopping-list.model';
import { User } from '../models/users.model';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit {
  shoppingLists$: Observable<ShoppingList[]>;
  expandedLists: Set<string> = new Set();

  constructor(
    private shoppingListService: ShoppingListService,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.shoppingLists$ = this.authService.getUser().pipe(
      switchMap((user: User | null) => {
        if (user) {
          return this.shoppingListService.getUserShoppingLists(user.id);
        }
        return of([]);
      })
    );
  }

  ngOnInit(): void {}

  toggleList(id: string | undefined): void {
    if (!id) return;
    if (this.expandedLists.has(id)) {
      this.expandedLists.delete(id);
    } else {
      this.expandedLists.add(id);
    }
  }

  isListExpanded(id: string | undefined): boolean {
    return id ? this.expandedLists.has(id) : false;
  }

  viewList(id: string | undefined): void {
    if (!id) return;
    // Navigate to the list details in the same tab
    this.router.navigate(['/shopping-list', id]);
  }

  async deleteList(id: string | undefined): Promise<void> {
    if (!id) return;
    if (confirm('Are you sure you want to delete this shopping list?')) {
      await this.shoppingListService.deleteShoppingList(id);
      this.expandedLists.delete(id);
      // Refresh the lists
      this.shoppingLists$ = this.authService.getUser().pipe(
        switchMap((user: User | null) => {
          if (user) {
            return this.shoppingListService.getUserShoppingLists(user.id);
          }
          return of([]);
        })
      );
    }
  }

  getIngredientDisplay(ingredient: any): string {
    if (Array.isArray(ingredient)) {
      return ingredient.join('');
    }
    if (typeof ingredient === 'object' && ingredient !== null) {
      return JSON.stringify(ingredient);
    }
    return ingredient ? String(ingredient) : '';
  }

  getUnitDisplay(unit: any): string {
    if (Array.isArray(unit)) {
      return unit.join('');
    }
    if (typeof unit === 'object' && unit !== null) {
      return JSON.stringify(unit);
    }
    return unit ? String(unit) : '';
  }
} 