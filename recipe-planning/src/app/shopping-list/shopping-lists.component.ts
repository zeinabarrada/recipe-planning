import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ShoppingListService } from '../services/shopping-list.service';
import { AuthenticationService } from '../services/authentication.service';
import { ShoppingList } from '../models/shopping-list.model';
import { ShoppingListDialogComponent } from './shopping-list-dialog.component';

@Component({
  selector: 'app-shopping-lists',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="shopping-lists-container">
      <h2>My Shopping Lists</h2>

      <div class="lists-grid" *ngIf="shoppingLists.length > 0">
        <mat-card *ngFor="let list of shoppingLists" class="list-card">
          <mat-card-header>
            <mat-card-title>Shopping List</mat-card-title>
            <mat-card-subtitle>Created on {{ list.createdAt | date:'medium' }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p>{{ list.items.length }} items</p>
            <p>{{ getUniqueCategories(list) }} categories</p>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button color="primary" (click)="openList(list)">
              <mat-icon>visibility</mat-icon>
              View List
            </button>
            <button mat-button color="warn" (click)="deleteList(list.id)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="shoppingLists.length === 0">
        <p>You haven't created any shopping lists yet.</p>
        <p>Create a meal plan to generate a shopping list!</p>
      </div>
    </div>
  `,
  styles: [`
    .shopping-lists-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 0 20px;
    }

    h2 {
      margin-bottom: 24px;
      color: #333;
    }

    .lists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .list-card {
      height: 100%;
      display: flex;
      flex-direction: column;

      mat-card-content {
        flex-grow: 1;
        padding: 16px;
      }

      mat-card-actions {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
      
      p {
        margin: 8px 0;
      }
    }

    button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class ShoppingListsComponent implements OnInit {
  shoppingLists: ShoppingList[] = [];

  constructor(
    private shoppingListService: ShoppingListService,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getUser().subscribe(user => {
      if (user) {
        this.loadShoppingLists(user.id);
      }
    });
  }

  private async loadShoppingLists(userId: string) {
    try {
      this.shoppingLists = await this.shoppingListService.getUserShoppingLists(userId);
      // Sort by creation date, newest first
      this.shoppingLists.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    }
  }

  getUniqueCategories(list: ShoppingList): number {
    return new Set(list.items.map(item => item.category)).size;
  }

  openList(list: ShoppingList) {
    const dialogRef = this.dialog.open(ShoppingListDialogComponent, {
      width: '600px',
      data: { shoppingList: list }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Shopping list updated:', result);
      }
    });
  }

  async deleteList(listId?: string) {
    if (!listId) return;
    
    if (confirm('Are you sure you want to delete this shopping list?')) {
      try {
        await this.shoppingListService.deleteShoppingList(listId);
        this.shoppingLists = this.shoppingLists.filter(list => list.id !== listId);
      } catch (error) {
        console.error('Error deleting shopping list:', error);
      }
    }
  }
} 