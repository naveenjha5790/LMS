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
    createSubject,
    showSubjects,
    updateSubject,
    deleteSubject
}=require('../Controller/subject');
router.route('/:id/subject').post(authenticateUser,authorizeManager,createSubject).get(authenticateUser,showSubjects);
router.route('/subjects/:subId').patch(authenticateUser,authorizeManager,updateSubject).delete(authenticateUser,authorizeManager,deleteSubject)
module.exports=router;
