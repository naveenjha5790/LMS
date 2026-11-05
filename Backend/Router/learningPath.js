const {
    authorizeAdmin,
    authorizeManager,
    authorizeModerator,
    authrorizeStaff
}=require('../Middleware/authorizeRoles')
const authenticateUser=require('../Middleware/authenticateUser')
const express=require('express');
const router=express.Router();
const {createPath,listPaths,
    submitStructure,
    pendingPaths,
    moderatorResponse,
    updatePath
}=require('../Controller/learningPath');
router.route('/paths').get(authenticateUser,listPaths).post(authenticateUser,authorizeManager,createPath);
router.route('/paths/:id/submitStructure').patch(authenticateUser,authorizeManager,submitStructure);
router.route('/paths/pending').get(authenticateUser,authorizeModerator,pendingPaths);
router.route('/paths/:id/approvalPending').patch(authenticateUser,authorizeModerator,moderatorResponse);
router.route('/paths/:id').patch(authenticateUser,authorizeManager,updatePath);
module.exports=router;