import { Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { Prisma, recipe, recipeingredient, recipetimer } from '@prisma/client';
import prisma from '@/utils/client';

interface Recipe extends recipe {
  recipecategories: number[];
  recipeingredients: recipeingredient[];
  recipeinstructions: string[];
  recipetimers: recipetimer[];
}

export async function getRecipes(
  request: Request,
  response: Response
): Promise<Response<Recipe[] | { message: string }>> {
  try {
    const rating = parseInt(request.query?.rating as string, 10) || 0;
    const effort = parseInt(request.query?.effort as string, 10) || 0;
    const categories = (request.query?.categories as string) || '';
    const orderBy: Prisma.SortOrder = request.query?.orderBy === 'asc' ? 'asc' : 'desc';
    const page = parseInt(request.query?.page as string, 10) || 1;
    const pageSize = parseInt(request.query?.pageSize as string, 10) || 10;
    const skip = (page - 1) * pageSize;

    const whereConditions: Prisma.recipeWhereInput[] = [];

    whereConditions.push({ memberid: request.memberId });
    whereConditions.push({ rating: { gte: rating } });
    whereConditions.push({ effort: { gte: effort } });

    if (categories) {
      const categoryIds = categories.split(',').map((item) => parseInt(item, 10));

      whereConditions.push({ recipecategory: { some: { categoryid: { in: categoryIds } } } });
    }

    const recipes = await prisma.recipe.findMany({
      where: { AND: whereConditions },
      include: {
        measurementsystem: true,
        recipecategory: { include: { category: true } },
        recipeingredient: { include: { measurementtype: true, measurementunit: true } },
        recipeinstruction: true,
        recipetimer: true
      },
      orderBy: [{ createdat: orderBy }],
      skip,
      take: pageSize
    });
    const totalCount = await prisma.recipe.count({ where: { AND: whereConditions } });

    return response.status(200).json({ data: recipes, meta: { totalCount } });
  } catch (error) {
    return response.status(500).json({ message: 'Error getting recipe' });
  }
}

export async function getRecipe(request: Request, response: Response): Promise<Response<Recipe | { message: string }>> {
  try {
    const recipeId = parseInt(request.params.recipeId as string, 10);
    const recipeContent = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        measurementsystem: true,
        recipecategory: { include: { category: true } },
        recipeingredient: { include: { measurementtype: true, measurementunit: true } },
        recipeinstruction: true,
        recipetimer: true
      }
    });

    if (isEmpty(recipeContent)) {
      return response.status(404).json({ message: 'Recipe not found' });
    }

    const currentMemberId = request.memberId;

    if (currentMemberId !== recipeContent.memberid) {
      return response.status(401).json({ message: 'Unauthorised: This recipe does not belong to you' });
    }

    return response.status(200).json({ data: recipeContent });
  } catch (error) {
    return response.status(500).json({ message: 'Error getting recipe' });
  }
}

