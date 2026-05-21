import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationType, MessageStatus, MessageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertConversationMember(conversationId: string, userId: string): Promise<void> {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      select: { id: true, leftAt: true },
    });

    if (!member || member.leftAt) {
      throw new ForbiddenException('Not a conversation member');
    }
  }

  private async getOrCreateDirectConversation(userAId: string, userBId: string): Promise<string> {
    const existing = await this.prisma.conversation.findMany({
      where: {
        type: ConversationType.DIRECT,
        members: {
          some: { userId: userAId, leftAt: null },
        },
        AND: [
          {
            members: {
              some: { userId: userBId, leftAt: null },
            },
          },
        ],
      },
      include: {
        _count: { select: { members: true } },
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });

    const direct = existing.find((c) => c._count.members === 2);
    if (direct) return direct.id;

    const created = await this.prisma.conversation.create({
      data: {
        type: ConversationType.DIRECT,
        createdById: userAId,
        members: {
          create: [
            { userId: userAId },
            { userId: userBId },
          ],
        },
      },
      select: { id: true },
    });

    return created.id;
  }

  async getConversations(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId, leftAt: null },
      include: {
        conversation: {
          include: {
            members: {
              where: { leftAt: null },
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                content: true,
                senderId: true,
                createdAt: true,
                status: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    return memberships.map((m) => ({
      conversationId: m.conversationId,
      type: m.conversation.type,
      title: m.conversation.title,
      updatedAt: m.conversation.updatedAt,
      lastReadAt: m.lastReadAt,
      members: m.conversation.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        image: member.user.image,
      })),
      lastMessage: m.conversation.messages[0] ?? null,
    }));
  }

  async getMessages(conversationId: string, userId: string) {
    await this.assertConversationMember(conversationId, userId);

    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        attachments: true,
        readReceipts: { select: { userId: true, readAt: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(fromUserId: string, toUserId: string, content: string) {
    if (!toUserId) throw new BadRequestException('toUserId is required');
    if (fromUserId === toUserId) throw new BadRequestException('Cannot message yourself');

    const trimmed = (content ?? '').trim();
    if (!trimmed) throw new BadRequestException('Message content is required');

    const conversationId = await this.getOrCreateDirectConversation(fromUserId, toUserId);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: fromUserId,
        type: MessageType.TEXT,
        status: MessageStatus.SENT,
        content: trimmed,
      },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        createdAt: true,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: message.createdAt },
      select: { id: true },
    });

    return { success: true, message };
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.assertConversationMember(conversationId, userId);

    const unread = await this.prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: MessageStatus.DELETED },
        readReceipts: { none: { userId } },
      },
      select: { id: true },
      take: 2000,
    });

    if (unread.length > 0) {
      await this.prisma.messageReadReceipt.createMany({
        data: unread.map((m) => ({ messageId: m.id, userId })),
        skipDuplicates: true,
      });
    }

    await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { lastReadAt: new Date() },
    });

    return { success: true, updated: unread.length };
  }

  async deleteMessage(messageId: string, userId: string) {
    const existing = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException('Message not found');
    }

    if (existing.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        status: MessageStatus.DELETED,
        deletedAt: new Date(),
        content: null,
      },
    });

    return { success: true };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId, leftAt: null },
      select: { conversationId: true },
    });

    if (memberships.length === 0) return 0;
    const conversationIds = memberships.map((m) => m.conversationId);

    return this.prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        status: { not: MessageStatus.DELETED },
        readReceipts: { none: { userId } },
      },
    });
  }
}
