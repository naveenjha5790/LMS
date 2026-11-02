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
getNotifications,
markAsRead,
markAllAsRead
}=require('../Controller/notification');
router.route('/notifications').get(authenticateUser,getNotifications);
router.route('/:id/markAsRead').patch(authenticateUser,markAsRead);
router.route('/notifications/markAllAsRead').patch(authenticateUser,markAllAsRead);
module.exports=router;