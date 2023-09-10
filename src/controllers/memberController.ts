import { Request, Response } from 'express';
import { member, membersettings } from '@prisma/client';
import { isEmpty } from 'lodash';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '@/utils/client';

interface Member extends member {
  membersettings: membersettings;
}

export async function getMember(request: Request, response: Response): Promise<Response<Member | { message: string }>> {
  try {
    const { memberId } = request;
    const memberContent = await prisma.member.findUnique({
      where: { id: memberId },
      include: { membersettings: true }
    });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    return response.status(200).json({ data: memberContent });
  } catch (error) {
    return response.status(500).json({ message: 'Error getting member by ID' });
  }
}

export async function createMember(request: Request, response: Response): Promise<Response<{ message: string }>> {
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

    let memberContent = await prisma.member.findFirst({ where: { emailaddress: memberData.emailaddress } });

    if (!isEmpty(memberContent)) {
      return response.status(409).json({ message: 'Member already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(memberData.password, salt);

    memberData.password = passwordHash;

    memberContent = await prisma.member.create({
      data: {
        firstname: memberData.firstname,
        lastname: memberData.lastname,
        emailaddress: memberData.emailaddress,
        ispremium: memberData.ispremium,
        password: memberData.password
      }
    });

    const token = `Bearer ${jwt.sign({ memberId: memberContent.id }, process.env.JWT_SECRET as Secret, { expiresIn: '6h' })}`;

    return response.setHeader('Authorization', token).status(201).json({ message: 'Member successfully created' });
  } catch (error) {
    return response.status(500).json({ message: 'Error creating member' });
  }
}

export async function updateMember(request: Request, response: Response): Promise<Response<{ message: string }>> {
  try {
    const memberData = request.body as Partial<member>;

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
    const memberContent = await prisma.member.findUnique({ where: { id: memberId } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    await prisma.member.update({
      where: { id: memberId },
      data: {
        firstname: memberData.firstname,
        lastname: memberData.lastname,
        emailaddress: memberData.emailaddress,
        ispremium: memberData.ispremium
      }
    });

    return response.status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error updating member' });
  }
}

export async function deleteMember(request: Request, response: Response): Promise<Response<{ message: string }>> {
  try {
    const { memberId } = request;
    const memberContent = await prisma.member.findUnique({ where: { id: memberId } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    await prisma.member.delete({ where: { id: memberId } });

    return response.status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error deleting member' });
  }
}

export async function loginMember(request: Request, response: Response): Promise<Response<{ message: string }>> {
  try {
    const { emailaddress, password } = request.body;

    const memberContent = await prisma.member.findFirst({ where: { emailaddress } });

    if (!memberContent) {
      return response.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, memberContent.password);

    if (!passwordMatches) {
      return response.status(401).json({ message: 'Invalid credentials' });
    }

    const token = `Bearer ${jwt.sign({ memberId: memberContent.id }, process.env.JWT_SECRET as Secret, { expiresIn: '6h' })}`;

    return response.setHeader('Authorization', token).status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error logging in member' });
  }
}

export async function logoutMember(request: Request, response: Response): Promise<Response<{ message: string }>> {
  try {
    const token = request.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return response.status(401).json({ message: 'Unauthorized: Token is missing' });
    }

    return response.setHeader('Authorization', '').status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error logging out member' });
  }
}

export async function updateMemberPassword(
  request: Request,
  response: Response
): Promise<Response<{ message: string }>> {
  try {
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
      return response.status(400).json({ message: 'Both currentPassword and newPassword are required' });
    }

    const { memberId } = request;
    const memberContent = await prisma.member.findUnique({ where: { id: memberId } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, memberContent.password);

    if (!passwordMatches) {
      return response.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.member.update({
      where: { id: memberId },
      data: { password: newPasswordHash }
    });

    return response.status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error updating password' });
  }
}

export async function resetMemberPassword(
  request: Request,
  response: Response
): Promise<Response<{ message: string }>> {
  try {
    const { emailaddress } = request.body;

    if (!emailaddress) {
      return response.status(400).json({ message: 'Email address is required' });
    }

    const memberContent = await prisma.member.findFirst({ where: { emailaddress } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    // TODO Implement password reset logic here (generate token and send email)

    return response.status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error resetting password' });
  }
}

export async function confirmResetMemberPassword(
  request: Request,
  response: Response
): Promise<Response<{ message: string }>> {
  try {
    const { token } = request.params;
    const { newPassword } = request.body;

    if (!token || !newPassword) {
      return response.status(400).json({ message: 'Both token and newPassword are required' });
    }

    // Verify the token and extract the member ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as Secret) as { memberId: number };

    const memberContent = await prisma.member.findUnique({ where: { id: decodedToken.memberId } });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.member.update({
      where: { id: decodedToken.memberId },
      data: { password: newPasswordHash }
    });

    return response.status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error updating password' });
  }
}

export async function updateMemberSettings(
  request: Request,
  response: Response
): Promise<Response<{ message: string }>> {
  try {
    const memberSettingsData = request.body as Partial<membersettings>;

    if (!memberSettingsData || isEmpty(memberSettingsData)) {
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
    const memberContent = await prisma.member.findUnique({
      where: { id: memberId },
      include: { membersettings: true }
    });

    if (isEmpty(memberContent)) {
      return response.status(404).json({ message: 'Member not found' });
    }

    const memberSettings = memberContent.membersettings;

    if (isEmpty(memberSettings)) {
      return response.status(404).json({ message: 'Member settings not found' });
    }

    const memberSettingsId = memberSettings.id;

    await prisma.membersettings.update({
      where: { id: memberSettingsId },
      data: {
        theme: memberSettingsData.theme,
        measurementsystem: memberSettingsData.measurementsystem,
        usepantry: memberSettingsData.usepantry,
        usenegativepantry: memberSettingsData.usenegativepantry,
        displaynutritionalinformation: memberSettingsData.displaynutritionalinformation
      }
    });

    return response.status(204);
  } catch (error) {
    return response.status(500).json({ message: 'Error updating member settings' });
  }
}
