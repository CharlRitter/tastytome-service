import { Request } from 'express';

export type MockRequest = {
  session?: any;
  params?: any;
  body?: any;
  query?: any;
  headers?: { [name: string]: string };
  header?: (name: string) => string | undefined;
  memberId?: number;
};

export type CustomMockRequest = Request & MockRequest;
