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
const {upload,
    uploadLocalVideo,
getVideos}=require('../Controller/videos');
router.route('/:tid/uploadVideos').post(authenticateUser,authrorizeContributor,upload.single('videoFile'),uploadLocalVideo).get(
    authenticateUser,authrorizeStaff,getVideos
)
module.exports=router;