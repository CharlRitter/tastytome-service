import { recipe } from '@prisma/client';
import { mockReset } from 'jest-mock-extended';
import { cloneDeep } from 'lodash';

import { createRecipe, deleteRecipe, getRecipe, getRecipes, updateRecipe } from '@/controllers/recipeController';

import { mockRequest, mockResponse } from './mocks/express';
import { prismaMock } from './mocks/prisma';

jest.mock('jsonwebtoken');

const mockRecipe: recipe = {
  id: 1,
  memberid: 1,
  title: 'Bruh',
  description: 'Cool Description',
  rating: 5,
  effort: 4,
  image: '',
  measurementsystemid: 1,
  createdat: new Date(),
  editedat: new Date()
};
const baseRequestData = {
  headers: { Authorization: 'Bearer valid_token' },
  cookies: { refreshToken: 'valid_token' },
  memberId: mockRecipe.memberid
};

describe('Recipes Controller', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return recipes', async () => {
    const mockRecipes = [
      {
        id: 1,
        memberid: 1,
        title: 'Bruh',
        description: 'Cool Description',
        rating: 5,
        effort: 4,
        image: '',
        measurementsystemid: 1,
        createdat: new Date(),
        editedat: new Date(),
        recipecategory: [
          {
            id: 1,
            recipeid: 1,
            categoryid: 1,
            createdat: new Date()
          }
        ],
        recipeingredient: [
          {
            id: 1,
            recipeid: 1,
            title: 'item 1',
            measurementtypeid: 1,
            measurementunitid: 1,
            measurementamount: 1.5,
            createdat: new Date()
          }
        ],
        recipeinstruction: [
          {
            id: 1,
            recipeid: 1,
            title: 'step 1',
            createdat: new Date()
          }
        ],
        recipetimer: [
          {
            id: 1,
            recipeid: 1,
            title: 'Timer',
            hours: 1,
            minutes: null,
            createdat: new Date()
          }
        ]
      }
    ];
    const totalCount = 1;
    const responseRecipe = { data: mockRecipes, meta: { totalCount } };
    const response = mockResponse();
    const request = mockRequest({
      ...baseRequestData,
      query: {
        rating: '4',
        effort: '3',
        categories: '1,2,3',
        orderBy: 'asc',
        page: '1',
        pageSize: '10'
      }
    });

    prismaMock.recipe.findMany.mockResolvedValue(mockRecipes);
    prismaMock.recipe.count.mockResolvedValue(totalCount);

    await getRecipes(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(responseRecipe);
  });

  it('should handle error while fetching recipes', async () => {
    const response = mockResponse();
    const request = mockRequest({});

    prismaMock.recipe.findMany.mockRejectedValue(new Error('Database Error'));

    await getRecipes(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting recipes' });
  });

  it('should return recipe', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    const responseRecipe = { data: mockRecipe };

    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);

    await getRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(responseRecipe);
  });

  it('should handle error when recipe not found while fetching recipe by ID', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.recipe.findUnique.mockResolvedValue(null);

    await getRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe not found' });
  });

  it("should handle error when user doesn't own the recipe while fetching recipe by ID", async () => {
    const response = mockResponse();
    const localbaseRequestData = cloneDeep(baseRequestData);
    localbaseRequestData.memberId = 2;
    const request = mockRequest(localbaseRequestData);

    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);

    await getRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This recipe does not belong to you' });
  });

  it('should handle error while fetching recipe by ID', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.recipe.findUnique.mockRejectedValue(new Error('Database Error'));

    await getRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting recipe' });
  });

  it('should create a new recipe', async () => {
    const response = mockResponse();
    const thisbaseRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipecategories: [2, 3],
      recipeingredients: [
        {
          title: 'item 1',
          measurementtypeid: 1,
          measurementunitid: 1,
          measurementamount: 1.5
        }
      ],
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const request = mockRequest({ ...baseRequestData, body: thisbaseRequestData });

    prismaMock.recipe.create.mockResolvedValue(mockRecipe);

    await createRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe successfully created' });
  });

  it('should return schema when no body', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.recipe.create.mockResolvedValue(mockRecipe);

    await createRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      data: {
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
      }
    });
  });

  it('should handle error when recipeingredients are missing while creating a new recipe', async () => {
    const response = mockResponse();
    const thisbaseRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      // recipeingredients missing
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const request = mockRequest({ ...baseRequestData, body: thisbaseRequestData });

    await createRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Required fields are missing: recipeingredients' });
  });

  it('should handle error while creating a new recipe', async () => {
    const response = mockResponse();
    const thisbaseRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipecategories: [2, 3],
      recipeingredients: [
        {
          title: 'item 1',
          measurementtypeid: 1,
          measurementunitid: 1,
          measurementamount: 1.5
        }
      ],
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const request = mockRequest({ ...baseRequestData, body: thisbaseRequestData });

    prismaMock.$transaction.mockRejectedValue(new Error('Database Error'));

    await createRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error creating recipe' });
  });

  it('should update an existing recipe', async () => {
    const response = mockResponse();
    const thisbaseRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const request = mockRequest({ ...baseRequestData, body: thisbaseRequestData });

    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);
    prismaMock.recipe.update.mockResolvedValue(mockRecipe);

    await updateRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('should return schema when no body', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    await updateRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      data: {
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
      }
    });
  });

  it('should handle error when recipe not found while updating an existing recipe', async () => {
    const response = mockResponse();
    const thisbaseRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const request = mockRequest({ ...baseRequestData, body: thisbaseRequestData });

    prismaMock.recipe.findUnique.mockResolvedValue(null);

    await updateRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe not found' });
  });

  it("should handle error when user doesn't own the recipe while updating an existing recipe", async () => {
    const response = mockResponse();
    const thisbaseRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const localbaseRequestData = cloneDeep(baseRequestData);
    localbaseRequestData.memberId = 2;
    const request = mockRequest({ ...localbaseRequestData, body: thisbaseRequestData });


    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);

    await updateRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This recipe does not belong to you' });
  });

  it('should handle error when database transaction fails while updating an existing recipe', async () => {
    const response = mockResponse();
    const thisbaseRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const request = mockRequest({ ...baseRequestData, body: thisbaseRequestData });

    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);
    prismaMock.$transaction.mockRejectedValue(new Error('Database Error'));

    await updateRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error updating recipe' });
  });

  it('should delete an existing recipe', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);

    await deleteRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('should handle error when recipe not found while deleting an existing recipe', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.recipe.findUnique.mockResolvedValue(null);

    await deleteRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe not found' });
  });

  it("should handle error when user doesn't own the recipe while deleting an existing recipe", async () => {
    const response = mockResponse();
    const localbaseRequestData = cloneDeep(baseRequestData);
    localbaseRequestData.memberId = 2;
    const request = mockRequest(localbaseRequestData);

    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);

    await deleteRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This recipe does not belong to you' });
  });

  it('should handle error when database transaction fails while deleting an existing recipe', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);
    prismaMock.recipe.delete.mockRejectedValue(new Error('Database Error'));

    await deleteRecipe(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error deleting recipe' });
  });
});
