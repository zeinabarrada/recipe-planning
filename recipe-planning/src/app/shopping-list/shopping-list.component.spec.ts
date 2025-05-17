import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoppingListComponent } from './shopping-list.component';
import { ShoppingListService } from '../services/shopping-list.service';
import { AuthenticationService } from '../services/authentication.service';
import { of } from 'rxjs';
import { ShoppingList } from '../models/shopping-list.model';
import { User } from '../models/users.model';
import { Firestore } from '@angular/fire/firestore';

class MockUser extends User {
  constructor() {
    const mockFirestore = {} as Firestore;
    super(
      mockFirestore,
      'test@test.com',
      'testuser',
      'password123',
      'user1',
      [],
      [],
      [],
      '',
      ''
    );
  }
}

describe('ShoppingListComponent', () => {
  let component: ShoppingListComponent;
  let fixture: ComponentFixture<ShoppingListComponent>;
  let shoppingListServiceSpy: jasmine.SpyObj<ShoppingListService>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;

  const mockShoppingList: ShoppingList = {
    id: '1',
    userId: 'user1',
    recipeIds: [],
    items: [
      {
        ingredient: 'Apple',
        quantity: 2,
        unit: 'pieces',
        category: 'Fruits'
      }
    ],
    createdAt: new Date()
  };

  beforeEach(async () => {
    const slSpy = jasmine.createSpyObj('ShoppingListService', ['getUserShoppingLists', 'deleteShoppingList']);
    const authSpy = jasmine.createSpyObj('AuthenticationService', ['getUser']);

    await TestBed.configureTestingModule({
      imports: [ShoppingListComponent],
      providers: [
        { provide: ShoppingListService, useValue: slSpy },
        { provide: AuthenticationService, useValue: authSpy }
      ]
    }).compileComponents();

    shoppingListServiceSpy = TestBed.inject(ShoppingListService) as jasmine.SpyObj<ShoppingListService>;
    authServiceSpy = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;

    shoppingListServiceSpy.getUserShoppingLists.and.returnValue(Promise.resolve([mockShoppingList]));
    authServiceSpy.getUser.and.returnValue(of(new MockUser()));

    fixture = TestBed.createComponent(ShoppingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load shopping lists on init', () => {
    expect(shoppingListServiceSpy.getUserShoppingLists).toHaveBeenCalledWith('user1');
  });

  it('should delete shopping list when confirmed', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    await component.deleteList('1');
    expect(shoppingListServiceSpy.deleteShoppingList).toHaveBeenCalledWith('1');
  });

  it('should not delete shopping list when not confirmed', async () => {
    spyOn(window, 'confirm').and.returnValue(false);
    await component.deleteList('1');
    expect(shoppingListServiceSpy.deleteShoppingList).not.toHaveBeenCalled();
  });
}); 