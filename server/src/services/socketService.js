const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const setupSocketHandlers = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.user.id}`);

    // Handle joining conversation rooms
    socket.on('join-conversation', async (conversationId) => {
      try {
        // Verify user has access to this conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { buyerId: socket.user.id },
              { sellerId: socket.user.id }
            ]
          },
          include: {
            buyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            },
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  select: { url: true },
                  take: 1
                }
              }
            },
            messages: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  }
                }
              },
              orderBy: { createdAt: 'asc' },
              take: 50,
            }
          }
        });

        if (conversation) {
          socket.join(conversationId);
          socket.emit('conversation-joined', conversation);
        } else {
          socket.emit('error', 'Conversation not found or access denied');
        }
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit('error', 'Failed to join conversation');
      }
    });

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, content } = data;

        // Verify user has access to this conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { buyerId: socket.user.id },
              { sellerId: socket.user.id }
            ]
          }
        });

        if (!conversation) {
          return socket.emit('error', 'Conversation not found');
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            conversationId,
            userId: socket.user.id,
            content,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            }
          }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        // Emit to all users in the conversation
        io.to(conversationId).emit('new-message', message);

        // Send notification to the other user
        const otherUserId = conversation.buyerId === socket.user.id ? conversation.sellerId : conversation.buyerId;
        io.to(`user_${otherUserId}`).emit('message-notification', {
          conversationId,
          message,
          sender: {
            id: socket.user.id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            avatar: socket.user.avatar
          }
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle creating new conversations
    socket.on('create-conversation', async (data) => {
      try {
        const { sellerId, productId } = data;

        // Check if conversation already exists
        let conversation = await prisma.conversation.findFirst({
          where: {
            buyerId: socket.user.id,
            sellerId,
            productId
          },
          include: {
            buyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            },
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  select: { url: true },
                  take: 1
                }
              }
            }
          }
        });

        if (!conversation) {
          // Create new conversation
          conversation = await prisma.conversation.create({
            data: {
              buyerId: socket.user.id,
              sellerId,
              productId
            },
            include: {
              buyer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              },
              seller: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              },
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    select: { url: true },
                    take: 1
                  }
                }
              }
            }
          });
        }

        socket.join(conversation.id);
        socket.emit('conversation-created', conversation);

        // Notify the seller
        io.to(`user_${sellerId}`).emit('new-conversation', conversation);

      } catch (error) {
        console.error('Create conversation error:', error);
        socket.emit('error', 'Failed to create conversation');
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(conversationId).emit('user-typing', {
        userId: socket.user.id,
        userName: socket.user.firstName,
        isTyping
      });
    });

    // Handle marking messages as read
    socket.on('mark-messages-read', async (conversationId) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            userId: { not: socket.user.id },
            isRead: false
          },
          data: {
            isRead: true,
            readAt: new Date()
          }
        });

        // Notify other user that messages have been read
        socket.to(conversationId).emit('messages-read', {
          conversationId,
          readBy: socket.user.id
        });
      } catch (error) {
        console.error('Mark messages read error:', error);
      }
    });

    // Handle getting user's conversations
    socket.on('get-conversations', async () => {
      try {
        const conversations = await prisma.conversation.findMany({
          where: {
            OR: [
              { buyerId: socket.user.id },
              { sellerId: socket.user.id }
            ]
          },
          include: {
            buyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            },
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  select: { url: true },
                  take: 1
                }
              }
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

        socket.emit('conversations', conversations);
      } catch (error) {
        console.error('Get conversations error:', error);
        socket.emit('error', 'Failed to get conversations');
      }
    });

    // Handle getting unread message count
    socket.on('get-unread-count', async () => {
      try {
        const unreadCount = await prisma.message.count({
          where: {
            conversation: {
              OR: [
                { buyerId: socket.user.id },
                { sellerId: socket.user.id }
              ]
            },
            userId: { not: socket.user.id },
            isRead: false
          }
        });

        socket.emit('unread-count', unreadCount);
      } catch (error) {
        console.error('Get unread count error:', error);
        socket.emit('error', 'Failed to get unread count');
      }
    });

    // Handle user going online/offline
    socket.on('user-online', () => {
      socket.broadcast.emit('user-status', {
        userId: socket.user.id,
        status: 'online'
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.firstName} disconnected`);
      socket.broadcast.emit('user-status', {
        userId: socket.user.id,
        status: 'offline'
      });
    });
  });
};

module.exports = { setupSocketHandlers };
