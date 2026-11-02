const {StatusCodes}=require('http-status-codes');
const bcrypt=require('bcryptjs');
const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const jwt=require('jsonwebtoken');
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const signup=async (req,res)=>{
    const {email,name,password}=req.body;
    if (!email.includes('@')){
        return res.status(StatusCodes.NOT_ACCEPTABLE).json({error:
            "Please Enter a valid email address"})
    }
    if (!password || password.length<8){
        return res.status(StatusCodes.LENGTH_REQUIRED).json({
            error:"Password must at least be of 8 length"
        })

    }
    
        const hashedPassword=await bcrypt.hash(password,10);
        const newuser=await prisma.user.create({
            data:{
                email,
                passwordHash:hashedPassword,
                name,
                role:'STUDENT'
            }
        })
        return res.status(StatusCodes.OK).json({
            message:"Registeration successfull!. Please Login to Continue"
        })
    
}

const login=async (req,res)=>{
    const {email,password}=req.body;
    if (!email || !password){
        throw new BadRequestError(
            "Please provide email and password to login"
        )
    }
    const users=await prisma.user.findUnique({
        where:{email:email}
    });
    if (!users){
        throw new NotFoundError("User doesn't exist")
    }
    const isPasswordValid=await bcrypt.compare(password,users.passwordHash);
    if (!isPasswordValid){
        throw new UnauthenticatedError("Invalid password")
    }
    const copyUser={
        id:users.id,
        email:users.email,
        role:users.role
    }
    const token=jwt.sign(copyUser,process.env.JWT_SECRET,
        {expiresIn:'8h'}
    );
    res.cookie('authToken', token, {
            httpOnly: true,    
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax',    
            maxAge: 28800000    
        });
        return res.json({
            message:"Login Successful",
            token:token,
            users:{
                id:users.id,
                email:users.email,
                name:users.name,
                role:users.role


            }
        })
    }
const listUsers=async (req,res)=>{
    const curUser=req.user;
    const page=parseInt(req.query.page) || 1;
    const limit=10;
    const skip=(page -1)*limit;

    const [totalUsers,users]=await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
            skip: skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                },
                orderBy: {
                    name: 'asc'
                }
        })
    ])
    const totalPages = Math.ceil(totalUsers / limit);
    return res.status(StatusCodes.OK).json({
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                limit
            }
        });
}
const listContributor=async (req,res)=>{
    const curUser=req.user;
    const page=parseInt(req.query.page) || 1;
    const limit=5;
    const skip=(page -1)*limit;

    const [totalUsers,users]=await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
            skip: skip,
                take: limit,
                where:{
                    role:'CONTRIBUTOR'
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                },
                orderBy: {
                    name: 'asc'
                }
        })
    ])
    const totalPages = Math.ceil(totalUsers / limit);
    return res.status(StatusCodes.OK).json({
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                limit
            }
        });
}
const listStudent=async (req,res)=>{
    const curUser=req.user;
    const page=parseInt(req.query.page) || 1;
    const limit=5;
    const skip=(page -1)*limit;

    const [totalUsers,users]=await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
            skip: skip,
                take: limit,
                where:{
                    role:'STUDENT'
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                },
                orderBy: {
                    name: 'asc'
                }
        })
    ])
    const totalPages = Math.ceil(totalUsers / limit);
    return res.status(StatusCodes.OK).json({
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                limit
            }
        });
}
const changeRole=async (req,res)=>{
    const {email, newRole}=req.body;
    const allowedRoles=['LMS_MANAGER','CONTRIBUTOR','MODERATOR']
    if (!allowedRoles.includes(newRole)){
        throw new NotFoundError('Please provide a valid value')
    }
     const updatedUser=await prisma.user.update({
            where :{email:email},
            data:{role:newRole}
        });
        return res.json({
            message:`Successfully updated role`,
            user:{
                email:updatedUser.email,newRole:updatedUser.role
            }
        })

}
module.exports={
    login,
    signup,
    listUsers,
    listContributor,
    listStudent,
    changeRole
}