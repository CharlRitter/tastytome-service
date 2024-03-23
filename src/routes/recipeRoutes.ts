import { Router } from 'express';

import { createRecipe, deleteRecipe, getRecipe, getRecipes, updateRecipe } from '@/controllers/recipeController';
import { authenticateMember } from '@/middleware/authenticationMiddleware';
import { scrapeRecipe } from '@/scrapers/recipeScraper';

export const recipeRoutes = Router();

recipeRoutes.get('/v1/recipe', authenticateMember, getRecipes);
recipeRoutes.get('/v1/recipe/:recipeId', authenticateMember, getRecipe);
recipeRoutes.post('/v1/recipe', authenticateMember, createRecipe);
recipeRoutes.put('/v1/recipe/:recipeId', authenticateMember, updateRecipe);
recipeRoutes.delete('/v1/recipe/:recipeId', authenticateMember, deleteRecipe);

recipeRoutes.post('/v1/recipe/scrape', authenticateMember, scrapeRecipe);
