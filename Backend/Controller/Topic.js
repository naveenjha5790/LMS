const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes');

const createTopic=async (req,res)=>{
    const chapterId=req.params.chId;
    const {title,order}=req.body;
    const chapter=await prisma.Chapter.findUnique({
        where:{id:chapterId}
    });
    if (!chapter){
        throw new NotFoundError("chapter with the given ID doesn't exist");
    }
    if (!title || !order){
        throw new NotFoundError("Title and the order of topics are mandatory")
    }
    const newTopic=await prisma.topic.create({
        data:{
            title,
            order,
            chapterId:chapterId
        }
    })
    return res.status(StatusCodes.CREATED).json(newTopic)
}

const listTopics=async (req,res)=>{
     const chapterId=req.params.chId;
     const {
        title,
        status,
        search,
        limit=5,
        page=1
    }=req.query;
    let filters={
        chapterId:chapterId
    }
    if (title) filters.title=title;

    if (req.user && req.user.role === 'CONTRIBUTOR') {
            filters.AND = [
                ...(filters.AND || []),
                {
                    chapter: {
                        subject: {
                            learningPath: {
                                status: {
                                    notIn: ['DRAFT', 'PENDING_STRUCTURE_APPROVAL']
                                }
                            }
                        }
                    }
                }
            ];
        }

        if (search) {
            filters.AND = [
                ...(filters.AND || []),
                {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { status: { contains: search, mode: 'insensitive' } } // Topic status check
                    ]
                }
            ];
        }

    const pageNum=Math.max(1,parseInt(page));
    const limNum=Math.max(1,parseInt(limit));
    const skipSum=(pageNum-1)*limNum;

    const [ch,tch]=await Promise.all([
        prisma.Topic.count({where:filters}),
        prisma.Topic.findMany({
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

const updateTopic=async (req,res)=>{
    const topicId=req.params.tId;
        const {title,order}=req.body;
        const topic=await prisma.Topic.findUnique({
            where:{id:topicId}
        });
        if (!topic){
            throw new NotFoundError("No Topic exist with the given id");
        }
        const updatedData={}
        if (title && title!==topic.title){
            updatedData.title=title
        }
        if (order && order!==topic.order){
            updatedData.order=order;
        }
        const updateTopic=await prisma.Topic.update({
            where:{id:topicId},
            data:updatedData
        })
        return res.status(StatusCodes.OK).json(updatedData)
}

const deleteTopic=async (req,res)=>{
    const topicId=req.params.tId;
        const topic=await prisma.Topic.findUnique({
            where:{id:topicId}
        });
        if (!topic){
            throw new NotFoundError("Topic with the given id does not exist")
        }
        await prisma.Topic.delete({
            where:{
                id:topicId
            }
        })
        return res.status(StatusCodes.OK).json({
            message:"Topic is successfully deleted"
        })
}

const requestTopicApproval=async (req,res)=>{
    const topicId=req.params.tid;
     const topic = await prisma.Topic.findUnique({
            where: { id: topicId },
            include: { 
                chapter: { 
                    include: { 
                        subject: true } } } 
                        
        });

        if (!topic) {
            throw new NotFoundError("There is no topic with provided  topic id")
        }
        const pathId=topic.chapter.subject.learningPathId;

        const path=await prisma.learningPath.findUnique({
            where:{
                id:pathId
            }
        });
        if (!path || (path.status!=='STRUCTURE_APPROVED' && path.status!=='REJECTED')){
            throw new BadRequestError("Path structure must be approved first to be content to be added.")
        }
        const videoCount=await prisma.mediaFile.count({
            where:{topicId}
        })
        const quizCount=await prisma.assessment.count({
            where:{
                topicId
            }
        })
        if (videoCount===0 || quizCount===0){
            throw new BadRequestError("Can not sent content for approval without video and quiz")
      }
        const updatedTopic=await prisma.Topic.update({
            where:{
                id:topicId
            },
            data:{
                status:'PENDING_CONTENT_APPROVAL'
            }
        });
        const moderator=await prisma.user.findFirst({
            where:{role:'MODERATOR'}
        });
        if (moderator){
            await prisma.notification.create({
                data:{
                    userId:moderator.id,
                    type:'CONTENT_APPROVAL_REQUEST',
                    title:'Topic content needs review',
                    message:`Content for topic ${topic.title} inside path ${path.title} is waiting for approval`
                }
            })
        }
        return res.status(StatusCodes.OK).json({
            message:"Content successfully sent to moderator for approval."
        })
}


const moderatorTopicResponse=async (req,res)=>{
    
}

async function checkAndAutoPublishPath(pathId) {
}



const pendingTopic=async (req,res)=>{
    const pendingTopics = await prisma.Topic.findMany({
            where: {
                status: {
                    in: ['PENDING_CONTENT_APPROVAL']
                }
            },
            include: {
                chapter: {
                    include: {
                        subject: {
                            include: {
                                learningPath: true 
                            }
                        }
                    }
                }
            }
        });
    return res.json(pendingTopics)
}
module.exports={
    createTopic,
    listTopics,
    updateTopic,
    deleteTopic,
    requestTopicApproval,
    moderatorTopicResponse,
    pendingTopic
}