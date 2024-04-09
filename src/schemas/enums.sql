-- Theme Table
CREATE TABLE Theme (
  id SERIAL PRIMARY KEY,
  value VARCHAR(50) NOT NULL
);

INSERT INTO
  Theme (id, value)
VALUES
  (1, 'System'),
  (2, 'Dark'),
  (3, 'Light');

-- Category Table
CREATE TABLE Category (
  id SERIAL PRIMARY KEY,
  value VARCHAR(50) NOT NULL
);

INSERT INTO
  Category (id, value)
VALUES
  (1, 'Appetizer'),
  (2, 'Baking'),
  (3, 'Breakfast'),
  (4, 'Brunch'),
  (5, 'Dessert'),
  (6, 'Dinner'),
  (7, 'Drinks & Cocktails'),
  (8, 'Lunch'),
  (9, 'Salad'),
  (10, 'Sides'),
  (11, 'Smoothies & Shakes'),
  (12, 'Soups'),
  (13, 'Snacks'),
  (14, 'Vegetarian'),
  (15, 'Vegan');

-- MeasurementSystem Table
CREATE TABLE MeasurementSystem (
  id SERIAL PRIMARY KEY,
  value VARCHAR(50) NOT NULL
);

INSERT INTO
  MeasurementSystem (id, value)
VALUES
  (1, 'Metric'),
  (2, 'Imperial');

-- MeasurementType Table
CREATE TABLE MeasurementType (
  id SERIAL PRIMARY KEY,
  value VARCHAR(50) NOT NULL
);

INSERT INTO
  MeasurementType (id, value)
VALUES
  (1, 'Number'),
  (2, 'Temperature'),
  (3, 'Time'),
  (4, 'Volume'),
  (5, 'Weight');

-- MeasurementUnit Table
CREATE TABLE MeasurementUnit (
  id SERIAL PRIMARY KEY,
  measurementSystemId INT,
  measurementTypeId INT,
  value VARCHAR(50) NOT NULL,
  abbreviation VARCHAR(50) NOT NULL,
  conversionFactor DECIMAL,
  FOREIGN KEY (measurementSystemId) REFERENCES MeasurementSystem(id),
  FOREIGN KEY (measurementTypeId) REFERENCES MeasurementType(id)
);

INSERT INTO
  MeasurementUnit (
    id,
    measurementSystemId,
    measurementTypeId,
    value,
    abbreviation,
    conversionFactor
  )
VALUES
  -- General Numbers
  (1, NULL, 1, 'Small', 'sml', NULL),
  (2, NULL, 1, 'Medium', 'med', NULL),
  (3, NULL, 1, 'Large', 'lg', NULL),
  -- General Times
  (4, NULL, 3, 'Minutes', 'min', NULL),
  (5, NULL, 3, 'Hours', 'hr', NULL),
  -- General Volumes
  (6, NULL, 4, 'Cups', 'cup', 236.588), -- 1 cup = 236.588 millilitres
  (7, NULL, 4, 'Pints', 'pt', 473.176), -- 1 pint = 473.176 millilitres
  (8, NULL, 4, 'Quarts', 'qt', 946.353), -- 1 quart = 946.353 millilitres
  (9, NULL, 4, 'Tablespoons', 'tbsp', 14.7868), -- 1 tablespoon = 14.7868 millilitres
  (10, NULL, 4, 'Teaspoons', 'tsp', 4.92892), -- 1 teaspoon = 4.92892 millilitres
  -- Metric Temperatures
  (11, 1, 2, 'Celsius', '°C', NULL), -- 1 °C = (°F - 32) * (5/9)
  -- Metric Volumes
  (12, 1, 4, 'Millilitres', 'ml', 0.033814), -- 1 millilitre = 0.033814 fluid ounces
  (13, 1, 4, 'Litres', 'L', 33.814), -- 1 litre = 33.814 fluid ounces
  -- Metric Weights
  (14, 1, 5, 'Grams', 'g', 0.035274), -- 1 gram = 0.035274 ounces
  (15, 1, 5, 'Kilograms', 'kg', 35.274), -- 1 kilogram = 35.274 ounces
  -- Imperial Temperatures
  (16, 2, 2, 'Fahrenheit', '°F', 33.8), -- 1 °F = 33.8 °C
  -- Imperial Volumes
  (17, 2, 4, 'Fluid Ounces', 'fl oz', 29.5735), -- 1 fluid ounce = 29.5735 millilitres
  (18, 2, 4, 'Gallons', 'gal', 3785.41), -- 1 gallon = 3785.41 millilitres
  -- Imperial Weights
  (19, 2, 5, 'Ounces', 'oz', 28.3495), -- 1 ounce = 28.3495 grams
  (20, 2, 5, 'Pounds', 'lb', 453.592); -- 1 pound = 453.592 grams
