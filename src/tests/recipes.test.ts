import { cloneDeep } from 'lodash';
import { mockRequest, mockResponse } from '@/tests/mocks/express';
import prismaMock from '@/tests/mocks/prisma';
import { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } from '@/controllers/recipeController';
import { recipe } from '@prisma/client';

jest.mock('jsonwebtoken');

const mockRecipe = {
  id: 1,
  memberid: 1,
  title: 'Bruh',
  description: 'Cool Description',
  rating: 5,
  effort: 4,
  measurementsystemid: 1,
  createdat: new Date(),
  editedat: new Date()
};

const mockRecipeId = 1;
const mockRequestData = {
  params: { id: mockRecipeId },
  memberId: mockRecipe.memberid
};

describe('Recipes Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return recipes', async() => {
    const mockRecipes = [
      {
        id: 1,
        memberid: 1,
        title: 'Bruh',
        description: 'Cool Description',
        rating: 5,
        effort: 4,
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

    prismaMock.recipe.findMany.mockResolvedValue(mockRecipes);

    const thisMockRequestData = {
      ...mockRequestData,
      query: {
        rating: '4',
        effort: '3',
        categories: '1,2,3',
        orderBy: 'asc',
        page: '1',
        pageSize: '10'
      }
    };
    const response = await getRecipes(mockRequest(thisMockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(mockRecipes);
  });

  it('should handle error while fetching recipes', async() => {
    prismaMock.recipe.findMany.mockRejectedValue(new Error('Database Error'));

    const response = await getRecipes(mockRequest({}), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting recipe' });
  });

  it('should return recipe by ID', async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);

    const response = await getRecipeById(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(mockRecipe);
  });

  it('should handle error when recipe not found while fetching recipe by ID', async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(null);

    const response = await getRecipeById(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe not found' });
  });

  it("should handle error when user doesn't own the recipe while fetching recipe by ID", async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);

    const localMockRequestData = cloneDeep(mockRequestData);

    localMockRequestData.memberId = 2;
    const response = await getRecipeById(mockRequest(localMockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This member does not belong to you' });
  });

  it('should handle error while fetching recipe by ID', async() => {
    prismaMock.recipe.findUnique.mockRejectedValue(new Error('Database Error'));

    const response = await getRecipeById(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting recipe' });
  });

  it('should create a new recipe', async() => {
    const thisMockRequestData = {
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

    prismaMock.recipe.create.mockResolvedValue(mockRecipe);

    const response = await createRecipe(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe successfully created' });
  });

  it('should handle error when recipeingredients are missing while creating a new recipe', async() => {
    const thisMockRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      // recipeingredients missing
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };

    const response = await createRecipe(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Required fields are missing: recipeingredients' });
  });

  it('should handle error while creating a new recipe', async() => {
    prismaMock.$transaction.mockRejectedValue(new Error('Database Error'));

    const thisMockRequestData = {
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
    const response = await createRecipe(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error creating recipe' });
  });

  it('should update an existing recipe', async() => {
    const thisMockRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };

    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);
    prismaMock.recipe.update.mockResolvedValue(mockRecipe);

    const response = await updateRecipe(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe successfully updated' });
  });

  it('should handle error when recipe not found while updating an existing recipe', async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(null);

    const thisMockRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const response = await updateRecipe(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe not found' });
  });

  it("should handle error when user doesn't own the recipe while updating an existing recipe", async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);

    const thisMockRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const localMockRequestData = cloneDeep(mockRequestData);

    localMockRequestData.memberId = 2;

    const response = await updateRecipe(
      mockRequest({ ...localMockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This member does not belong to you' });
  });

  it('should handle error when database transaction fails while updating an existing recipe', async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);
    prismaMock.$transaction.mockRejectedValue(new Error('Database Error'));

    const thisMockRequestData = {
      title: 'Bruh',
      description: 'Cool Description',
      measurementsystemid: 1,
      recipeinstructions: ['step 1', 'step 2'],
      recipetimers: [{ title: 'Timer', hours: 1 }]
    };
    const response = await updateRecipe(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error updating recipe' });
  });

  it('should delete an existing recipe', async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);
    prismaMock.recipe.delete.mockResolvedValue({} as recipe);

    const response = await deleteRecipe(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe successfully deleted' });
  });

  it('should handle error when recipe not found while deleting an existing recipe', async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(null);

    const response = await deleteRecipe(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Recipe not found' });
  });

  it("should handle error when user doesn't own the recipe while deleting an existing recipe", async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);

    const localMockRequestData = cloneDeep(mockRequestData);

    localMockRequestData.memberId = 2;
    const response = await deleteRecipe(mockRequest(localMockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This member does not belong to you' });
  });

  it('should handle error when database transaction fails while deleting an existing recipe', async() => {
    prismaMock.recipe.findUnique.mockResolvedValue(mockRecipe);
    prismaMock.recipe.delete.mockRejectedValue(new Error('Database Error'));

    const response = await deleteRecipe(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error deleting recipe' });
  });
});
