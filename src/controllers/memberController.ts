import { member, membersettings } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { isEmpty } from 'lodash';

import { CLEAR_COOKIE_SETTINGS, COOKIE_SETTINGS } from '@/constants/jwt';
import { Error } from '@/types/common';
import prismaClient from '@/utils/client';
import { logger } from '@/utils/logger';

type Member = member & {
  membersettings: membersettings;
};

export async function getMember(request: Request, response: Response): Promise<Response<Member | Error>> {
  try {
    const { memberId } = request;
    const memberContent = await prismaClient.member.findUnique({
      where: { id: memberId },
      include: { membersettings: { include: { measurementsystem: true, theme: true } } }
    });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    return response.status(200).json({ data: memberContent });
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error getting member by ID' });
  }
}

export async function createMember(request: Request, response: Response): Promise<Response<Error>> {
  try {
    const memberData: Omit<member, 'id'> & { password: string } = request.body;

    if (!memberData || isEmpty(memberData)) {
      const schema = {
        firstname: 'string',
        lastname: 'string',
        emailaddress: 'string',
        password: 'string',
        ispremium: 'boolean (optional)'
      };

      return response.status(200).json({ data: schema });
    }

    const requiredFields: Array<keyof member> = ['firstname', 'lastname', 'emailaddress', 'password'];
    const missingFields = requiredFields.filter((field) => !(field in memberData));

    if (missingFields.length > 0) {
      return response.status(400).json({ message: `Required fields are missing: ${missingFields.join(', ')}` });
    }

    let memberContent = await prismaClient.member.findFirst({ where: { emailaddress: memberData.emailaddress } });

    if (!isEmpty(memberContent)) {
      return response.status(409).json({ message: 'Member already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(memberData.password, salt);

    memberData.password = passwordHash;

    memberContent = await prismaClient.member.create({
      data: {
        firstname: memberData.firstname,
        lastname: memberData.lastname,
        emailaddress: memberData.emailaddress,
        ispremium: memberData.ispremium,
        password: memberData.password
      }
    });

    const jwtToken = `Bearer ${jwt.sign({ memberId: memberContent.id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
    const refreshToken = jwt.sign({ memberId: memberContent.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return response
      .header('Authorization', jwtToken)
      .cookie('refreshToken', refreshToken, COOKIE_SETTINGS)
      .status(201)
      .json({ message: 'Member successfully created' });
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error creating member' });
  }
}

export async function updateMember(request: Request, response: Response): Promise<Response<Error>> {
  try {
    const memberData = request.body;

    if (!memberData || isEmpty(memberData)) {
      const schema = {
        firstname: 'string (optional)',
        lastname: 'string (optional)',
        emailaddress: 'string (optional)',
        ispremium: 'boolean (optional)'
      };

      return response.status(200).json({ data: schema });
    }

    const { memberId } = request;
    const memberContent = await prismaClient.member.findUnique({ where: { id: memberId } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    await prismaClient.member.update({
      where: { id: memberId },
      data: {
        firstname: memberData.firstname,
        lastname: memberData.lastname,
        emailaddress: memberData.emailaddress,
        ispremium: memberData.ispremium
      }
    });

    return response.status(204).json();
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error updating member' });
  }
}

export async function deleteMember(request: Request, response: Response): Promise<Response<Error>> {
  try {
    const { memberId } = request;
    const memberContent = await prismaClient.member.findUnique({ where: { id: memberId } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    await prismaClient.member.delete({ where: { id: memberId } });

    return response.status(204).json();
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error deleting member' });
  }
}

export async function loginMember(request: Request, response: Response): Promise<Response<Error>> {
  try {
    const { emailaddress, password } = request.body;

    const memberContent = await prismaClient.member.findFirst({ where: { emailaddress } });

    if (!memberContent) {
      return response.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, memberContent.password);

    if (!passwordMatches) {
      return response.status(401).json({ message: 'Invalid credentials' });
    }

    const jwtToken = `Bearer ${jwt.sign({ memberId: memberContent.id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
    const refreshToken = jwt.sign({ memberId: memberContent.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return response
      .header('Authorization', jwtToken)
      .cookie('refreshToken', refreshToken, COOKIE_SETTINGS)
      .status(204)
      .json();
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error logging in member' });
  }
}

export async function logoutMember(request: Request, response: Response): Promise<Response<Error>> {
  try {
    return response.header('Authorization', '').clearCookie('refreshToken', CLEAR_COOKIE_SETTINGS).status(204).json();
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error logging out member' });
  }
}

export async function updateMemberPassword(request: Request, response: Response): Promise<Response<Error>> {
  try {
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
      return response.status(400).json({ message: 'Both currentPassword and newPassword are required' });
    }

    const { memberId } = request;
    const memberContent = await prismaClient.member.findUnique({ where: { id: memberId } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, memberContent.password);

    if (!passwordMatches) {
      return response.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prismaClient.member.update({
      where: { id: memberId },
      data: { password: newPasswordHash }
    });

    return response.status(204).json();
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error updating password' });
  }
}

export async function resetMemberPassword(request: Request, response: Response): Promise<Response<Error>> {
  try {
    const { emailaddress } = request.body;

    if (!emailaddress) {
      return response.status(400).json({ message: 'Email address is required' });
    }

    const memberContent = await prismaClient.member.findFirst({ where: { emailaddress } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    // TODO Implement password reset logic here (generate token and send email)

    return response.status(204).json();
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error resetting password' });
  }
}

export async function confirmResetMemberPassword(request: Request, response: Response): Promise<Response<Error>> {
  try {
    const { token } = request.params;
    const { newPassword } = request.body;

    if (!token || !newPassword) {
      return response.status(400).json({ message: 'Both token and newPassword are required' });
    }

    // Verify the token and extract the member ID

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    } catch (err) {
      return response
        .header('Authorization', '')
        .clearCookie('refreshToken', CLEAR_COOKIE_SETTINGS)
        .status(401)
        .json({ message: 'Invalid or expired token' });
    }

    const memberId = parseInt(decoded.memberId, 10);
    const memberContent = await prismaClient.member.findUnique({ where: { id: memberId } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prismaClient.member.update({
      where: { id: memberId },
      data: { password: newPasswordHash }
    });

    return response.status(204).json();
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error updating password' });
  }
}

export async function updateMemberSettings(request: Request, response: Response): Promise<Response<Error>> {
  try {
    const memberSettingsData: membersettings | Record<string, never> = request.body;

    if (!memberSettingsData) {
      const schema = {
        theme: 'integer (optional)',
        measurementsystem: 'integer (optional)',
        usepantry: 'boolean (optional)',
        usenegativepantry: 'boolean (optional)',
        displaynutritionalinformation: 'boolean (optional)'
      };

      return response.status(200).json({ data: schema });
    }

    const { memberId } = request;
    const memberContent = await prismaClient.member.findUnique({
      where: { id: memberId },
      include: { membersettings: true }
    });

    if (!memberContent) {
      return response.status(404).json({ message: 'Member not found' });
    }

    const memberSettings = memberContent.membersettings;

    if (!memberSettings) {
      return response.status(404).json({ message: 'Member settings not found' });
    }

    const memberSettingsId = memberSettings.id;

    await prismaClient.membersettings.update({
      where: { id: memberSettingsId },
      data: {
        themeid: memberSettingsData.themeid,
        measurementsystemid: memberSettingsData.measurementsystemid,
        usepantry: memberSettingsData.usepantry,
        usenegativepantry: memberSettingsData.usenegativepantry,
        displaynutritionalinformation: memberSettingsData.displaynutritionalinformation
      }
    });

    return response.status(204).json();
  } catch (error: any) {
    logger.error(error);

    return response.status(500).json({ message: 'Error updating member settings' });
  }
}
