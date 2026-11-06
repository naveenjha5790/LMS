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
const showAssignments = async (req, res, next) => {

    const { search, limit = 5, page = 1 } = req.query;
    
    const pageNum = Math.max(1, parseInt(page));
    const limNum = Math.max(1, parseInt(limit));
    const skipSum = (pageNum - 1) * limNum;
    let filters = {};

    const role = req.user.role?.toUpperCase();
    if (role === "STUDENT") {
   
        filters.studentId = req.user.id;
    } else if (role !== "LMS_MANAGER" && role !== "ADMIN") {
        return res.status(403).json({ message: "Access Denied: Insufficient workspace rights." });
    }

    if (search?.trim()) {
        const searchFilter = {
            OR: [
                {
                    student: {
                        email: { contains: search.trim(), mode: 'insensitive' }
                    }
                },
                {
                    learningPath: {
                        title: { contains: search.trim(), mode: 'insensitive' }
                    }
                }
            ]
        };

        if (filters.studentId) {
            filters = {
                AND: [
                    { studentId: filters.studentId },
                    searchFilter
                ]
            };
        } else {
            filters = searchFilter;
        }
    }

    try {
        const [ch, tch] = await Promise.all([
            prisma.studentPath.count({ where: filters }), 
            prisma.studentPath.findMany({
                where: filters,
                skip: skipSum,
                take: limNum,
                include: {
                    student: {
                        select: { name: true, email: true }
                    },
                    learningPath: {
                        select: { id: true, title: true, status: true }
                    }
                },
                orderBy: {
                    assignedAt: 'desc'
                }
            })
        ]);

        return res.status(200).json({
            meta: {
                total_records: ch,
                current_page: pageNum,
                limit: limNum,
                total_pages: Math.ceil(ch / limNum)
            },
            paths: tch 
        });
    } catch (error) {
        next(error);
    }
};

const getCertificates = async (req, res, next) => {
    const { id: userId, role } = req.user;
    
    
        let queryFilter = {};
        const normalizedRole = role.toUpperCase().trim();

        if (normalizedRole === 'STUDENT') {
            queryFilter.studentId = userId;
        }

        
        const certificatesList = await prisma.Certificate.findMany({
            where: queryFilter,
            orderBy: {
                issuedAt: 'desc'
            },
            include: {
                student: { 
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        
        const formattedCertificates = certificatesList.map((cert) => ({
            id: cert.id || cert._id,
            studentId: cert.studentId,
            pathTitle: cert.pathTitle,
            secureHash: cert.secureHash,
            issuedAt: cert.issuedAt,
            studentName: cert.student?.name || "Unregistered Account",
            studentEmail: cert.student?.email || "N/A"
        }));

        return res.status(StatusCodes.OK).json({
            success: true,
            count: formattedCertificates.length,
            data: formattedCertificates
        });
    }
module.exports={
    assignPath,
    showAssignments,
    getCertificates
}