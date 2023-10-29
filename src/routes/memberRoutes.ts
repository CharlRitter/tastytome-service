import { Router } from 'express';

import {
  confirmResetMemberPassword,
  createMember,
  deleteMember,
  getMember,
  loginMember,
  logoutMember,
  resetMemberPassword,
  updateMember,
  updateMemberPassword,
  updateMemberSettings
} from '@/controllers/memberController';
import { authenticateMember } from '@/middleware/authenticationMiddleware';

export const memberRoutes = Router();

memberRoutes.post('/v1/member', createMember);
memberRoutes.get('/v1/member', authenticateMember, getMember);
memberRoutes.put('/v1/member', authenticateMember, updateMember);
memberRoutes.delete('/v1/member', authenticateMember, deleteMember);

memberRoutes.put('/v1/member/password/update', authenticateMember, updateMemberPassword);
memberRoutes.put('/v1/member/password/reset', resetMemberPassword);
memberRoutes.put('/v1/member/password/reset/:token', confirmResetMemberPassword);

memberRoutes.post('/v1/member/login', loginMember);
memberRoutes.post('/v1/member/logout', logoutMember);

memberRoutes.put('/v1/member/settings', authenticateMember, updateMemberSettings);
