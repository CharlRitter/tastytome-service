import { recipe, recipeingredient, recipetimer } from '@prisma/client';

export type Error = { message: string };

export type Recipe = recipe & {
  recipecategories: number[];
  recipeingredients: recipeingredient[];
  recipeinstructions: string[];
  recipetimers: recipetimer[];
};

export type ScrapedRecipe = {
  host: string;
  title: string;
  total_time: number;
  image: string;
  ingredients: string[];
  ingredient_groups: {
    ingredients: string[];
    purpose: string;
  }[];
  instructions: string;
  instructions_list: string[];
  yields: string;
  nutrients?: {
    calories: string;
    carbohydrateContent: string;
    cholesterolContent: string;
    fiberContent: string;
    proteinContent: string;
    saturatedFatContent: string;
    sodiumContent: string;
    sugarContent: string;
    fatContent: string;
    unsaturatedFatContent: string;
  };
};
