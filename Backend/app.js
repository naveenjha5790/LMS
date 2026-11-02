require('dotenv').config()
const express=require('express');
const app=express();
const cors=require('cors');
const port=process.env.PORT || 5000;
app.use(cors());
const errorHandlerMiddleware=require('./Middleware/error-handler');
const notFoundMiddleware=require('./Middleware/not-found');
const path=require('path');
app.use(express.json())
const auth1=require('./Router/auth')
const learningPath=require('./Router/learningPath');
const subject=require('./Router/subject');
const chapters=require('./Router/chapter')
const topic=require('./Router/topic');
const video=require('./Router/videos')
const assessment=require('./Router/assessment')
const question=require('./Router/question')
const assignedPath=require('./Router/assignedPath')
const progress=require('./Router/progress')
const notification=require('./Router/notification')
app.use('/api',auth1)
app.use('/api',learningPath);
app.use('/api',subject);
app.use('/api',chapters);
app.use('/api',topic);
app.use('/api',video)
app.use('/api',assessment)
app.use('/api',question)
app.use('/api',assignedPath)
app.use('/api',progress)
app.use('/api',notification)
app.use('/public/videos', express.static(path.join(__dirname, 'uploads')));
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware)

const start =async ()=>{
    try{
        app.listen(port,()=>{
    console.log(`Server is listening on port number ${port}`)
    })
    }catch(error){
        console.log(error)
    }
}
start();