const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes')
const createSubject=async (req,res)=>{
    const pathId=req.params.id;
    const {
        title,order
    }=req.body;
    const path=await prisma.learningPath.findUnique({
        where:{id:pathId}
    })
    if (!path){
        throw new NotFoundError("No path exist to add subject");
    }
    if (!title || !order){
        throw new NotFoundError("Could not create a subject without either of title and order")
    }
    const newSubject=await prisma.subject.create({
        data:{
            title,
            order,
            learningPathId:pathId
        }
    });
    return res.status(StatusCodes.CREATED).json(newSubject);
}
const showSubjects=async (req,res)=>{
    const pathId=req.params.id;
    const {
        title,
        search,
        limit=5,
        page=1
    }=req.query;
     let filters={
        learningPathId:pathId
    }
    if (title) filters.title=title;

    if (search) {
        filters.AND = [
            { learningPathId: pathId },
            {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } }
                ]
            }
        ];
    }
    const pageNum=Math.max(1,parseInt(page));
    const limNum=Math.max(1,parseInt(limit));
    const skipSum=(pageNum-1)*limNum;

    const [sub,tsub]=await Promise.all([
        prisma.Subject.count({where:filters}),
        prisma.Subject.findMany({
            where:filters,
            skip:skipSum,
            take:limNum,
            orderBy:{
                order:'asc'
            }
        })
    ]);
    return res.json({
        meta:{
            total_records:sub,
            current_page:pageNum,
            limit:limNum,
            total_pages:Math.ceil(sub/limNum)
        },
        paths:tsub
        }
    )
}
const updateSubject=async (req,res)=>{
    const subjectId=req.params.subId;
    const {title,order}=req.body;
    const subject=await prisma.Subject.findUnique({
        where:{id:subjectId}
    });
    if (!subject){
        throw new NotFoundError("No subject exist with the given id");
    }
    const updatedData={}
    if (title && title!==subject.title){
        updatedData.title=title
    }
    if (order && order!==subject.order){
        updatedData.order=order;
    }
    const updateSubject=await prisma.Subject.update({
        where:{id:subjectId},
        data:updatedData
    })
    return res.status(StatusCodes.OK).json(updatedData)
}
const deleteSubject=async (req,res)=>{
    const subjectId=req.params.subId;
    const subject=await prisma.Subject.findUnique({
        where:{id:subjectId}
    });
    if (!subject){
        throw new NotFoundError("Subject with the given id does not exist")
    }
    await prisma.Subject.delete({
        where:{
            id:subjectId
        }
    })
    return res.status(StatusCodes.OK).json({
        message:"Subject is successfully deleted"
    })


}
module.exports={
    createSubject,
    showSubjects,
    updateSubject,
    deleteSubject
}