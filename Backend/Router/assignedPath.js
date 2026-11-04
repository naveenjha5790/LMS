const {
    authorizeAdmin,
    authorizeManager,
    authorizeModerator,
    authrorizeStaff
}=require('../Middleware/authorizeRoles')
const authenticateUser=require('../Middleware/authenticateUser')
const express=require('express');
const router=express.Router();
const {
    assignPath,
    showAssignments
}=require('../Controller/assignedPath');
router.route('/:id/assign').post(authenticateUser,authorizeManager,assignPath);
router.route('/assignedPaths').get(authenticateUser,showAssignments);
module.exports=router;
