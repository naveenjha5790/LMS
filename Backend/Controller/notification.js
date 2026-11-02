const {PrismaClient}=require('../generated/prisma');
const prisma=new PrismaClient();
const {UnauthenticatedError,
    BadRequestError,
    NotFoundError
}=require('../Errors');
const {StatusCodes}=require('http-status-codes');

const getNotifications = async (req, res) => {
        const userId = req.user.id; 

        const notifications = await prisma.Notification.findMany({
            where: { userId: userId },
            orderBy: [
                { isRead: 'asc' },  
                { createdAt: 'desc' } 
            ]
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            count: notifications.length,
            notifications
        });
   
};

const markAsRead = async (req, res) => {
   
        const notificationId = req.params.id;
        const userId = req.user.id;
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "Notification not found." });
        }

        const updatedNotification = await prisma.notification.update({
            where: {
                id: notificationId },
            data: { 
                isRead: true }
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Notification marked as read.",
            notification: updatedNotification
        });
   
};

const markAllAsRead = async (req, res) => {
        const userId = req.user.id;


        const updateBatch = await prisma.notification.updateMany({
            where: {
                userId: userId,
                isRead: false 
            },
            data: {
                isRead: true
            }
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully marked ${updateBatch.count} notifications as read.`
        });
   
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
