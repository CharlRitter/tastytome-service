import { Router } from 'express';
import { authenticateMember } from '@/middleware/authenticationMiddleware';
import { getRecipe, getRecipes, createRecipe, updateRecipe, deleteRecipe } from '@/controllers/recipeController';

const router = Router();

router.get('/v1/recipe', authenticateMember, getRecipes);
router.get('/v1/recipe/:recipeId', authenticateMember, getRecipe);
router.post('/v1/recipe', authenticateMember, createRecipe);
router.put('/v1/recipe/:recipeId', authenticateMember, updateRecipe);
router.delete('/v1/recipe/:recipeId', authenticateMember, deleteRecipe);

export default router;
