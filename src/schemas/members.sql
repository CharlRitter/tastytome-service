-- Member Table
CREATE TABLE Member (
  id SERIAL PRIMARY KEY,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  emailAddress VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  isPremium BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  editedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Member Settings Table
CREATE TABLE MemberSettings (
  id SERIAL PRIMARY KEY,
  memberId INT UNIQUE NOT NULL,
  themeId INT NOT NULL DEFAULT 1,
  usePantry BOOLEAN NOT NULL DEFAULT TRUE,
  useNegativePantry BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  editedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (memberId) REFERENCES Member (id) ON DELETE CASCADE,
  FOREIGN KEY (theme) REFERENCES Theme (id),
);

-- Functions
CREATE OR REPLACE FUNCTION createMemberSettings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO MemberSettings (memberId) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER triggerUpdateEditedAtMember BEFORE
UPDATE
  ON Member FOR EACH ROW EXECUTE FUNCTION updateEditedAt();

CREATE TRIGGER triggerUpdateEditedAtMemberSettings BEFORE
UPDATE
  ON MemberSettings FOR EACH ROW EXECUTE FUNCTION updateEditedAt();

CREATE TRIGGER triggerCreateMemberSettings
AFTER
INSERT
  ON Member FOR EACH ROW EXECUTE FUNCTION createMemberSettings();
