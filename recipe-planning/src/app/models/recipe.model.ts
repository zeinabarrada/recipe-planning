export class Recipe {
  constructor(
    public id: string,
    public name: string,
    public imagePath: string,
    public ingredients: [],
    public instructions: [],
    public type: string,
    public author: string,
    public nutrition: string
  ) {}
}
