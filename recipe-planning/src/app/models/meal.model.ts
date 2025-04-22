export class Meal {
  constructor(
    public id: string,
    public type: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    public name: string
  ) {}
}
