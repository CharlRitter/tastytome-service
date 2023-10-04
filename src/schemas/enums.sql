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
  FOREIGN KEY (measurementSystemId) REFERENCES MeasurementSystem(id),
  FOREIGN KEY (measurementTypeId) REFERENCES MeasurementType(id)
);

INSERT INTO
  MeasurementUnit (
    id,
    measurementSystemId,
    measurementTypeId,
    value,
    abbreviation
  )
VALUES
  -- General Numbers
  (1, NULL, 1, 'Small', 'sml'),
  (2, NULL, 1, 'Medium', 'med'),
  (3, NULL, 1, 'Large', 'lg'),
  -- General Times
  (4, NULL, 3, 'Minutes', 'min'),
  (5, NULL, 3, 'Hours', 'hr'),
  -- General Volumes
  (6, NULL, 4, 'Cups', 'cup'),
  (7, NULL, 4, 'Pints', 'pt'),
  (8, NULL, 4, 'Quarts', 'qt'),
  (9, NULL, 4, 'Tablespoons', 'tbsp'),
  (10, NULL, 4, 'Teaspoons', 'tsp'),
  -- Metric Temperatures
  (11, 1, 2, 'Celsius', '°C'),
  -- Metric Volumes
  (12, 1, 4, 'Millilitres', 'ml'),
  (13, 1, 4, 'Litres', 'L'),
  -- Metric Weights
  (14, 1, 5, 'Grams', 'g'),
  (15, 1, 5, 'Kilograms', 'kg'),
  -- Imperial Temperatures
  (16, 2, 2, 'Fahrenheit', '°F'),
  -- Imperial Volumes
  (17, 2, 4, 'Fluid Ounces', 'fl oz'),
  (18, 2, 4, 'Gallons', 'gal'),
  -- Imperial Weights
  (19, 2, 5, 'Ounces', 'oz'),
  (20, 2, 5, 'Pounds', 'lb');
