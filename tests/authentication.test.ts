import jwt from 'jsonwebtoken';

import { CLEAR_COOKIE_SETTINGS } from '@/constants/jwt';
import { authenticateMember } from '@/middleware/authenticationMiddleware';

import { mockNext, mockRequest, mockResponse } from './mocks/express';

jest.mock('jsonwebtoken');
jest.mock('@/controllers/memberController', () => ({ logoutMember: jest.fn().mockResolvedValue({}) }));

describe('authenticateMember middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'mock_secret';
  });

  const validRefreshToken = 'valid_refresh_token';
  const validToken = 'valid_token';
  const memberId = 1;
  const mockRequestInstance = mockRequest({ headers: {}, cookies: {} });
  const jwtMock = jwt as jest.Mocked<typeof import('jsonwebtoken')>;

  it('should return 401 if cookie is missing', async () => {
    mockRequestInstance.headers = { authorization: validToken };
    mockRequestInstance.cookies = {};

    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(mockRequestInstance, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Token not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is missing', async () => {
    mockRequestInstance.headers = {};
    mockRequestInstance.cookies = { refreshToken: validRefreshToken };

    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(mockRequestInstance, response, next);

    expect(response.header).toHaveBeenCalledWith('Authorization', '');
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken', CLEAR_COOKIE_SETTINGS);
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Token not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if cookie is invalid', async () => {
    mockRequestInstance.headers = { authorization: validToken };
    mockRequestInstance.cookies = { refreshToken: 'invalid_token' };

    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(mockRequestInstance, response, next);

    expect(response.header).toHaveBeenCalledWith('Authorization', '');
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken', CLEAR_COOKIE_SETTINGS);
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    mockRequestInstance.headers = { authorization: 'invalid_token' };
    mockRequestInstance.cookies = { refreshToken: validRefreshToken };
    jwtMock.verify.mockImplementation((token) => {
      if (token === 'invalid_token') {
        throw new Error('Invalid or expired token');
      } else {
        return { memberId };
      }
    });
    jwtMock.sign.mockImplementation((token) => {
      if (token === 'invalid_token') {
        throw new Error('Invalid or expired token');
      } else {
        return validToken;
      }
    });
    jwtMock.verify.mockImplementation(() => {
      throw new Error();
    });

    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(mockRequestInstance, response, next);

    expect(response.header).toHaveBeenCalledWith('Authorization', '');
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken', CLEAR_COOKIE_SETTINGS);
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set mockRequestInstance.memberId and call next for a valid token', async () => {
    mockRequestInstance.headers = { authorization: validToken };
    mockRequestInstance.cookies = { refreshToken: validRefreshToken };
    jwtMock.verify.mockImplementation((token) => {
      if (token === 'invalid_token') {
        throw new Error('Invalid or expired token');
      } else {
        return { memberId };
      }
    });
    jwtMock.sign.mockImplementation((token) => {
      if (token === 'invalid_token') {
        throw new Error('Invalid or expired token');
      } else {
        return validToken;
      }
    });
    jwtMock.verify.mockImplementation((token) => {
      if (token === 'invalid_token') {
        throw new Error('Invalid or expired token');
      } else {
        return { memberId };
      }
    });

    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(mockRequestInstance, response, next);

    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(mockRequestInstance.memberId).toBe(memberId);
  });
});
