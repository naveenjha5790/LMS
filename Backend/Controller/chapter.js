const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes');

const createChapter=async (req,res)=>{
    const subjectId=req.params.subId;
    const {title,order}=req.body;
    const subject=await prisma.subject.findUnique({
        where:{id:subjectId}
    });
    if (!subject){
        throw new NotFoundError("Subject with the given ID doesn't exist");
    }
    if (!title || !order){
        throw new NotFoundError("Title and the order of chapters are mandatory")
    }
    const newChapter=await prisma.chapter.create({
        data:{
            title,
            order,
            subjectId:subjectId
        }
    })
    return res.status(StatusCodes.CREATED).json(newChapter)
}

const listChapters=async (req,res)=>{
     const subjectId=req.params.subId;
     const {
        title,
        search,
        limit=5,
        page=1
    }=req.query;
    let filters={
        subjectId:subjectId
    }
    if (title) filters.title=title;

    if (search) {
        filters.AND = [
            { subjectId: subjectId },
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

    const [ch,tch]=await Promise.all([
        prisma.Chapter.count({where:filters}),
        prisma.Chapter.findMany({
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
            total_records:ch,
            current_page:pageNum,
            limit:limNum,
            total_pages:Math.ceil(ch/limNum)
        },
        paths:tch
        }
    )
}

const updateChapter=async (req,res)=>{
    const chapterId=req.params.chId;
        const {title,order}=req.body;
        const chapter=await prisma.Chapter.findUnique({
            where:{id:chapterId}
        });
        if (!chapter){
            throw new NotFoundError("No Chapter exist with the given id");
        }
        const updatedData={}
        if (title && title!==chapter.title){
            updatedData.title=title
        }
        if (order && order!==chapter.order){
            updatedData.order=order;
        }
        const updateChapter=await prisma.Chapter.update({
            where:{id:chapterId},
            data:updatedData
        })
        return res.status(StatusCodes.OK).json(updatedData)
}

const deleteChapter=async (req,res)=>{
    const chapterId=req.params.chId;
        const chapter=await prisma.Chapter.findUnique({
            where:{id:chapterId}
        });
        if (!chapter){
            throw new NotFoundError("Chapter with the given id does not exist")
        }
        await prisma.Chapter.delete({
            where:{
                id:chapterId
            }
        })
        return res.status(StatusCodes.OK).json({
            message:"Chapter is successfully deleted"
        })
}
module.exports={
    createChapter,
    listChapters,
    updateChapter,
    deleteChapter
}