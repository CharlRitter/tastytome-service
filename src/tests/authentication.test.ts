import jwt from 'jsonwebtoken';
import { mockRequest, mockResponse, mockNext } from '@/tests/mocks/express';
import { logoutMember } from '@/controllers/memberController';
import { authenticateMember } from '@/middleware/authenticationMiddleware';

jest.mock('jsonwebtoken');
jest.mock('@/controllers/memberController', () => ({ logoutMember: jest.fn().mockResolvedValue({}) }));

describe('authenticateMember middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'mock_secret';
  });

  const validToken = 'valid_token';
  const memberId = '1';
  const mockRequestInstance = mockRequest({ headers: {} });
  const jwtMock = jwt as jest.Mocked<typeof import('jsonwebtoken')>;

  it('should return 401 if token is missing', async() => {
    mockRequestInstance.header = jest.fn().mockReturnValue(undefined);

    const request = mockRequest(mockRequestInstance);
    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorized: Not provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async() => {
    mockRequestInstance.header = jest.fn().mockReturnValue(new Error('Database Error'));
    jwtMock.verify.mockReturnValue();

    const request = mockRequest(mockRequestInstance);
    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if error', async() => {
    mockRequestInstance.header = jest.fn().mockReturnValue('invalid_token');
    jwtMock.verify.mockReturnValue();

    const request = mockRequest(mockRequestInstance);
    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set request.memberId and call next for a valid token', async() => {
    const validDecodedToken = {
      memberId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    mockRequestInstance.header = jest.fn().mockReturnValue(validToken);
    jwtMock.verify.mockImplementation(() => validDecodedToken);

    const request = mockRequest(mockRequestInstance);
    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(request, response, next);

    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(request.memberId).toBe(parseInt(memberId, 10));
  });

  it('should refresh token and call next for a token expiring within 1 hour', async() => {
    const soonToExpireDecodedToken = {
      memberId,
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) + 1
    };
    const newToken = 'new_refreshed_token';

    mockRequestInstance.header = jest.fn().mockReturnValue(validToken);
    jwtMock.verify.mockImplementation(() => soonToExpireDecodedToken);
    jwtMock.sign.mockImplementation(() => newToken);

    const request = mockRequest(mockRequestInstance);
    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(request, response, next);

    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(request.memberId).toBe(parseInt(memberId, 10));
    expect(response.setHeader).toHaveBeenCalledWith('Authorization', `Bearer ${newToken}`);
  });

  it('should call logoutMember if token cannot be refreshed', async() => {
    const soonToExpireDecodedToken = {
      memberId,
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000)
    };

    mockRequestInstance.header = jest.fn().mockReturnValue(validToken);
    jwtMock.verify.mockImplementation(() => soonToExpireDecodedToken);
    jwtMock.sign.mockImplementation(() => {});

    const request = mockRequest(mockRequestInstance);
    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(request, response, next);

    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(logoutMember).toHaveBeenCalledWith(request, response);
  });

  it('should return 401 with proper message for invalid token', async() => {
    const brokenDecodedToken = {
      memberId,
      iat: Math.floor(Date.now() / 1000)
    };

    mockRequestInstance.header = jest.fn().mockReturnValue('invalid_token');
    jwtMock.verify.mockImplementation(() => brokenDecodedToken);

    const request = mockRequest(mockRequestInstance);
    const response = mockResponse();
    const next = mockNext();

    await authenticateMember(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});
