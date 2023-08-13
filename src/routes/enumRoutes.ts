import { Router } from 'express';
import {
  getCategories,
  getMeasurementSystems,
  getMeasurementTypes,
  getMeasurementUnits,
  getThemes
} from '@/controllers/enumController';

const router = Router();

router.get('/v1/enum/categories', getCategories);
router.get('/v1/enum/measurement-systems', getMeasurementSystems);
router.get('/v1/enum/measurement-types', getMeasurementTypes);
router.get('/v1/enum/measurement-units', getMeasurementUnits);
router.get('/v1/enum/themes', getThemes);

export default router;
