import { NextFunction, Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';

import { CLEAR_COOKIE_SETTINGS } from '@/constants/jwt';
import { logger } from '@/utils/logger';

export async function authenticateMember(request: Request, response: Response, next: NextFunction) {
  try {
    const token = request.header('Authorization')?.replace('Bearer ', '');
    const cookie = request.cookies.refreshToken;

    if (!token || !cookie) {
      return response
        .header('Authorization', '')
        .clearCookie('refreshToken', CLEAR_COOKIE_SETTINGS)
        .status(401)
        .json({ message: 'Token not found' });
    }

    const newJwtToken = jwt.verify(cookie, process.env.JWT_SECRET, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        return response
          .header('Authorization', '')
          .clearCookie('refreshToken', CLEAR_COOKIE_SETTINGS)
          .status(401)
          .json({ error: 'Invalid or expired token' });
      }

      return `Bearer ${jwt.sign({ memberId: decoded.memberId }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
    });

    if (newJwtToken === undefined) {
      throw Error();
    }

    response.header('Authorization', newJwtToken);

    const memberId = jwt.verify(token, process.env.JWT_SECRET, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        return response
          .header('Authorization', '')
          .clearCookie('refreshToken', CLEAR_COOKIE_SETTINGS)
          .status(401)
          .json({ error: 'Invalid or expired token' });
      }

      return parseInt(decoded.memberId, 10);
    });

    if (memberId === undefined) {
      throw Error();
    }

    request.memberId = memberId;

    return next();
  } catch (error: any) {
    logger.error(error);

    return response.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}
