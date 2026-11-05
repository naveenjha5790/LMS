const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes');
const crypto=require('crypto')

const videoDone=async (req,res)=>{
    const mediaId=req.params.mId;
    const studentId=req.user.id;
    const currentVideo=await prisma.MediaFile.findUnique({
        where:{id:mediaId}
    });
    if (!currentVideo){
        throw new NotFoundError("Video file doesn't exist")
    }
    const curTopicId=currentVideo.topicId;
    const allTopicVideo=await prisma.MediaFile.findMany({
        where:{topicId:curTopicId},
        select:{
            id:true
        }
    });
    const allVideoIds=allTopicVideo.map(v=>v.id);

    let progress=await prisma.StudentProgress.findUnique({
        where:{
            studentId_topicId:{
                studentId:studentId,
                topicId:curTopicId
            }
        }
    });
    if (!progress){
        progress=await prisma.StudentProgress.create({
            data:{
                studentId:studentId,
                topicId:curTopicId,

            }
        })
    };
    const maxSortorder=await prisma.MediaFile.findFirst({
        where:{topicId:curTopicId},
        orderBy:{sortOrder:'desc'}
    });
    const isFinalVideo=currentVideo.id===maxSortorder?.id;

    await prisma.StudentProgress.update({
        where:{studentId_topicId:{
                studentId:studentId,
                topicId:curTopicId
            },
        },
        data:{
            isVideoDone:isFinalVideo ?true:progress.isVideoDone,
            updatedAt:new Date()
        }

    })
    return res.status(StatusCodes.OK).json({videoUrl:currentVideo.url})
}
const quizQuestions=async (req,res)=>{
    const topicId=req.params.tId;
    const studentId=req.user.id;

    const progress=await prisma.StudentProgress.findUnique({
        where:{
            studentId_topicId:{
                studentId,topicId
            }
        }
    })
    if (!progress || !progress.isVideoDone){
        throw new BadRequestError("Access Denied! need to see videos before attempting quiz")
    }
    const assessment = await prisma.Assessment.findFirst({
      where: { topicId: topicId },
      select: { id: true } 
    });

    if (!assessment) {
      return res.status(404).json({ error: "No quiz assessment found for this topic." });
    }

    const quizQuestions=await prisma.Question.findMany({
        where:{assessmentId:assessment.id}
    })
    return res.json(quizQuestions)
}
const viewProgress=async (req,res)=>{
   
    const {id:userId,role}=req.user;
    let queryFilter={}
    if (role==='STUDENT'){
        queryFilter.studentId=userId
    }
    const progressList=await prisma.StudentProgress.findMany({
        where:queryFilter,
        include:{
            topic:{
                select:{
                    title:true,
                    chapter:{
                        select:{
                            title:true,
                            subject:{
                                select:{
                                    title:true,
                                    learningPath:{
                                        select:{
                                            title:true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    const formattedTable=progressList.map((progress)=>({
        progressId:progress.id,
        studentId: progress.studentId,
      topicId: progress.topicId,
      isVideoDone: progress.isVideoDone,
      isQuizDone: progress.isQuizDone,
      quizScore: progress.quizScore,
      updatedAt: progress.updatedAt,
      topicTitle: progress.topic?.title || "N/A",
      chapterName: progress.topic?.chapter?.title || "N/A",
      subjectName: progress.topic?.chapter?.subject?.title || "N/A",
      pathTitle: progress.topic?.chapter?.subject?.path?.title || "N/A"
    })
    )
    return res.json(formattedTable)
}

const submitQuiz = async (req, res) => {
    const topicId = req.params.tid || req.params.topicId || req.params.tId;
    const { userAnswers, pathTitle } = req.body;
    const studentId = req.user?.id || req.user?.Id || req.user?.sub;
    if (!studentId) {
        return res.status(401).json({ success: false, message: "Unauthorized student session context." });
    }
    if (!topicId) {
        return res.status(400).json({ success: false, message: "Missing required topic parameter identity reference." });
    }

    try {
   
        const progressCheck = await prisma.StudentProgress.findUnique({
            where: {
                studentId_topicId: { studentId, topicId }
            }
        });

        if (!progressCheck || !progressCheck.isVideoDone) {
            return res.status(400).json({ 
                success: false, 
                error: "Pre-requisite missing",
                message: "You cannot complete the quiz assessment until you have fully watched the lesson videos first." 
            });
        }

        const assessment = await prisma.Assessment.findFirst({
            where: { topicId: topicId },
            select: { id: true } 
        });

        if (!assessment) {
            return res.status(404).json({ success: false, error: "No quiz assessment found for this topic." });
        }

        const quizQuestions = await prisma.Question.findMany({
            where: { assessmentId: assessment.id },
            select: { id: true, correctIndex: true }
        });

        if (!quizQuestions || quizQuestions.length === 0) {
            return res.status(400).json({ success: false, message: "This assessment contains no active question items." });
        }

        let correct = 0;
        quizQuestions.forEach((q) => {
            if (userAnswers && userAnswers[q.id] === q.correctIndex) correct++;
        });

        const finalScore = Math.round(((correct / quizQuestions.length) * 100) * 100 / 100);
        const hasPassed = finalScore >= 50.0;

        const updatedProgress = await prisma.StudentProgress.update({
            where: {
                studentId_topicId: { studentId, topicId }
            },
            data: {
                quizScore: finalScore,
                isQuizDone: hasPassed ? true : progressCheck.isQuizDone, 
                updatedAt: new Date()
            }
        });

        if (!hasPassed) {
            return res.json({
                success: false,
                message: `Your final score is ${finalScore}%. You need at least 50% to pass. Please try again.`,
                score: finalScore
            });
        }

        const targetPathTopics = await prisma.Topic.findMany({
            where: {
                chapter: {
                    subject: {
                        learningPath: {
                            title: pathTitle
                        }
                    }
                }
            },
            select: { id: true }
        });

        const requiredTopicsId = targetPathTopics.map(t => t.id);
        const requiredQuizzes = requiredTopicsId.length;
        
        if (requiredQuizzes === 0) {
            return res.json({
                success: true,
                message: "Congratulations! You passed the quiz.",
                score: finalScore,
                certificateUnlocked: false,
                progress: updatedProgress
            });
        }

        const passedQuizCount = await prisma.StudentProgress.count({
            where: {
                studentId: studentId,
                topicId: { in: requiredTopicsId },
                quizScore: { gte: 50.0 }
            }
        });

        let certificateCreated = false;
        let certificateData = null;

        if (passedQuizCount === requiredQuizzes) {
            const existingCert = await prisma.Certificate.findUnique({
                where: {
                    studentId_pathTitle: { studentId, pathTitle }
                }
            });

            if (!existingCert) {
                const crypto = require('crypto');
                const uniqueHash = crypto.createHash('sha256').update(`${studentId}-${pathTitle}-${Date.now()}`).digest('hex');
           
                certificateData = await prisma.Certificate.create({
                    data: {
                        studentId: studentId,
                        pathTitle: pathTitle,
                        secureHash: uniqueHash,
                        issuedAt: new Date()
                    }
                });
                certificateCreated = true;
            }
        }

        return res.json({
            success: true,
            message: "Congratulations! You passed the quiz.",
            score: finalScore,
            certificateUnlocked: certificateCreated,
            certificate: certificateData,
            progress: updatedProgress
        });

    } catch (error) {
        console.error("Quiz evaluation execution crash:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Internal Server Error", 
            message: error.message || "An error occurred while compiling answers ledger." 
        });
    }
};


module.exports={
    quizQuestions,
    videoDone,
    viewProgress,
    submitQuiz
}