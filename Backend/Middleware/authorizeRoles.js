const {StatusCodes}=require('http-status-codes');
const authorizeAdmin=async (req,res,next)=>{
    if (req.user && req.user.role==='ADMIN'){
        return next()
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({
        error:"You are not allowed to access"
    })
}
const authorizeManager=async (req,res,next)=>{
    if (req.user && req.user.role==='LMS_MANAGER'){
        return next()
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({
        error:"You are not allowed to access"
    })
}
const authorizeModerator=async (req,res,next)=>{
    if (req.user && req.user.role==='MODERATOR'){
        return next()
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({
        error:"You are not allowed to access"
    })
}
const authrorizeContributor=async (req,res,next)=>{
    if (req.user && req.user.role==='CONTRIBUTOR'){
        return next();
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({
        error:"You are not allowed to access"
    })
}
const authorizeStudent=async (req,res,next)=>{
    if (req.user && req.user.role==='STUDENT'){
        return next()
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({
        error:"You are not allowed to access"
    })
}
const authrorizeStaff=async (req,res,next)=>{
    if (req.user && (req.user.role==='ADMIN' || req.user.role==='LMS_MANAGER' || req.user.role==='CONTRIBUTOR')){
        return next();
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({
        error:"You are not allowed to access"
    })
}
const authorizeStudentManager=async (req,res,next)=>{
    if (req.user && (req.user.role==='LMS_MANAGER' || req.user.role==='STUDENT' || req.user.role==='ADMIN')){
        return next();
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({error:"You are not allowed to access"});
}
module.exports={
    authorizeAdmin,
    authorizeManager,
    authorizeModerator,
    authrorizeContributor,
    authorizeStudent,
    authrorizeStaff,
    authorizeStudentManager
}