const {
    authorizeAdmin,
    authorizeManager,
    authorizeModerator,
    authorizeStudent
}=require('../Middleware/authorizeRoles')
const authenticateUser=require('../Middleware/authenticateUser')
const express=require('express');
const router=express.Router();
const {
    videoDone,
    quizQuestions,
    viewProgress,submitQuiz
}=require('../Controller/progress');
router.route('/video/:mId').patch(authenticateUser,authorizeStudent,videoDone);
router.route('/:tId/quiz').get(authenticateUser,authorizeStudent,quizQuestions).post(authenticateUser,authorizeStudent,submitQuiz);
router.route('/progress').get(authenticateUser,viewProgress)
module.exports=router;