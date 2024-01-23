import { NextFunction, Request, Response } from 'express';

export function mockRequest(
  { params = {}, body = {}, query = {}, headers = {}, cookies = {}, memberId = undefined }: Partial<Request>
): Request {
  const request = {
    params: params as any,
    body: body as any,
    query: query as any,
    headers: headers as any,
    cookies: cookies as any,
    memberId,
    get: jest.fn(),
    accepts: jest.fn(),
    acceptsCharsets: jest.fn(),
    acceptsEncodings: jest.fn(),
    acceptsLanguages: jest.fn(),
    is: jest.fn()
  };

  return request as unknown as Request;
}

export function mockResponse(): Response {
  const response: Response = {} as any;

  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  response.header = jest.fn().mockReturnValue(response);
  response.clearCookie = jest.fn().mockReturnValue(response);
  response.cookie = jest.fn().mockReturnValue(response);

  return response;
}

export function mockNext(): NextFunction {
  return jest.fn();
}
