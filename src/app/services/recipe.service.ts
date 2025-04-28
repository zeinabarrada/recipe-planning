return new Recipe(
  recipeId,
  data["recipe_name"],
  data["imagePath"],
  data["ingredients"],
  data["instructions"],
  data["type"],
  data["authorId"],
  data["author"],
  data["nutrition_facts"],
  data["time"],
  data["cuisine"],
  data["cooking_time"]
);
