import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ShoppingListService } from '../services/shopping-list.service';
import { ShoppingList, ShoppingListItem } from '../models/shopping-list.model';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {
  shoppingList: ShoppingList | null = null;
  categories: string[] = [];
  checkedItems: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private shoppingListService: ShoppingListService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const listId = params['id'];
      if (listId) {
        this.loadShoppingList(listId);
      }
    });
  }

  private async loadShoppingList(listId: string) {
    this.shoppingList = await this.shoppingListService.getShoppingList(listId);
    if (this.shoppingList) {
      this.categories = Array.from(new Set(this.shoppingList.items.map(item => item.category)))
        .sort((a, b) => a.localeCompare(b));
      
      // Initialize all items as unchecked
      this.shoppingList.items.forEach(item => {
        this.checkedItems[item.ingredient] = false;
      });
    }
  }

  getItemsByCategory(category: string): ShoppingListItem[] {
    return this.shoppingList?.items.filter(item => item.category === category)
      .sort((a, b) => a.ingredient.localeCompare(b.ingredient)) || [];
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

  async saveProgress() {
    if (!this.shoppingList) return;

    try {
      // Here you would typically save the checked items state to your backend
      console.log('Shopping list progress saved:', this.checkedItems);
    } catch (error) {
      console.error('Error saving shopping list progress:', error);
    }
  }
} 