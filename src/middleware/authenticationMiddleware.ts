import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { CLEAR_COOKIE_SETTINGS } from '@/constants/jwt';
import { logger } from '@/utils/logger';

export async function authenticateMember(request: Request, response: Response, next: NextFunction) {
  try {
    const token = (typeof request.headers.authorization === 'string' ? request.headers.authorization : '').replace(
      'Bearer ',
      ''
    );
    const cookie = request.cookies.refreshToken;

    if (!token || !cookie) {
      return response
        .header('Authorization', '')
        .clearCookie('refreshToken', CLEAR_COOKIE_SETTINGS)
        .status(401)
        .json({ message: 'Token not found' });
    }

    const decodedCookie = jwt.verify(cookie, process.env.JWT_SECRET) as JwtPayload;
    const newJwtToken = jwt.sign({ memberId: decodedCookie.memberId }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    const decodedToken = jwt.verify(newJwtToken, process.env.JWT_SECRET) as JwtPayload;

    response.header('Authorization', `Bearer ${newJwtToken}`);
    request.memberId = parseInt(decodedToken.memberId, 10);
  } catch (error: any) {
    logger.error(error);

    return response
      .header('Authorization', '')
      .clearCookie('refreshToken', CLEAR_COOKIE_SETTINGS)
      .status(401)
      .json({ message: 'Invalid or expired token' });
  }

  return next();
}
