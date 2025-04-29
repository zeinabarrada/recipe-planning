import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ShoppingList, ShoppingListItem } from '../models/shopping-list.model';

@Component({
  selector: 'app-shopping-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Shopping List</h2>
    <mat-dialog-content>
      <div class="shopping-list-content">
        <div *ngFor="let category of categories" class="category-section">
          <h3 class="category-title">{{ category }}</h3>
          <mat-list>
            <mat-list-item *ngFor="let item of getItemsByCategory(category)" class="shopping-item">
              <div class="item-content">
                <mat-checkbox 
                  [(ngModel)]="checkedItems[item.ingredient]"
                  color="primary"
                  class="item-checkbox">
                  <span [class.checked]="checkedItems[item.ingredient]">
                    {{ item.quantity }} {{ item.unit }} {{ item.ingredient }}
                  </span>
                </mat-checkbox>
              </div>
            </mat-list-item>
          </mat-list>
          <mat-divider *ngIf="!isLastCategory(category)"></mat-divider>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="warn" (click)="clearCheckedItems()">Clear Checked</button>
      <button mat-button color="primary" (click)="saveAndClose()">Save</button>
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .shopping-list-content {
      max-height: 60vh;
      overflow-y: auto;
      padding: 0 16px;
    }

    .category-section {
      margin-bottom: 24px;
    }

    .category-title {
      margin: 16px 0 8px 0;
      color: #666;
      font-size: 1.2em;
      font-weight: 500;
    }

    .shopping-item {
      min-height: 48px !important;
    }

    .item-content {
      width: 100%;
      display: flex;
      align-items: center;
    }

    .item-checkbox {
      margin: 8px 0;
      width: 100%;
    }

    .checked {
      text-decoration: line-through;
      color: #666;
    }

    mat-dialog-actions {
      padding: 16px !important;
      gap: 8px;
    }
  `]
})
export class ShoppingListDialogComponent {
  categories: string[] = [];
  checkedItems: { [key: string]: boolean } = {};

  constructor(
    public dialogRef: MatDialogRef<ShoppingListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { shoppingList: ShoppingList }
  ) {
    this.initializeList();
  }

  private initializeList() {
    if (this.data.shoppingList) {
      this.categories = Array.from(
        new Set(this.data.shoppingList.items.map(item => item.category))
      ).sort((a, b) => a.localeCompare(b));

      this.data.shoppingList.items.forEach(item => {
        this.checkedItems[item.ingredient] = false;
      });
    }
  }

  getItemsByCategory(category: string): ShoppingListItem[] {
    return this.data.shoppingList.items
      .filter(item => item.category === category)
      .sort((a, b) => a.ingredient.localeCompare(b.ingredient));
  }

  isLastCategory(category: string): boolean {
    return this.categories.indexOf(category) === this.categories.length - 1;
  }

  clearCheckedItems() {
    Object.keys(this.checkedItems).forEach(key => {
      if (this.checkedItems[key]) {
        delete this.checkedItems[key];
      }
    });
  }

  saveAndClose() {
    this.dialogRef.close(this.checkedItems);
  }

  close() {
    this.dialogRef.close();
  }
} 