import { Request } from 'express';

export type MockRequest = {
  session?: any;
  params?: any;
  body?: any;
  header?: { [name: string]: string };
  memberId?: number;
};

export type CustomMockRequest = Request & MockRequest;
