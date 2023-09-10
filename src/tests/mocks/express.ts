import { NextFunction, Response } from 'express';
import { MockRequest, CustomMockRequest } from '@/types/tests';

export function mockRequest({ session, params, body, query, header, memberId }: MockRequest): CustomMockRequest {
  return {
    session,
    params,
    body,
    query,
    header,
    memberId
  } as CustomMockRequest;
}

export function mockResponse(): Response {
  const response: Response = {} as Response;

  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  response.header = jest.fn().mockReturnValue(response);
  response.setHeader = jest.fn().mockReturnValue(response);

  return response;
}

export function mockNext(): NextFunction {
  return jest.fn();
}
