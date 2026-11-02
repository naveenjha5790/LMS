const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes');

const addQuestion=async (req,res) =>{
    const assessmentId=req.params.aid;
    const data=req.body;
    const assessment=await prisma.Assessment.findUnique({
                where:{id:assessmentId}
            });
            if (!assessment){
                throw new NotFoundError("No assessment exist with the given id");
            }
            if (assessment.createdBy!==req.user.id){
                throw new NotFoundError("Only those who create assessment can add question to it")
            }
            const questionsArray = Array.isArray(data) ? data : [data];

        if (questionsArray.length === 0) {
        return new NotFoundError("No questions found to be added")
        };
        for (const q of questionsArray) {
        if (
            !q.questionText || 
            !q.options || 
            q.correctIndex === undefined || 
            q.correctIndex === null
        ) {
            throw new BadRequestError("All question fields (questionText, options, correctIndex) are required for every item.");
        }
    }
        const formattedQuestions = questionsArray.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctIndex: parseInt(q.correctIndex),
            assessmentId: assessmentId,
            createdBy:req.user.id
        }));
        

        const result = await prisma.Question.createMany({
            data: formattedQuestions,
            skipDuplicates: true,
        });

        
            return res.status(StatusCodes.CREATED).json(result)

}
const showQuestions=async (req,res)=>{
    const assessmentId=req.params.aid;
     const {
        limit=5,
        page=1
    }=req.query;

    let filters={
        assessmentId:assessmentId
    }

    const pageNum=Math.max(1,parseInt(page));
    const limNum=Math.max(1,parseInt(limit));
    const skipSum=(pageNum-1)*limNum;

    const [sub,tsub]=await Promise.all([
        prisma.Question.count({where:filters}),
        prisma.Question.findMany({
            where:filters,
            skip:skipSum,
            take:limNum
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
const updateQuestion=async (req,res)=>{
    const questionId=req.params.qId;
        const {questionText,options,correctIndex}=req.body;
        const question=await prisma.Question.findUnique({
            where:{id:questionId}
        });
        if (!question){
            throw new NotFoundError("No question exist with the given id");
        }
        if (assessment.createdBy!==req.user.id){
            throw new NotFoundError("Only those who add questions can update it")
        }
        const updatedData={}
        if (questionText && questionText!==question.questionText){
            updatedData.questionText=questionText
        }
        if (options && options!==question.options){
            updatedData.options=options
        }
        if (correctIndex && correctIndex!==question.correctIndex){
                updatedData.correctIndex=correctIndex
        }
        const updateQuestion=await prisma.Assessment.update({
            where:{id:questionId},
            data:updatedData
        })
        return res.status(StatusCodes.OK).json(updatedData)
}
const removeQuestion=async (req,res)=>{
    const questionId=req.params.qId;
        const question=await prisma.Question.findUnique({
            where:{id:questionId}
        });
        if (!question){
            throw new NotFoundError("No question exist with the given id");
        }
        if (assessment.createdBy!==req.user.id){
            throw new NotFoundError("Only those who add questions can delete it")
        }
        
        await prisma.Question.delete({
            where:{
                id:questionId
            }
        })
        return res.status(StatusCodes.OK).json({
            message:"Assessment is successfully deleted"
        })
}
module.exports={
    addQuestion,
    showQuestions,
    updateQuestion,
    removeQuestion
}
