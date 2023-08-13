import { Request, Response } from 'express';
import { category, measurementsystem, measurementtype, measurementunit, theme } from '@prisma/client';
import prisma from '@/utils/client';

export async function getCategories(_: Request, response: Response): Promise<Response<category[]>> {
  try {
    const query: category[] = await prisma.category.findMany();

    return response.status(200).json(query);
  } catch (error) {
    return response.status(500).json({ message: 'Error getting categories' });
  }
}

export async function getMeasurementSystems(_: Request, response: Response): Promise<Response<measurementsystem[]>> {
  try {
    const query: measurementsystem[] = await prisma.measurementsystem.findMany();

    return response.status(200).json(query);
  } catch (error) {
    return response.status(500).json({ message: 'Error getting measurement systems' });
  }
}

export async function getMeasurementTypes(_: Request, response: Response): Promise<Response<measurementtype[]>> {
  try {
    const query: measurementtype[] = await prisma.measurementtype.findMany();

    return response.status(200).json(query);
  } catch (error) {
    return response.status(500).json({ message: 'Error getting measurement types' });
  }
}

export async function getMeasurementUnits(_: Request, response: Response): Promise<Response<measurementunit[]>> {
  try {
    const query: measurementunit[] = await prisma.measurementunit.findMany({
      include: {
        measurementsystem: true,
        measurementtype: true,
        recipeingredient: true
      }
    });

    return response.status(200).json(query);
  } catch (error) {
    return response.status(500).json({ message: 'Error getting measurement units' });
  }
}

export async function getThemes(_: Request, response: Response): Promise<Response<theme[]>> {
  try {
    const query: theme[] = await prisma.theme.findMany();

    return response.status(200).json(query);
  } catch (error) {
    return response.status(500).json({ message: 'Error getting themes' });
  }
}
