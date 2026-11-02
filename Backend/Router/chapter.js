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
    createChapter,
    listChapters,
    updateChapter,
    deleteChapter
}=require('../Controller/chapter');
router.route('/:subId/chapters').post(authenticateUser,authorizeManager,createChapter).get(authenticateUser,authrorizeStaff,listChapters);
router.route('/chapters/:chId').patch(authenticateUser,authorizeManager,updateChapter).delete(authenticateUser,authorizeManager,deleteChapter)
module.exports=router;
