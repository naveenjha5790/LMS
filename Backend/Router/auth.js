const {
    signup,
    login,
    listUsers,
    listContributor,
    listStudent,
    changeRole
}=require('../Controller/auth');
const {
    authorizeAdmin,
    authorizeManager,
    authorizeModerator
}=require('../Middleware/authorizeRoles')
const authenticateUser=require('../Middleware/authenticateUser')
const express=require('express');
const router=express.Router();
router.post('/signup',signup);
router.post('/login',login);
router.route('/users').get(authenticateUser,authorizeAdmin,listUsers)
router.route('/contributor').get(authenticateUser,authorizeModerator,listContributor)
router.route('/student').get(authenticateUser,authorizeManager,listStudent)
router.route('/changeRole').patch(authenticateUser,authorizeAdmin,changeRole)
module.exports=router;
