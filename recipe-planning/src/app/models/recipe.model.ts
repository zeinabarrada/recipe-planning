export class Recipe {
  constructor(
    public id: string = '',
    public recipe_name: string = '',
    public imagePath: string = '',
    public ingredients: string[] = [],
    public instructions: string[] = [],
    public type: string = '',
    public authorId: string = '',
    public author: string = '',
    public nutrition_facts: string = '',
    public time: number = 0,
    public cuisine: string = '',
    public cooking_time: string = '',
    public ratings: { userId: string; rating: number }[] = [],
    public likes: number = 0,
    public likedBy: string[] = []
  ) {}
}
