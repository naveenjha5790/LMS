const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes');

const createAssesment=async (req,res)=>{
    const topicId=req.params.tid;
    const {title}=req.body;
    const topic=await prisma.topic.findUnique({
        where:{id:topicId}}
        
    )
    if (!topic){
        throw new NotFoundError("Topic with the given id does not exist")
    }
    if (!title){
        throw new NotFoundError("Can not create an assesment without a title")
    }
    const newAssesment=await prisma.Assessment.create({
        data:{
            title,
            topicId:topicId,
            createdBy:req.user.id
        }
    });
    return res.status(StatusCodes.CREATED).json(newAssesment)
}
const listAssesment=async (req,res)=>{
     const topicId=req.params.tid;
     const {
        title,
        search,
        limit=5,
        page=1
    }=req.query;
    
    let filters={
        topicId:topicId
    }
    if (title) filters.title=title;

    if (search){
        filters.OR=[
            {title:{contains:search,
                mode:'insensitive'
            }}
        ]
    }
    const pageNum=Math.max(1,parseInt(page));
    const limNum=Math.max(1,parseInt(limit));
    const skipSum=(pageNum-1)*limNum;

    const [ch,tch]=await Promise.all([
        prisma.Assessment.count({where:filters}),
        prisma.Assessment.findMany({
            where:filters,
            skip:skipSum,
            take:limNum,
            
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
const updateAssesment=async (req,res)=>{
    const assessmentId=req.params.aId;
        const {title}=req.body;
        const assessment=await prisma.Assessment.findUnique({
            where:{id:assessmentId}
        });
        if (!assessment){
            throw new NotFoundError("No assessment exist with the given id");
        }
        if (assessment.createdBy!==req.user.id){
            throw new NotFoundError("Only those who create assessment can update it")
        }
        const updatedData={}
        if (title && title!==assessment.title){
            updatedData.title=title
        }
        
        const updateAssessment=await prisma.Assessment.update({
            where:{id:assessmentId},
            data:updatedData
        })
        return res.status(StatusCodes.OK).json(updatedData)
}
const deleteAssesment=async (req,res)=>{
    const assessmentId=req.params.aId;
        const assessment=await prisma.Assessment.findUnique({
            where:{id:assessmentId}
        });
        if (!assessment){
            throw new NotFoundError("No assessment exist with the given id");
        }
        if (assessment.createdBy!==req.user.id){
            throw new NotFoundError("Only those who create assessment can delete it")
        }
        await prisma.Assessment.delete({
            where:{
                id:assessmentId
            }
        })
        return res.status(StatusCodes.OK).json({
            message:"Assessment is successfully deleted"
        })
}
module.exports={
    createAssesment,
    listAssesment,
    updateAssesment,
    deleteAssesment
}