export async function createRecipe(request: Request, response: Response): Promise<Response<{ message: string }>> {
  try {
    const fullRecipeData: Omit<Recipe, 'id'> = request.body;

    if (!fullRecipeData || isEmpty(fullRecipeData)) {
      const schema = {
        memberid: 'integer',
        title: 'string',
        description: 'string',
        image: 'string | File (optional)',
        rating: 'integer (optional)',
        effort: 'integer (optional)',
        measurementsystemid: 'integer',
        recipecategories: 'integer[] (optional)',
        recipeingredients:
          '[{ title: string, measurementtypeid: integer, measurementunitid: integer, measurementamount: float }]',
        recipeinstructions: 'string[]',
        recipetimers: '[{ title: string, hours: integer (optional), minutes: integer (optional) }] (optional)'
      };

      return response.status(200).json({ data: schema });
    }

    const requiredFields: Array<keyof Recipe> = [
      'title',
      'description',
      'measurementsystemid',
      'recipeingredients',
      'recipeinstructions'
    ];
    const missingFields = requiredFields.filter((field) => !(field in fullRecipeData)) as string[];

    if (missingFields.length > 0) {
      return response.status(400).json({ message: `Required fields are missing: ${missingFields.join(', ')}` });
    }

    const { recipecategories, recipeingredients, recipeinstructions, recipetimers, ...recipeData } = fullRecipeData;

    // recipeingredients check
    const recipeingredientRequiredFields: Array<keyof recipeingredient> = [
      'title',
      'measurementunitid',
      'measurementtypeid',
      'measurementamount'
    ];
    const recipeingredientsMissingFields: string[] = [];

    recipeingredients.forEach((item, index) => {
      const recipeingredientMissingFields = recipeingredientRequiredFields.filter(
        (field) => !(field in item)
      ) as string[];

      if (recipeingredientMissingFields.length > 0) {
        recipeingredientsMissingFields.push(`${index}: { ${recipeingredientMissingFields.join(', ')} }`);
      }
    });

    if (recipeingredientsMissingFields.length > 0) {
      return response
        .status(400)
        .json({ message: `Required fields are missing in recipeingredients: ${recipeingredientsMissingFields.join(', ')}` });
    }

    // recipetimers check
    if (recipetimers && recipetimers.length > 0) {
      const recipetimerRequiredFields: Array<keyof recipetimer> = ['title'];
      const recipetimersMissingFields: string[] = [];

      recipetimers.forEach((item, index) => {
        const recipetimerMissingFields = recipetimerRequiredFields.filter((field) => !(field in item)) as string[];

        if (!('hours' in item) && !('minutes' in item)) {
          recipetimerMissingFields.push('hours or minutes');
        }

        if (recipetimerMissingFields.length > 0) {
          recipetimersMissingFields.push(`${index}: { ${recipetimerMissingFields.join(', ')} }`);
        }
      });

      if (recipetimersMissingFields.length > 0) {
        return response
          .status(400)
          .json({ message: `Required fields are missing in recipetimers: ${recipetimersMissingFields.join(', ')}` });
      }
    }

    const memberid = request.memberId as number;
    const { title, description, image, rating, effort, measurementsystemid } = recipeData;

    await prisma.$transaction(async(transactionPrisma) => {
      const newRecipe = await transactionPrisma.recipe.create({
        data: {
          memberid,
          title,
          description,
          image,
          rating,
          effort,
          measurementsystemid
        }
      });

      await transactionPrisma.recipecategory.createMany({ data: recipecategories.map((item) => ({ recipeid: newRecipe.id, categoryid: item })) });
      await transactionPrisma.recipeingredient.createMany({
        data: recipeingredients.map((item) => ({
          recipeid: newRecipe.id,
          title: item.title,
          measurementunitid: item.measurementunitid,
          measurementtypeid: item.measurementtypeid,
          measurementamount: item.measurementamount
        }))
      });
      await transactionPrisma.recipeinstruction.createMany({ data: recipeinstructions.map((item) => ({ recipeid: newRecipe.id, title: item })) });

      if (recipetimers && recipetimers.length > 0) {
        await transactionPrisma.recipetimer.createMany({
          data: recipetimers.map((item) => ({
            recipeid: newRecipe.id,
            title: item.title,
            minutes: item.minutes,
            hours: item.minutes
          }))
        });
      }
    });

    return response.status(201).json({ message: 'Recipe successfully created' });
  } catch (error) {
    return response.status(500).json({ message: 'Error creating recipe' });
  }
}

