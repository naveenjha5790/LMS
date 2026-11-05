const {
    authorizeAdmin,
    authorizeManager,
    authorizeModerator,
    authrorizeStaff,
    authrorizeContributor
}=require('../Middleware/authorizeRoles')
const authenticateUser=require('../Middleware/authenticateUser')
const express=require('express');
const router=express.Router();
const {
    createAssesment,
    listAssesment,
    updateAssesment,
    deleteAssesment
}=require('../Controller/assesment');
const { update } = require('list');
router.route('/:tid/assessments').post(authenticateUser,authrorizeContributor,createAssesment).get(authenticateUser,listAssesment);
router.route('/assessments/:aid').patch(authenticateUser,authrorizeContributor,updateAssesment).delete(authenticateUser,authrorizeContributor,deleteAssesment)
module.exports=router;