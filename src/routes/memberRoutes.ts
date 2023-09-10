import { Router } from 'express';
import { authenticateMember } from '@/middleware/authenticationMiddleware';
import {
  getMember,
  createMember,
  updateMember,
  deleteMember,
  updateMemberSettings,
  loginMember,
  logoutMember,
  updateMemberPassword,
  resetMemberPassword,
  confirmResetMemberPassword
} from '@/controllers/memberController';

const router = Router();

router.post('/v1/member', createMember);
router.get('/v1/member', authenticateMember, getMember);
router.put('/v1/member', authenticateMember, updateMember);
router.delete('/v1/member', authenticateMember, deleteMember);

router.put('/v1/member/password/update', authenticateMember, updateMemberPassword);
router.put('/v1/member/password/reset', resetMemberPassword);
router.put('/v1/member/password/reset/:token', confirmResetMemberPassword);

router.post('/v1/member/login', loginMember);
router.post('/v1/member/logout', logoutMember);

router.put('/v1/member/settings', authenticateMember, updateMemberSettings);

export default router;
