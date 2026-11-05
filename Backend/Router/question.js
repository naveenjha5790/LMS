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
    addQuestion,
    showQuestions,
    updateQuestion,
    removeQuestion
}=require('../Controller/question')
router.route('/:aid/questions').post(authenticateUser,authrorizeContributor,addQuestion).get(authenticateUser,showQuestions);
router.route('/questions/"qid').patch(authenticateUser,authrorizeContributor,updateQuestion).delete(authenticateUser,authrorizeContributor,removeQuestion);
module.exports=router;