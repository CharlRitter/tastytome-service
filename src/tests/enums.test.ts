import { category, measurementsystem, measurementtype, measurementunit, theme } from '@prisma/client';
import prismaMock from '@/tests/mocks/prisma';
import {
  getCategories,
  getMeasurementSystems,
  getMeasurementTypes,
  getMeasurementUnits,
  getThemes
} from '@/controllers/enumController';
import { mockRequest, mockResponse } from '@/tests/mocks/express';

describe('Enums', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return categories', async() => {
    const mockCategories: category[] = [
      { id: 1, value: 'Appetizer' },
      { id: 2, value: 'Baking' },
      { id: 3, value: 'Breakfast' },
      { id: 4, value: 'Brunch' },
      { id: 5, value: 'Dessert' },
      { id: 6, value: 'Dinner' },
      { id: 7, value: 'Drinks & Cocktails' },
      { id: 8, value: 'Lunch' },
      { id: 9, value: 'Salad' },
      { id: 10, value: 'Sides' },
      { id: 11, value: 'Smoothies & Shakes' },
      { id: 12, value: 'Soups' },
      { id: 13, value: 'Snacks' },
      { id: 14, value: 'Vegetarian' },
      { id: 15, value: 'Vegan' }
    ];

    prismaMock.category.findMany.mockResolvedValue(mockCategories);

    const response = await getCategories(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(mockCategories);
  });

  it('should handle error while fetching categories', async() => {
    prismaMock.category.findMany.mockRejectedValue(new Error('Database Error'));

    const response = await getCategories(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting categories' });
  });

  it('should return measurement systems', async() => {
    const mockMeasurementSystems: measurementsystem[] = [
      { id: 1, value: 'Metric' },
      { id: 2, value: 'Imperial' }
    ];

    prismaMock.measurementsystem.findMany.mockResolvedValue(mockMeasurementSystems);

    const response = await getMeasurementSystems(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(mockMeasurementSystems);
  });

  it('should handle error while fetching measurement systems', async() => {
    prismaMock.measurementsystem.findMany.mockRejectedValue(new Error('Database Error'));

    const response = await getMeasurementSystems(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting measurement systems' });
  });

  it('should return measurement types', async() => {
    const mockMeasurementTypes: measurementtype[] = [
      { id: 1, value: 'Number' },
      { id: 2, value: 'Temperature' },
      { id: 3, value: 'Time' },
      { id: 4, value: 'Volume' },
      { id: 5, value: 'Weight' }
    ];

    prismaMock.measurementtype.findMany.mockResolvedValue(mockMeasurementTypes);

    const response = await getMeasurementTypes(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(mockMeasurementTypes);
  });

  it('should handle error while fetching measurement types', async() => {
    prismaMock.measurementtype.findMany.mockRejectedValue(new Error('Database Error'));

    const response = await getMeasurementTypes(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting measurement types' });
  });

  it('should return measurement units', async() => {
    const mockMeasurementUnits: measurementunit[] = [
      { id: 1, measurementsystemid: null, measurementtypeid: 1, value: 'Small', abbreviation: 'sml' },
      { id: 2, measurementsystemid: null, measurementtypeid: 1, value: 'Medium', abbreviation: 'med' },
      { id: 3, measurementsystemid: null, measurementtypeid: 1, value: 'Large', abbreviation: 'lg' },
      { id: 4, measurementsystemid: null, measurementtypeid: 3, value: 'Minutes', abbreviation: 'min' },
      { id: 5, measurementsystemid: null, measurementtypeid: 3, value: 'Hours', abbreviation: 'hr' },
      { id: 6, measurementsystemid: null, measurementtypeid: 4, value: 'Cup', abbreviation: 'cup' },
      { id: 7, measurementsystemid: null, measurementtypeid: 4, value: 'Pint', abbreviation: 'pt' },
      { id: 8, measurementsystemid: null, measurementtypeid: 4, value: 'Quart', abbreviation: 'qt' },
      { id: 9, measurementsystemid: null, measurementtypeid: 4, value: 'Tablespoon', abbreviation: 'tbsp' },
      { id: 10, measurementsystemid: null, measurementtypeid: 4, value: 'Teaspoon', abbreviation: 'tsp' },
      { id: 11, measurementsystemid: 1, measurementtypeid: 2, value: 'Celsius', abbreviation: '°C' },
      { id: 12, measurementsystemid: 1, measurementtypeid: 4, value: 'Millilitre', abbreviation: 'ml' },
      { id: 13, measurementsystemid: 1, measurementtypeid: 4, value: 'Litre', abbreviation: 'L' },
      { id: 14, measurementsystemid: 1, measurementtypeid: 5, value: 'Gram', abbreviation: 'g' },
      { id: 15, measurementsystemid: 1, measurementtypeid: 5, value: 'Kilogram', abbreviation: 'kg' },
      { id: 16, measurementsystemid: 2, measurementtypeid: 2, value: 'Fahrenheit', abbreviation: '°F' },
      { id: 17, measurementsystemid: 2, measurementtypeid: 4, value: 'Fluid Ounce', abbreviation: 'fl oz' },
      { id: 18, measurementsystemid: 2, measurementtypeid: 4, value: 'Gallon', abbreviation: 'gal' },
      { id: 19, measurementsystemid: 2, measurementtypeid: 5, value: 'Ounce', abbreviation: 'oz' },
      { id: 20, measurementsystemid: 2, measurementtypeid: 5, value: 'Pound', abbreviation: 'lb' }
    ];

    prismaMock.measurementunit.findMany.mockResolvedValue(mockMeasurementUnits);

    const response = await getMeasurementUnits(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(mockMeasurementUnits);
  });

  it('should handle error while fetching measurement units', async() => {
    prismaMock.measurementunit.findMany.mockRejectedValue(new Error('Database Error'));

    const response = await getMeasurementUnits(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting measurement units' });
  });

  it('should return themes', async() => {
    const mockThemes: theme[] = [
      { id: 1, value: 'System' },
      { id: 2, value: 'Dark' },
      { id: 3, value: 'Light' }
    ];

    prismaMock.theme.findMany.mockResolvedValue(mockThemes);

    const response = await getThemes(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(mockThemes);
  });

  it('should handle error while fetching themes', async() => {
    prismaMock.theme.findMany.mockRejectedValue(new Error('Database Error'));

    const response = await getThemes(mockRequest({ session: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting themes' });
  });
});
