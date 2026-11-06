const {
    authorizeAdmin,
    authorizeManager,
    authorizeModerator,
    authrorizeStaff,
    authorizeStudentManager
}=require('../Middleware/authorizeRoles')
const authenticateUser=require('../Middleware/authenticateUser')
const express=require('express');
const router=express.Router();
const {
    assignPath,
    showAssignments,
    getCertificates
}=require('../Controller/assignedPath');
router.route('/:id/assign').post(authenticateUser,authorizeManager,assignPath);
router.route('/assignedPaths').get(authenticateUser,showAssignments);
router.route('/certificates').get(authenticateUser,authorizeStudentManager,getCertificates)
module.exports=router;