export async function updateRecipe(request: Request, response: Response): Promise<Response<{ message: string }>> {
  try {
    const recipeId = parseInt(request.params.recipeId as string, 10);
    const fullRecipeData = request.body as Partial<Recipe>;

    if (!fullRecipeData || isEmpty(fullRecipeData)) {
      const schema = {
        memberid: 'integer (optional)',
        title: 'string (optional)',
        description: 'string (optional)',
        image: 'string | File (optional)',
        rating: 'integer (optional)',
        effort: 'integer (optional)',
        measurementsystemid: 'integer (optional)',
        recipecategories: 'integer[] (optional)',
        recipeingredients:
          '[{ title: string, measurementtypeid: integer, measurementunitid: integer, measurementamount: float }] (optional)',
        recipeinstructions: 'string[] (optional)',
        recipetimers: '[{ title: string, hours: integer (optional), minutes: integer (optional) }] (optional)'
      };

      return response.status(200).json({ data: schema });
    }

    const recipeContent = await prisma.recipe.findUnique({ where: { id: recipeId } });

    if (isEmpty(recipeContent)) {
      return response.status(404).json({ message: 'Recipe not found' });
    }

    const { recipecategories, recipeingredients, recipeinstructions, recipetimers, ...recipeData } = fullRecipeData;

    // recipeingredients check
    if (recipeingredients && recipeingredients.length > 0) {
      const recipeingredientRequiredFields: Array<keyof recipeingredient> = [
        'title',
        'measurementunitid',
        'measurementtypeid',
        'measurementamount'
      ];
      const recipeingredientsMissingFields: string[] = [];

      recipeingredients.forEach((item, index) => {
        const recipeingredientMissingFields = recipeingredientRequiredFields.filter(
          (field) => !(field in item)
        ) as string[];

        if (recipeingredientMissingFields.length > 0) {
          recipeingredientsMissingFields.push(`${index}: { ${recipeingredientMissingFields.join(', ')} }`);
        }
      });

      if (recipeingredientsMissingFields.length > 0) {
        return response
          .status(400)
          .json({ message: `Required fields are missing in recipeingredients: ${recipeingredientsMissingFields.join(', ')}` });
      }
    }

    // recipetimers check
    if (recipetimers && recipetimers.length > 0) {
      const recipetimerRequiredFields: Array<keyof recipetimer> = ['title'];
      const recipetimersMissingFields: string[] = [];

      recipetimers.forEach((item, index) => {
        const recipetimerMissingFields = recipetimerRequiredFields.filter((field) => !(field in item)) as string[];

        if (!('hours' in item) && !('minutes' in item)) {
          recipetimerMissingFields.push('hours or minutes');
        }

        if (recipetimerMissingFields.length > 0) {
          recipetimersMissingFields.push(`${index}: { ${recipetimerMissingFields.join(', ')} }`);
        }
      });

      if (recipetimersMissingFields.length > 0) {
        return response
          .status(400)
          .json({ message: `Required fields are missing in recipetimers: ${recipetimersMissingFields.join(', ')}` });
      }
    }
    const currentMemberId = request.memberId;

    if (currentMemberId !== recipeContent.memberid) {
      return response.status(401).json({ message: 'Unauthorised: This recipe does not belong to you' });
    }

    await prisma.$transaction(async(transactionPrisma) => {
      const { title, description, rating, effort, measurementsystemid } = recipeData;
      const data: Partial<recipe> = {};

      if (title) data.title = title;
      if (description) data.description = description;
      if (rating) data.rating = rating;
      if (effort) data.effort = effort;
      if (measurementsystemid) data.measurementsystemid = measurementsystemid;

      const updatedRecipe = await transactionPrisma.recipe.update({
        where: { id: recipeId },
        data
      });

      if (recipecategories && recipecategories.length > 0) {
        await transactionPrisma.recipecategory.deleteMany({ where: { recipeid: updatedRecipe.id } });
        await transactionPrisma.recipecategory.createMany({ data: recipecategories.map((item) => ({ recipeid: updatedRecipe.id, categoryid: item })) });
      }
      if (recipeingredients && recipeingredients.length > 0) {
        await transactionPrisma.recipeingredient.deleteMany({ where: { recipeid: updatedRecipe.id } });
        await transactionPrisma.recipeingredient.createMany({
          data: recipeingredients.map((item) => ({
            recipeid: updatedRecipe.id,
            title: item.title,
            measurementunitid: item.measurementunitid,
            measurementtypeid: item.measurementtypeid,
            measurementamount: item.measurementamount
          }))
        });
      }
      if (recipeinstructions && recipeinstructions.length > 0) {
        await transactionPrisma.recipeinstruction.deleteMany({ where: { recipeid: updatedRecipe.id } });
        await transactionPrisma.recipeinstruction.createMany({ data: recipeinstructions.map((item) => ({ recipeid: updatedRecipe.id, title: item })) });
      }
      if (recipetimers && recipetimers.length > 0) {
        await transactionPrisma.recipetimer.deleteMany({ where: { recipeid: updatedRecipe.id } });
        await transactionPrisma.recipetimer.createMany({
          data: recipetimers.map((item) => ({
            recipeid: updatedRecipe.id,
            title: item.title,
            minutes: item.minutes,
            hours: item.hours
          }))
        });
      }
    });

    return response.status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error updating recipe' });
  }
}

export async function deleteRecipe(request: Request, response: Response): Promise<Response<{ message: string }>> {
  try {
    const recipeId = parseInt(request.params.recipeId as string, 10);
    const recipeContent = await prisma.recipe.findUnique({ where: { id: recipeId } });

    if (isEmpty(recipeContent)) {
      return response.status(404).json({ message: 'Recipe not found' });
    }

    const currentMemberId = request.memberId;

    if (currentMemberId !== recipeContent.memberid) {
      return response.status(401).json({ message: 'Unauthorised: This recipe does not belong to you' });
    }

    await prisma.recipe.delete({ where: { id: recipeId } });

    return response.status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error deleting recipe' });
  }
}
