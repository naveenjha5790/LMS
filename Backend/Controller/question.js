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
const updateQuestion = async (req, res) => {
    try {
        const questionId = req.params.qId;
        const { questionText, options, correctIndex } = req.body;

        const question = await prisma.Question.findUnique({
            where: { id: questionId },
            include: { assessment: true } 
        });

        if (!question) {
            return res.status(404).json({ message: "No question exists with the given id" });
        }

      
        if (question.assessment && question.assessment.createdBy !== req.user.id) {
            return res.status(403).json({ message: "Only those who add questions can update it" });
        }

        const updatedData = {};
        if (questionText && questionText.trim() !== question.questionText) {
            updatedData.questionText = questionText.trim();
        }
        if (options && Array.isArray(options)) {
            updatedData.options = options.map(opt => opt.trim());
        }
        

        if (correctIndex !== undefined && correctIndex !== null) {
            const parsedIndex = parseInt(correctIndex, 10);
            if (!isNaN(parsedIndex) && parsedIndex !== question.correctIndex) {
                updatedData.correctIndex = parsedIndex;
            }
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(200).json(question);
        }

        const updatedQuestion = await prisma.Question.update({
            where: { id: questionId },
            data: updatedData
        });

        return res.status(200).json(updatedQuestion);

    } catch (error) {
        console.error("Error inside updateQuestion:", error);
        return res.status(500).json({ 
            message: "Internal Server Error running update operations", 
            error: error.message 
        });
    }
};

const removeQuestion = async (req, res) => {
    try {
     
        const questionId = req.params.id || req.params.qId;

        if (!questionId) {
            return res.status(400).json({ message: "Question ID parameter is required" });
        }

        const question = await prisma.Question.findUnique({
            where: { id: questionId },
            include: { assessment: true } 
        });

        if (!question) {
            return res.status(404).json({ message: "No question exists with the given id" });
        }


        if (question.assessment && question.assessment.createdBy !== req.user.id) {
            return res.status(403).json({ message: "Only those who add questions can delete it" });
        }

        await prisma.Question.delete({
            where: {
                id: questionId
            }
        });

        return res.status(StatusCodes.OK).json({
            message: "Question is successfully deleted"
        });

    } catch (error) {
        console.error("Error inside removeQuestion:", error);
        return res.status(500).json({ 
            message: "Internal Server Error running delete operations", 
            error: error.message 
        });
    }
};

module.exports={
    addQuestion,
    showQuestions,
    updateQuestion,
    removeQuestion
}
