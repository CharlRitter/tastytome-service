import { logoutMember } from '@/controllers/memberController';
import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

// eslint-disable-next-line import/prefer-default-export
export async function authenticateMember(request: Request, response: Response, next: NextFunction) {
  try {
    const token = request.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return response.status(401).json({ message: 'Unauthorized: Not provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as jwt.JwtPayload;
    const { memberId, iat: issuedAt, exp: validuntil } = decoded;

    if (!memberId || !validuntil || !issuedAt) {
      return response.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    const expirationDate = new Date(validuntil * 1000);
    const currentTime = new Date();
    const remainingMilliseconds = expirationDate.getTime() - currentTime.getTime();
    const oneHour = 3600000;

    if (remainingMilliseconds <= oneHour && remainingMilliseconds >= 0) {
      const newToken = `Bearer ${jwt.sign({ memberId }, process.env.JWT_SECRET as Secret, { expiresIn: '6h' })}`;

      response.setHeader('Authorization', newToken);
    } else if (currentTime >= expirationDate) {
      return await logoutMember(request, response);
    }

    request.memberId = parseInt(memberId, 10);

    return next();
  } catch (error) {
    return response.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}
