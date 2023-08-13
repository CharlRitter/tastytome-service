import { Router } from 'express';
import { authenticateMember } from '@/middleware/authenticationMiddleware';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '@/controllers/recipeController';

const router = Router();

router.get('/v1/recipe', authenticateMember, getRecipes);
// TODO Might not be needed
// router.get('/v1/recipe/:id', authenticateMember, getRecipeById);
router.post('/v1/recipe/:id', authenticateMember, createRecipe);
router.put('/v1/recipe/:id', authenticateMember, updateRecipe);
router.delete('/v1/recipe/:id', authenticateMember, deleteRecipe);

export default router;
