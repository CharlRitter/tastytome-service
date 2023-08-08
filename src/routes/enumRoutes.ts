import { Router } from 'express';
import {
  getCategories,
  getMeasurementSystems,
  getMeasurementTypes,
  getMeasurementUnits,
  getThemes
} from '@/controllers/enumController';

const router = Router();

router.get('/v1/categories', getCategories);
router.get('/v1/measurement-systems', getMeasurementSystems);
router.get('/v1/measurement-types', getMeasurementTypes);
router.get('/v1/measurement-units', getMeasurementUnits);
router.get('/v1/themes', getThemes);

export default router;
