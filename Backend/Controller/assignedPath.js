const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes');

const assignPath=async (req,res)=>{
    const pathId=req.params.id;
    const {studentId}=req.body;
    
    const path=await prisma.learningPath.findUnique({
        where:{id:pathId}
    })
    if (!path){
        throw new NotFoundError("No path exist with the ID to assign")
    }
    if (!studentId){
        throw new NotFoundError("Need to give student Id to assign a learning path")
    }
    const newAssignment=await prisma.studentPath.create({
        data:{
           studentId,
           learningPathId:pathId 
        }
    });
    await prisma.notification.create({
        data:{
            userId:studentId,
            type:'PATH_ASSIGNED',
            title:'Path Assigned',
            message:`You have been assigned a path titled ${path.title}`,
            referenceId:path.id
        }
    })
    return res.status(StatusCodes.CREATED).json(newAssignment)
}
const showAssignments=async (req,res)=>{
    const {
        search,
        limit=5,
        page=1
    }=req.query;
    
    const pageNum=Math.max(1,parseInt(page));
    const limNum=Math.max(1,parseInt(limit));
    const skipSum=(pageNum-1)*limNum;

    const [ch,tch]=await Promise.all([
        prisma.StudentPath.count({where:filters}),
        prisma.StudentPath.findMany({
            skip:skipSum,
            take:limNum,
            orderBy:{
                assignedAt:'desc'
            }
        })
    ]);
    return res.json({
        meta:{
            total_records:ch,
            current_page:pageNum,
            limit:limNum,
            total_pages:Math.ceil(ch/limNum)
        },
        paths:tch
        }
    )
}
module.exports={
    assignPath,
    showAssignments
}