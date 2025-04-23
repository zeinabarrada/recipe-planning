export class Recipe {
  constructor(
    public id: string = '',
    public recipe_name: string,
   // public imagePath: string,
    public ingredients: string[],
    public instructions: string[],
    public type: string,
    public author: string,
    public nutrition_facts: string,
    public time: number,
    public cuisine: string,

    
  ) {}
}
