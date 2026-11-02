const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes')
const createPath=async (req,res)=>{
    const {title,description}=req.body;
    if (!title || !description) {
        throw NotFoundError("Can not create a path without either title or description")
    }
    const newPath=await prisma.LearningPath.create({
        data:{
            title,
            description,
            managerId:req.user.id
        }
    });
    return res.status(StatusCodes.CREATED).json(newPath);
}
const listPaths=async (req,res)=>{
    const {title,
        status,
        search,
        page=1,
        limit=5
    }=req.query;
    let filters={}
    if (title) filters.title=title;
    if (status) filters.status=status;

    if (search){
        filters.OR=[
            {title:{contains:search,
                mode:'insensitive'
            }},
            {status:{
                contains:search,
                mode:'insensitive'
            }}
        ]
    }
    const pageNum=Math.max(1,parseInt(page));
    const limNum=Math.max(1,parseInt(limit));
    const skipSum=(pageNum-1)*limNum;

    const [tc,tl]=await Promise.all([
        prisma.LearningPath.count({where:filters}),
        prisma.LearningPath.findMany({
            where:filters,
            skip:skipSum,
            take:limNum,
            orderBy:{
                createdAt:'desc'
            }
        })
    ]);
    return res.json({
        meta:{
            total_records:tc,
            current_page:pageNum,
            limit:limNum,
            total_pages:Math.ceil(tc/limNum)
        },
        paths:tl
    })
}
const submitStructure=async (req,res)=>{
    const pathId=req.params.id;
    const path=await prisma.LearningPath.findUnique({
        where:{id:pathId}
    })
    if (path.status!='DRAFT') {
        throw new BadRequestError("Only draft structure can be sent for approval");
    }
    const updatedPath=await prisma.LearningPath.update({
        where:{id:pathId},
        data:{
            status:'PENDING_STRUCTURE_APPROVAL',
            rejectReason:null
        }
    })
    const moderator=await prisma.user.findFirst({
            where:{role:'MODERATOR'}
        });
        if (moderator){
            await prisma.notification.create({
                data:{
                    userId:moderator.id,
                    type:'PATH_APPROVAL_REQUEST',
                    title:'Learning Path structure needs review',
                    message:`Structure for topic ${updatedPath.title}  is waiting for approval`,
                    referenceId:updatedPath.id
                }
            })
        }
    return res.status(StatusCodes.OK).json({
        message:'Structure sent to moderator for approval'
    })
}
const pendingPaths=async (req,res)=>{
    const pathsPending=await prisma.LearningPath.findMany({
        where:{
            status:{in:['PENDING_STRUCTURE_APPROVAL','PENDING_FINAL_APPROVAL']},
            
        },
        include:{subjects:true}
    })
    return res.status(StatusCodes.OK).json(pathsPending)
}
const moderatorResponse=async (req,res)=>{
    const pathId=req.params.id;
    let {action,reason}=req.body;

    const path=await prisma.LearningPath.findUnique({
        where:{id:pathId}
    });
    if (!path){
        throw new NotFoundError("Path does not exist with given id");
    }
    if (path.status!=='PENDING_STRUCTURE_APPROVAL' && path.status !=='PENDING_FINAL_APPROVAL'){
        throw new BadRequestError("This path does not need approval")
    }
    if (action==='reject'){
        if (!reason || reason.trim()==""){
            throw new NotFoundError("Rejection requires a valid reason")
        }
        const rejectedPath=await prisma.LearningPath.update({
            where:{id:pathId},
            data:{
                status:'DRAFT',
                rejectReason:reason
            }
        });
        await prisma.Notification.create({
            data:{
                userId:rejectedPath.managerId,
                type:'WORKFLOW_REJECTED',
                title:'Structure Rejected',
                message:`Your Learning Path structure with path id ${rejectedPath.id} needs further refinement`,
                referenceId:rejectedPath.id
            }
        })
        return res.status(200).json({
            message:"Path is rejected and reason has been provided with it"
        })
    }
    if (action='approved'){
        let nextStatus;
        if (path.status==='PENDING_STRUCTURE_APPROVAL'){
            nextStatus='STRUCTURE_APPROVED';
        } else if (path.status==='PENDING_FINAL_APPROVAL') {
            nextStatus='PUBLISHED'
        }
        const approvedPath=await prisma.LearningPath.update({
            where:{
                id:pathId
            },
            data:{status:nextStatus,
                rejectReason:null
            }
        });
        await prisma.Notification.create({
            data:{
                userId:approvedPath.managerId,
                type:'PATH_APPROVED',
                title:'Structure Rejected',
                message:`Your Learning Path structure with path id ${approvedPath.id} has been approved. You may ask for content now.`,
                referenceId:approvedPath.id
            }
        })
        return res.status(StatusCodes.OK).json({
            message:nextStatus==='STRUCTURE_APPROVED'
            ? "Structure Approved You may ask contributors to add contents":
            "Path fully approved Manager may assigned the path to the students",
            approvedPath
        })
    }
}
const updatePath=async (req,res)=> {
    const pathId=req.params.id;
    const {title,description}=req.body;
    const path=await prisma.LearningPath.findUnique({
        where:{id:pathId}
    });
    if (!path){
        throw new NotFoundError("Path does not exist with given id");
    }
    const updatedData={};
    if (title && title!==path.title){
        updatedData.title=title;
    }
    if (description && description!==path.description){
        updatedData.description=description;
    }
    const updatedPath=await prisma.LearningPath.update({
        where:{id:pathId},
        data:updatedData
    });
    return res.status(StatusCodes.OK).json(updatedPath);
}
module.exports={
    createPath,
    listPaths,
    submitStructure,
    pendingPaths,
    moderatorResponse,
    updatePath
}
