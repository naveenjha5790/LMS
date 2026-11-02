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
        search,
        limit=5,
        page=1
    }=req.query;
    let filters={
        chapterId:chapterId
    }
    if (title) filters.title=title;

    if (search) {
        filters.AND = [
            { chapterId: chapterId },
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
    const topicId=req.params.tid;
    const {action,reason}=req.body;
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
        const pathId=topic.chapter.subject.pathId;

        if (action==='reject'){
            if (!reason || !reason.trim()===""){
                throw new BadRequestError("A rejected request must have a reason as well.")
            }
        
        const rejectedTopic=await prisma.Topic.update({
            where:{id:topicId},
            data:{
                status:'REJECTED',
                rejectReason:reason
            }
        })
        const pathData = await prisma.Topic.findUnique({ 
            where: 
            { id: topicId }
         });
            await prisma.Notification.create({
                data: {
                    userId: pathData.contributorId,
                    type: 'WORKFLOW_REJECTED',
                    title: `Topic Content Rejected`,
                    message: `Your content for topic "${topic.title}" was rejected. Reason: ${reason}`,
                    referenceId: topicId
                }
            });
            return res.status(StatusCodes.OK).json({
                message:"Your request has been rejected"
            })
        }
        if (action==='approved'){
            const approvedTopic = await prisma.Topic.update({
                where: { id: topicId },
                data: 
                { status: 
                    'APPROVED' }
            });
            const pathData = await prisma.Topic.findUnique({ 
            where: 
            { id: topicId }
         });
            await prisma.Notification.create({
                data:{
                    userId:pathData.contributorId,
                    type:'CONTENT_APPROVED',
                    title:"Content Approved",
                    message:`Congratulations!. Your topic content with id ${topicId} has been approved`,
                    referenceId:topicId
                }
            })
            const autoPublishResult = await checkAndAutoPublishPath(pathId);

            return res.status(StatusCodes.OK).json({
                message: autoPublishResult.pathPublished 
                    ? "Topic approved. All topics are now complete—Learning Path has been automatically PUBLISHED! 🚀" 
                    : "Topic content approved successfully. Waiting for remaining topics to clear.",
                approvedTopic
            });
        }
}

async function checkAndAutoPublishPath(pathId) {
    const allPathTopics = await prisma.Topic.findMany({
        where: { chapter: {
             subject: {
                 pathId: pathId 
                } 
            } 
        },
        select: { 
            id: true, 
            status: true }
    });

    const totalTopicsCount = allPathTopics.length;
    const approvedTopicsCount = allPathTopics.filter(t => t.status === 'CONTENT_APPROVED').length;

    if (totalTopicsCount > 0 && approvedTopicsCount === totalTopicsCount) {
        const publishedPath = await prisma.LearningPath.update({
            where: { 
                id: pathId },
            data: {
                 status: 'PUBLISHED', 
                 rejectReason: null }
        });

    
        await prisma.Notification.create({
            data: {
                userId: publishedPath.managerId,
                type: 'PATH_PUBLISHED',
                title: 'Course Path Automatically Published! 🚀',
                message: `Congratulations! All topics under "${publishedPath.title}" were approved. The path is now live for students.`,
                referenceId: pathId
            }
        });

        return { pathPublished: true };
    }

    return { pathPublished: false };
}
const pendingTopic=async (req,res)=>{
    const pathPending=await prisma.Topic.findMany({
        where:{
            status:{in:['PENDING_CONTENT_APPROVAL']}
        }
    })
    return res.json(pathPending)
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