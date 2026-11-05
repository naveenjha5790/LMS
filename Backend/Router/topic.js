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
    createTopic,
    listTopics,
    updateTopic,
    deleteTopic,
    moderatorTopicResponse,
    requestTopicApproval,
    pendingTopic
}=require('../Controller/Topic');
router.route('/:chId/topics').post(authenticateUser,authorizeManager,createTopic).get(authenticateUser,listTopics);
router.route('/topics/:tId').patch(authenticateUser,authorizeManager,updateTopic).delete(authenticateUser,authorizeManager,deleteTopic)
router.route('/:tid/response').patch(authenticateUser,authorizeModerator,moderatorTopicResponse);
router.route('/:tid/approvalRequest').patch(authenticateUser,authrorizeContributor,requestTopicApproval);
router.route('/pendingTopics').get(authenticateUser,authorizeModerator,pendingTopic)
module.exports=router;