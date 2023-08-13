import { Router } from 'express';
import { authenticateMember } from '@/middleware/authenticationMiddleware';
import {
  getMemberById,
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
router.get('/v1/member/:id', authenticateMember, getMemberById);
router.put('/v1/member/:id', authenticateMember, updateMember);
router.delete('/v1/member/:id', authenticateMember, deleteMember);

router.put('/v1/member/password/update/:id', authenticateMember, updateMemberPassword);
router.put('/v1/member/password/reset', resetMemberPassword);
router.put('/v1/member/password/reset/:token', confirmResetMemberPassword);

router.post('/v1/member/login/:id', loginMember);
router.post('/v1/member/logout/:id', logoutMember);

router.put('/v1/member/settings/:id', authenticateMember, updateMemberSettings);

export default router;
