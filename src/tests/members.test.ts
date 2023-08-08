import { cloneDeep } from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { mockRequest, mockResponse } from '@/tests/mocks/express';
import prismaMock from '@/tests/mocks/prisma';
import {
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  loginMember,
  logoutMember,
  updateMemberPassword,
  resetMemberPassword,
  confirmResetMemberPassword,
  updateMemberSettings
} from '@/controllers/memberController';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Members', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockMemberSettings = {
    id: 1,
    theme: 1,
    measurementsystem: 1,
    usepantry: true,
    usenegativepantry: true,
    displaynutritionalinformation: true,
    memberid: 1,
    createdat: new Date(),
    editedat: new Date()
  };
  const mockMember = {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    emailaddress: 'john.doe@example.com',
    ispremium: true,
    password: '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234',
    createdat: new Date(),
    editedat: new Date(),
    membersettings: mockMemberSettings
  };
  const mockMemberId = 1;
  const mockRequestData = {
    params: { id: mockMemberId },
    memberId: mockMember.id
  };
  const jwtMock = jwt as jest.Mocked<typeof import('jsonwebtoken')>;
  const bcryptMocked = bcrypt as jest.Mocked<typeof import('bcrypt')>;

  it('should return member by ID', async() => {
    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    const response = await getMemberById(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(mockMember);
  });

  it('should handle error when member not found while fetching member by ID', async() => {
    prismaMock.member.findUnique.mockResolvedValue(null);

    const response = await getMemberById(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it("should handle error when user doesn't own the member while fetching member by ID", async() => {
    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    const localMockRequestData = cloneDeep(mockRequestData);

    localMockRequestData.memberId = 2;

    const response = await getMemberById(mockRequest(localMockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This member does not belong to you' });
  });

  it('should handle error while fetching member by ID', async() => {
    prismaMock.member.findUnique.mockRejectedValue(new Error('Database Error'));

    const response = await getMemberById(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting member by ID' });
  });

  it('should create a new member', async() => {
    process.env.JWT_SECRET = 'mock_secret';

    const thisMockRequestData = {
      firstname: 'John',
      lastname: 'Doe',
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };

    prismaMock.member.findFirst.mockResolvedValue(null);
    prismaMock.member.create.mockResolvedValue({
      ...thisMockRequestData,
      id: 1,
      ispremium: false,
      createdat: new Date(),
      editedat: new Date()
    });
    jwtMock.sign.mockReturnValue('mock_token');

    const response = await createMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(jwtMock.sign).toHaveBeenCalledWith(expect.any(Object), expect.any(String), expect.any(Object));
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member successfully created' });
  });

  it('should handle error when required fields are missing while creating a new member', async() => {
    const thisMockRequestData = { ispremium: true };

    const response = await createMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Required fields are missing: firstname, lastname, emailaddress, password' });
  });

  it('should handle error when fields are missing while creating a new member', async() => {
    const response = await createMember(mockRequest({ ...mockRequestData, body: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      firstname: 'string',
      lastname: 'string',
      emailaddress: 'string',
      password: 'string',
      ispremium: 'boolean (optional)'
    });
  });

  it('should handle error when member already exists while creating a new member', async() => {
    const thisMockRequestData = {
      firstname: 'John',
      lastname: 'Doe',
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };

    prismaMock.member.findFirst.mockResolvedValue(mockMember);

    const response = await createMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member already exists' });
  });

  it('should handle error while creating a new member', async() => {
    prismaMock.member.create.mockRejectedValue(new Error('Database Error'));

    const thisMockRequestData = {
      firstname: 'John',
      lastname: 'Doe',
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };

    const response = await createMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error creating member' });
  });

  it('should update an existing member', async() => {
    const thisMockRequestData = {
      firstname: 'Updated John',
      lastname: 'Updated Doe'
    };

    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    const response = await updateMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member successfully updated' });
  });

  it('should handle error when fields are missing while updating an existing member', async() => {
    const response = await updateMember(mockRequest({ ...mockRequestData, body: {} }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      firstname: 'string (optional)',
      lastname: 'string (optional)',
      emailaddress: 'string (optional)',
      ispremium: 'boolean (optional)'
    });
  });

  it('should handle error when member is not found while updating an existing member', async() => {
    prismaMock.member.findUnique.mockResolvedValue(null);

    const thisMockRequestData = {
      firstname: 'Updated John',
      lastname: 'Updated Doe'
    };

    const response = await updateMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it("should handle error when user doesn't own the member while updating an existing member", async() => {
    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    const localMockRequestData = cloneDeep(mockRequestData);
    const response = await updateMember(
      mockRequest({ ...localMockRequestData, memberId: 2, body: { firstname: 'bob' } }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This member does not belong to you' });
  });

  it('should handle error while updating an existing member', async() => {
    prismaMock.member.findUnique.mockResolvedValue(mockMember);
    prismaMock.member.update.mockRejectedValue(new Error('Database Error'));

    const thisMockRequestData = {
      firstname: 'Updated John',
      lastname: 'Updated Doe'
    };

    const response = await updateMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error updating member' });
  });

  it('should delete an existing member', async() => {
    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    const response = await deleteMember(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member successfully deleted' });
  });

  it('should handle error when member is not found while deleting an existing member', async() => {
    prismaMock.member.findUnique.mockResolvedValue(null);

    const response = await deleteMember(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it("should handle error when user doesn't own the member while deleting an existing member", async() => {
    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    const localMockRequestData = cloneDeep(mockRequestData);

    localMockRequestData.memberId = 2;

    const response = await deleteMember(mockRequest(localMockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This member does not belong to you' });
  });

  it('should handle error while deleting an existing member', async() => {
    prismaMock.member.findUnique.mockResolvedValue(mockMember);
    prismaMock.member.delete.mockRejectedValue(new Error('Database Error'));

    const response = await deleteMember(mockRequest(mockRequestData), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error deleting member' });
  });

  it('should login a member', async() => {
    const thisMockRequestData = {
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };

    prismaMock.member.findFirst.mockResolvedValue(mockMember);
    bcryptMocked.compare.mockResolvedValue(true);
    prismaMock.$queryRaw.mockResolvedValue([mockMember]);

    const response = await loginMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member successfully logged in' });
  });

  it('should handle error when member with provided emailaddress not found while logging in', async() => {
    const thisMockRequestData = {
      emailaddress: 'nonexistent@example.com',
      password: 'password'
    };

    prismaMock.member.findFirst.mockResolvedValue(null);

    const response = await loginMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should handle error when password does not match while logging in', async() => {
    const thisMockRequestData = {
      emailaddress: 'john.doe@example.com',
      password: 'wrongpassword'
    };

    prismaMock.member.findFirst.mockResolvedValue(mockMember);
    bcryptMocked.compare.mockResolvedValue(false);
    prismaMock.$queryRaw.mockResolvedValue([{ ...mockMember, password: 'wrongpasswordhash' }]);

    const response = await loginMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should handle error while logging in', async() => {
    prismaMock.member.findFirst.mockRejectedValue(new Error('Database Error'));

    const thisMockRequestData = {
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };

    const response = await loginMember(mockRequest({ ...mockRequestData, body: thisMockRequestData }), mockResponse());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error logging in member' });
  });

  it('should logout a member', async() => {
    const mockRequestInstance = mockRequest({
      ...mockRequestData,
      header: { Authorization: 'Bearer mock_token' }
    });

    mockRequestInstance.header = jest.fn().mockReturnValue('mock_token');

    const response = await logoutMember(mockRequest(mockRequestInstance), mockResponse());

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member successfully logged out' });
  });

  it('should handle error when token is missing while logging out', async() => {
    const mockRequestInstance = mockRequest({
      ...mockRequestData,
      header: { Authorization: 'Bearer' }
    });

    mockRequestInstance.header = jest.fn().mockReturnValue('');

    const response = await logoutMember(mockRequest(mockRequestInstance), mockResponse());

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorized: Token is missing' });
  });

  it('should update member password', async() => {
    const thisMockRequestData = {
      currentPassword: 'password',
      newPassword: 'newpassword'
    };

    prismaMock.member.findUnique.mockResolvedValue(mockMember);
    bcryptMocked.compare.mockResolvedValue(true);

    const response = await updateMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ message: 'Password successfully updated' });
  });

  it('should handle error when current password is incorrect while updating member password', async() => {
    const thisMockRequestData = {
      currentPassword: 'wrongpassword',
      newPassword: 'newpassword'
    };

    prismaMock.member.findUnique.mockResolvedValue(mockMember);
    bcryptMocked.compare.mockResolvedValue(false);

    const response = await updateMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Current password is incorrect' });
  });

  it('should handle error while updating member password', async() => {
    prismaMock.member.findUnique.mockRejectedValue(new Error('Database Error'));

    const thisMockRequestData = {
      currentPassword: 'password',
      newPassword: 'newpassword'
    };

    const response = await updateMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error updating password' });
  });

  it('should reset member password', async() => {
    const thisMockRequestData = { emailaddress: 'john.doe@example.com' };

    prismaMock.member.findFirst.mockResolvedValue(mockMember);

    const response = await resetMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ message: 'Password reset email sent successfully' });
  });

  it('should handle error when email address is missing while resetting member password', async() => {
    const thisMockRequestData = {
      // Missing emailaddress
    };

    const response = await resetMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Email address is required' });
  });

  it('should handle error when member with provided email address not found while resetting member password', async() => {
    const thisMockRequestData = { emailaddress: 'nonexistent@example.com' };

    prismaMock.member.findFirst.mockResolvedValue(null);

    const response = await resetMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it('should confirm reset member password', async() => {
    const thisMockRequestData = {
      token: 'validtoken',
      newPassword: 'newpassword'
    };

    const decodedToken = { memberId: mockMember.id };

    jwtMock.verify.mockReturnValue(decodedToken);
    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    const response = await confirmResetMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ message: 'Password successfully updated' });
  });

  it('should handle error when token is missing while confirming reset member password', async() => {
    const thisMockRequestData = {
      // Missing token
      newPassword: 'newpassword'
    };

    const response = await confirmResetMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Both token and newPassword are required' });
  });

  it('should handle error when newPassword is missing while confirming reset member password', async() => {
    const thisMockRequestData = {
      token: 'validtoken'
      // Missing newPassword
    };

    const response = await confirmResetMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Both token and newPassword are required' });
  });

  it('should handle error when member with decoded token is not found while confirming reset member password', async() => {
    const thisMockRequestData = {
      token: 'validtoken',
      newPassword: 'newpassword'
    };

    const decodedToken = { memberId: mockMember.id };

    jwtMock.verify.mockReturnValue(decodedToken);
    prismaMock.member.findUnique.mockResolvedValue(null);

    const response = await confirmResetMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it('should handle error while confirming reset member password', async() => {
    const thisMockRequestData = {
      token: 'validtoken',
      newPassword: 'newpassword'
    };

    const decodedToken = { memberId: mockMember.id };

    jwtMock.verify.mockReturnValue(decodedToken);
    prismaMock.member.findUnique.mockRejectedValue(new Error('Database Error'));

    const response = await confirmResetMemberPassword(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error updating password' });
  });

  it('should update member settings', async() => {
    const thisMockRequestData = {
      theme: 2,
      measurementsystem: 1,
      usepantry: true,
      usenegativepantry: true,
      displaynutritionalinformation: true
    };

    prismaMock.membersettings.findUnique.mockResolvedValue(mockMemberSettings);

    const response = await updateMemberSettings(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member settings successfully updated' });
  });

  it('should handle error when member settings not found while updating member settings', async() => {
    const thisMockRequestData = {
      theme: 2,
      measurementsystem: 1,
      usepantry: true,
      usenegativepantry: true,
      displaynutritionalinformation: true
    };

    prismaMock.membersettings.findUnique.mockResolvedValue(null);

    const response = await updateMemberSettings(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member settings not found' });
  });

  it("should handle error when user doesn't own the member settings while updating member settings", async() => {
    const thisMockRequestData = {
      theme: 2,
      measurementsystem: 1,
      usepantry: true,
      usenegativepantry: true,
      displaynutritionalinformation: true
    };

    prismaMock.membersettings.findUnique.mockResolvedValue(mockMemberSettings);

    const localMockRequestData = cloneDeep(mockRequestData);

    localMockRequestData.memberId = 2;

    const response = await updateMemberSettings(
      mockRequest({ ...localMockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorised: This member does not belong to you' });
  });

  it('should handle error while updating member settings', async() => {
    const thisMockRequestData = {
      theme: 2,
      measurementsystem: 1,
      usepantry: true,
      usenegativepantry: true,
      displaynutritionalinformation: true
    };

    prismaMock.membersettings.findUnique.mockRejectedValue(new Error('Database Error'));

    const response = await updateMemberSettings(
      mockRequest({ ...mockRequestData, body: thisMockRequestData }),
      mockResponse()
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error updating member settings' });
  });
});
