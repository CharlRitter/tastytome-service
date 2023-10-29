import { Router } from 'express';

import {
  getCategories,
  getMeasurementSystems,
  getMeasurementTypes,
  getMeasurementUnits,
  getThemes
} from '@/controllers/enumController';

export const enumRoutes = Router();

enumRoutes.get('/v1/enum/categories', getCategories);
enumRoutes.get('/v1/enum/measurement-systems', getMeasurementSystems);
enumRoutes.get('/v1/enum/measurement-types', getMeasurementTypes);
enumRoutes.get('/v1/enum/measurement-units', getMeasurementUnits);
enumRoutes.get('/v1/enum/themes', getThemes);
