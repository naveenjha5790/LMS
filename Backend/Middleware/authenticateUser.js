const jwt=require('jsonwebtoken');
const {unauthenticatedError}=require('../Errors');
const UnauthenticatedError = require('../Errors/unauthenticated');
const authenticateUser=async (req,res,next)=>{
    const authHeader=req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return next(new UnauthenticatedError('AUthentication Invalid'))
    }
    const token=authHeader.split(' ')[1];
    try{
        const payload=jwt.verify(token,process.env.JWT_SECRET);
        req.user={
            id:payload.id,
            name:payload.name,
            role:payload.role
        };
        next();
    }
    catch (error){
        return next(new UnauthenticatedError("Authentication Failed"));
    }
}
module.exports=authenticateUser;