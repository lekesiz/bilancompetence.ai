import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

/**
 * Real-time Service - WebSocket communication
 */

interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: any;
}

interface UserConnection {
  userId: string;
  socketId: string;
  connectedAt: Date;
}

class RealtimeService {
  private io: Server;
  private userConnections: Map<string, UserConnection[]> = new Map();
  private readonly JWT_SECRET = (() => {
    if (!process.env.JWT_SECRET) {
      throw new Error('CRITICAL: JWT_SECRET environment variable is required for realtime service');
    }
    return process.env.JWT_SECRET;
  })();

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        // In production, verify JWT token
        // const decoded = jwt.verify(token, this.JWT_SECRET);
        // socket.userId = decoded.id;
        socket.data.userId = socket.handshake.auth.userId;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup connection event handlers
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      console.log(`User ${userId} connected via socket ${socket.id}`);

      // Store connection
      this.registerUserConnection(userId, socket.id);

      // Join user room
      socket.join(`user:${userId}`);

      // Send connection confirmation
      socket.emit('connected', {
        socketId: socket.id,
        userId,
        timestamp: new Date(),
      });

      // Handle custom events
      socket.on('notification_ack', (data) => {
        console.log(`Notification ACK from ${userId}:`, data);
      });

      socket.on('message', (data) => {
        this.handleMessage(userId, data);
      });

      socket.on('typing', (data) => {
        this.broadcastTyping(userId, data);
      });

      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
        this.removeUserConnection(userId, socket.id);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for user ${userId}:`, error);
      });
    });
  }

  /**
   * Register user connection
   */
  private registerUserConnection(userId: string, socketId: string) {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, []);
    }

    const connections = this.userConnections.get(userId)!;
    connections.push({
      userId,
      socketId,
      connectedAt: new Date(),
    });
  }

  /**
   * Remove user connection
   */
  private removeUserConnection(userId: string, socketId: string) {
    const connections = this.userConnections.get(userId);
    if (connections) {
      const filtered = connections.filter((c) => c.socketId !== socketId);
      if (filtered.length === 0) {
        this.userConnections.delete(userId);
      } else {
        this.userConnections.set(userId, filtered);
      }
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(userId: string, data: any) {
    const { recipientId, message, conversationId } = data;

    // Emit to recipient if online
    this.io.to(`user:${recipientId}`).emit('message', {
      senderId: userId,
      message,
      conversationId,
      timestamp: new Date(),
    });

    // Store message in database (in production)
    console.log(`Message from ${userId} to ${recipientId}: ${message}`);
  }

  /**
   * Broadcast typing indicator
   */
  private broadcastTyping(userId: string, data: any) {
    const { conversationId, isTyping } = data;

    this.io.emit('user_typing', {
      userId,
      conversationId,
      isTyping,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification to user
   */
  public sendNotification(userId: string, notification: NotificationPayload) {
    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification to multiple users
   */
  public broadcastNotification(userIds: string[], notification: NotificationPayload) {
    userIds.forEach((userId) => {
      this.sendNotification(userId, notification);
    });
  }

  /**
   * Send assessment started notification
   */
  public notifyAssessmentStarted(beneficiaryId: string, consultantId?: string) {
    this.sendNotification(beneficiaryId, {
      type: 'assessment_started',
      title: 'Assessment Started',
      message: 'Your assessment has been started',
      data: { type: 'assessment_started' },
    });

    if (consultantId) {
      this.sendNotification(consultantId, {
        type: 'new_assessment',
        title: 'New Assessment',
        message: 'A new assessment has been assigned',
        data: { beneficiaryId },
      });
    }
  }

  /**
   * Send recommendation notification
   */
  public notifyRecommendation(userId: string, title: string, description: string) {
    this.sendNotification(userId, {
      type: 'recommendation',
      title: 'New Recommendation',
      message: title,
      data: { description },
    });
  }

  /**
   * Get online users count
   */
  public getOnlineUsersCount(): number {
    return this.userConnections.size;
  }

  /**
   * Check if user is online
   */
  public isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId);
  }

  /**
   * Get user's socket connections
   */
  public getUserConnections(userId: string): UserConnection[] {
    return this.userConnections.get(userId) || [];
  }

  /**
   * Close connection for testing
   */
  public close() {
    this.io.close();
  }

  /**
   * Get IO instance
   */
  public getIO(): Server {
    return this.io;
  }
}

export default RealtimeService;
