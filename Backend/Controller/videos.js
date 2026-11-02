const express=require('express');
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes');

const uploadDir=path.join(__dirname,'../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true})
};
const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  }
});
const upload=multer({
    storage:localDiskStorage,
    limits:{fileSize:1024*1024*1024}
})

const uploadLocalVideo=async (req,res)=>{
    const topicId=req.params.tid;
    const {sortOrder}=req.body;
    const file=req.file;
    if (!file){
        throw new NotFoundError("No file exist to upload");
    }
   const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
            chapter: {
                include: {
                    subject: {
                        include: {
                            learningPath: {
                                select: {
                                    status: true 
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (!topic) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new NotFoundError("No topic exist to add videos")
    }
    const learningPath1 = topic.chapter?.subject?.learningPath;
    if (!learningPath1) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw new NotFoundError("Associated learning path structural mapping missing");
    }
       if (learningPath1.status !== 'STRUCTURE_APPROVED' || learningPath1.status!=='PENDING_FINAL_APPROVAL') {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    
        return res.status(403).json({
            success: false,
            message: "Access Denied. You cannot add content until the structure is approved by a moderator."
        });
    }

    const uniqueId = Date.now().toString();
    const localUrl = `http://localhost:5000/public/videos/${file.filename}`;

    
    const fileExtension = path.extname(file.originalname); 

    const newMedia = await prisma.mediaFile.create({
      data: {
        id: `media_${uniqueId}`,
        filename: `${topic.title}${fileExtension}`, 
        url: localUrl,                 
        storageKey: file.path,         
        mimeType: file.mimetype,
        fileSize: file.size,           
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        topicId: topicId,
        uploadedBy:req.user.id
      }
      })
      await prisma.topic.update({
        where:{
            id:topicId
        },
        data:{
            contributorId:req.user.id,
            status:'DRAFT_CONTENT'
        }
      })

    return res.status(201).json({ 
      success: true, 
      message: "Video saved directly to local storage directory",
      data: newMedia 
    });
}
const getVideos=async (req,res)=>{
    const topicId=req.params.tid;
    const topic=await prisma.Topic.findUnique({
        where:{id:topicId}
    })
    if (!topic){
        throw new NotFoundError("Topic with the given ID does not exist")
    };
    const videos = await prisma.mediaFile.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return res.status(200).json({ success: true, data: videos });
}
module.exports={
    upload,
    uploadLocalVideo,
    getVideos
}