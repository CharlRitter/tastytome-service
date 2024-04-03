-- Recipes Table
CREATE TABLE Recipe (
  id SERIAL PRIMARY KEY,
  memberId INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255),
  rating INT DEFAULT 0,
  effort INT DEFAULT 0,
  measurementSystemId INT NOT NULL,
  createdAt TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  editedAt TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (memberId) REFERENCES Member(id) ON DELETE CASCADE,
  FOREIGN KEY (measurementSystemId) REFERENCES MeasurementSystem(id)
);

-- RecipeCategories Table
CREATE TABLE RecipeCategory (
  id SERIAL PRIMARY KEY,
  recipeId INT NOT NULL,
  categoryId INT NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES Recipe(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES Category(id),
  createdAt TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RecipeInstructions Table
CREATE TABLE RecipeInstruction (
  id SERIAL PRIMARY KEY,
  recipeId INT NOT NULL,
  title TEXT NOT NULL,
  createdAt TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipeId) REFERENCES Recipe(id) ON DELETE CASCADE
);

-- RecipeTimers Table
CREATE TABLE RecipeTimer (
  id SERIAL PRIMARY KEY,
  recipeId INT NOT NULL,
  title TEXT NOT NULL,
  hours INT,
  minutes INT,
  createdAt TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipeId) REFERENCES Recipe(id) ON DELETE CASCADE
);

-- RecipeIngredients Table
CREATE TABLE RecipeIngredient (
  id SERIAL PRIMARY KEY,
  recipeId INT NOT NULL,
  title TEXT NOT NULL,
  measurementTypeId INT NOT NULL,
  measurementUnitId INT NOT NULL,
  measurementAmount FLOAT NOT NULL,
  createdAt TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipeId) REFERENCES Recipe(id) ON DELETE CASCADE,
  FOREIGN KEY (measurementTypeId) REFERENCES MeasurementType(id),
  FOREIGN KEY (measurementUnitId) REFERENCES MeasurementUnit(id)
);

-- Triggers
CREATE TRIGGER triggerUpdateEditedAtRecipes BEFORE
UPDATE
  ON Recipe FOR EACH ROW EXECUTE FUNCTION updateEditedAt();
