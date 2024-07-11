import { member, membersettings } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cloneDeep } from 'lodash';

import {
  confirmResetMemberPassword,
  createMember,
  deleteMember,
  getMember,
  loginMember,
  logoutMember,
  resetMemberPassword,
  updateMember,
  updateMemberPassword,
  updateMemberSettings
} from '@/controllers/memberController';

import { mockRequest, mockResponse } from './mocks/express';
import { prismaMock } from './mocks/prisma';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Members', () => {
  const mockMemberSettings: membersettings = {
    id: 1,
    themeid: 1,
    usepantry: true,
    usenegativepantry: true,
    memberid: 1,
    createdat: new Date(),
    editedat: new Date()
  };
  const mockMember: member & { membersettings: membersettings | null } = {
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
  const baseRequestData = {
    headers: { Authorization: 'Bearer valid_token' },
    cookies: { refreshToken: 'valid_token' },
    memberId: mockMember.id
  };
  const jwtMock = jwt as jest.Mocked<typeof import('jsonwebtoken')>;
  const bcryptMocked = bcrypt as jest.Mocked<typeof import('bcrypt')>;

  it('should return member by ID', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);
    const responseMember = { data: mockMember };

    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    await getMember(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(responseMember);
  });

  it('should handle error when member not found while fetching member by ID', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.member.findUnique.mockResolvedValue(null);

    await getMember(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it('should handle error while fetching member by ID', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.member.findUnique.mockRejectedValue(new Error('Database Error'));

    await getMember(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error getting member by ID' });
  });

  it('should create a new member', async () => {
    process.env.JWT_SECRET = 'mock_secret';

    const requestData = {
      firstname: 'John',
      lastname: 'Doe',
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };
    const response = mockResponse();
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findFirst.mockResolvedValue(null);
    prismaMock.member.create.mockResolvedValue({
      ...requestData,
      id: 1,
      ispremium: false,
      createdat: new Date(),
      editedat: new Date()
    });
    jwtMock.sign.mockImplementation(() => {});

    await createMember(request, response);

    expect(jwtMock.sign).toHaveBeenCalledWith(expect.any(Object), expect.any(String), expect.any(Object));
    expect(jwtMock.sign).toHaveBeenCalledWith(expect.any(Object), expect.any(String), expect.any(Object));
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member successfully created' });
  });

  it('should handle error when required fields are missing while creating a new member', async () => {
    const response = mockResponse();
    const requestData = { ispremium: true };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    await createMember(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Required fields are missing: firstname, lastname, emailaddress, password'
    });
  });

  it('should handle error when fields are missing while creating a new member', async () => {
    const response = mockResponse();
    const request = mockRequest({ ...baseRequestData, body: {} });

    await createMember(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      data: {
        firstname: 'string',
        lastname: 'string',
        emailaddress: 'string',
        password: 'string',
        ispremium: 'boolean (optional)'
      }
    });
  });

  it('should handle error when member already exists while creating a new member', async () => {
    const response = mockResponse();
    const requestData = {
      firstname: 'John',
      lastname: 'Doe',
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findFirst.mockResolvedValue(mockMember);

    await createMember(request, response);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member already exists' });
  });

  it('should handle error while creating a new member', async () => {
    const response = mockResponse();
    const requestData = {
      firstname: 'John',
      lastname: 'Doe',
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.create.mockRejectedValue(new Error('Database Error'));

    await createMember(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error creating member' });
  });

  it('should update an existing member', async () => {
    const response = mockResponse();
    const requestData = {
      firstname: 'Updated John',
      lastname: 'Updated Doe'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    await updateMember(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('should handle error when fields are missing while updating an existing member', async () => {
    const response = mockResponse();
    const request = mockRequest({ ...baseRequestData, body: {} });

    await updateMember(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      data: {
        firstname: 'string (optional)',
        lastname: 'string (optional)',
        emailaddress: 'string (optional)',
        ispremium: 'boolean (optional)'
      }
    });
  });

  it('should handle error when member is not found while updating an existing member', async () => {
    const response = mockResponse();
    const requestData = {
      firstname: 'Updated John',
      lastname: 'Updated Doe'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findUnique.mockResolvedValue(null);

    await updateMember(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it('should handle error while updating an existing member', async () => {
    const response = mockResponse();
    const requestData = {
      firstname: 'Updated John',
      lastname: 'Updated Doe'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findUnique.mockResolvedValue(mockMember);
    prismaMock.member.update.mockRejectedValue(new Error('Database Error'));

    await updateMember(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error updating member' });
  });

  it('should delete an existing member', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    await deleteMember(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('should handle error when member is not found while deleting an existing member', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.member.findUnique.mockResolvedValue(null);

    await deleteMember(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it('should handle error while deleting an existing member', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    prismaMock.member.findUnique.mockResolvedValue(mockMember);
    prismaMock.member.delete.mockRejectedValue(new Error('Database Error'));

    await deleteMember(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error deleting member' });
  });

  it('should login a member', async () => {
    const response = mockResponse();
    const requestData = {
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findFirst.mockResolvedValue(mockMember);
    bcryptMocked.compare.mockImplementation(() => Promise.resolve(true));
    prismaMock.$queryRaw.mockResolvedValue([mockMember]);

    await loginMember(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('should handle error when member with provided emailaddress not found while logging in', async () => {
    const response = mockResponse();
    const requestData = {
      emailaddress: 'nonexistent@example.com',
      password: 'password'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findFirst.mockResolvedValue(null);

    await loginMember(request, response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should handle error when password does not match while logging in', async () => {
    const response = mockResponse();
    const requestData = {
      emailaddress: 'john.doe@example.com',
      password: 'wrongpassword'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findFirst.mockResolvedValue(mockMember);
    bcryptMocked.compare.mockImplementation(() => Promise.resolve(false));
    prismaMock.$queryRaw.mockResolvedValue([{ ...mockMember, password: 'wrongpasswordhash' }]);

    await loginMember(request, response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should handle error while logging in', async () => {
    const response = mockResponse();
    const requestData = {
      emailaddress: 'john.doe@example.com',
      password: 'password'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findFirst.mockRejectedValue(new Error('Database Error'));

    await loginMember(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error logging in member' });
  });

  it('should logout a member', async () => {
    const response = mockResponse();
    const request = mockRequest(baseRequestData);

    await logoutMember(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('should update member password', async () => {
    const response = mockResponse();
    const requestData = {
      currentPassword: 'password',
      newPassword: 'newpassword'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findUnique.mockResolvedValue(mockMember);
    bcryptMocked.compare.mockImplementation(() => Promise.resolve(true));

    await updateMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('should handle error when current password is incorrect while updating member password', async () => {
    const response = mockResponse();
    const requestData = {
      currentPassword: 'wrongpassword',
      newPassword: 'newpassword'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findUnique.mockResolvedValue(mockMember);
    bcryptMocked.compare.mockImplementation(() => Promise.resolve(false));

    await updateMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Current password is incorrect' });
  });

  it('should handle error while updating member password', async () => {
    const response = mockResponse();
    const requestData = {
      currentPassword: 'password',
      newPassword: 'newpassword'
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findUnique.mockRejectedValue(new Error('Database Error'));

    await updateMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error updating password' });
  });

  it('should reset member password', async () => {
    const response = mockResponse();
    const requestData = { emailaddress: 'john.doe@example.com' };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findFirst.mockResolvedValue(mockMember);

    await resetMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('should handle error when email address is missing while resetting member password', async () => {
    const response = mockResponse();
    const request = mockRequest({ ...baseRequestData, body: {} });

    await resetMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Email address is required' });
  });

  it('should handle error when member with provided email address not found while resetting member password', async () => {
    const response = mockResponse();
    const requestData = { emailaddress: 'nonexistent@example.com' };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findFirst.mockResolvedValue(null);

    await resetMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it('should confirm reset member password', async () => {
    const response = mockResponse();
    const requestData = {
      params: { token: 'validtoken' },
      body: { newPassword: 'newpassword' }
    };
    const request = mockRequest({ ...baseRequestData, ...requestData });

    const decodedToken = { memberId: mockMember.id };

    jwtMock.verify.mockImplementation(() => decodedToken);

    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    await confirmResetMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ message: 'Password successfully reset' });
  });

  it('should handle error when token is missing while confirming reset member password', async () => {
    const response = mockResponse();
    const requestData = {
      params: {},
      body: { newPassword: 'newpassword' }
    };
    const request = mockRequest({ ...baseRequestData, ...requestData });

    await confirmResetMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Both token and newPassword are required' });
  });

  it('should handle error when newPassword is missing while confirming reset member password', async () => {
    const response = mockResponse();
    const requestData = {
      params: { token: 'validtoken' },
      body: {}
    };
    const request = mockRequest({ ...baseRequestData, ...requestData });

    await confirmResetMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Both token and newPassword are required' });
  });

  it('should handle error when member with decoded token is not found while confirming reset member password', async () => {
    const response = mockResponse();
    const requestData = {
      params: { token: 'validtoken' },
      body: { newPassword: 'newpassword' }
    };
    const request = mockRequest({ ...baseRequestData, ...requestData });

    const decodedToken = { memberId: mockMember.id };

    jwtMock.verify.mockImplementation(() => decodedToken);
    prismaMock.member.findUnique.mockResolvedValue(null);

    await confirmResetMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it('should handle error while confirming reset member password', async () => {
    const response = mockResponse();
    const requestData = {
      params: { token: 'validtoken' },
      body: { newPassword: 'newpassword' }
    };
    const request = mockRequest({ ...baseRequestData, ...requestData });

    const decodedToken = { memberId: mockMember.id };

    jwtMock.verify.mockImplementation(() => decodedToken);
    prismaMock.member.findUnique.mockRejectedValue(new Error('Database Error'));

    await confirmResetMemberPassword(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error confirming reset password' });
  });

  it('should update member settings', async () => {
    const response = mockResponse();
    const requestData = {
      theme: 2,
      measurementsystem: 1,
      usepantry: true,
      usenegativepantry: true
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findUnique.mockResolvedValue(mockMember);

    await updateMemberSettings(request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('should handle error when member not found while updating member settings', async () => {
    const response = mockResponse();
    const requestData = {
      theme: 2,
      measurementsystem: 1,
      usepantry: true,
      usenegativepantry: true
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findUnique.mockResolvedValue(null);

    await updateMemberSettings(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member not found' });
  });

  it('should handle error when member settings not found while updating member settings', async () => {
    const response = mockResponse();
    const requestData = {
      theme: 2,
      measurementsystem: 1,
      usepantry: true,
      usenegativepantry: true
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });
    const tempMockMember = cloneDeep(mockMember);

    tempMockMember.membersettings = null;

    prismaMock.member.findUnique.mockResolvedValue(tempMockMember);

    await updateMemberSettings(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Member settings not found' });
  });

  it('should handle error while updating member settings', async () => {
    const response = mockResponse();
    const requestData = {
      theme: 2,
      measurementsystem: 1,
      usepantry: true,
      usenegativepantry: true
    };
    const request = mockRequest({ ...baseRequestData, body: requestData });

    prismaMock.member.findUnique.mockRejectedValue(new Error('Database Error'));

    await updateMemberSettings(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error updating member settings' });
  });
});
