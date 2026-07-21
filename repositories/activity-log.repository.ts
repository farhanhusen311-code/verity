import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export class ActivityLogRepository {
  async create(data: {
    userId: string
    action: string
    target: string
  }) {
    try {
      logger.debug('Creating activity log', { userId: data.userId, action: data.action })
      
      const log = await prisma.activityLog.create({
        data,
      })

      logger.info('Activity logged', { id: log.id, action: data.action })
      return log
    } catch (error) {
      logger.error('Failed to create activity log', error)
      throw error
    }
  }

  async findById(id: string) {
    try {
      const log = await prisma.activityLog.findUnique({
        where: { id },
        include: { user: true },
      })

      if (!log) {
        logger.warn('Activity log not found', { id })
        return null
      }

      return log
    } catch (error) {
      logger.error('Failed to find activity log', error)
      throw error
    }
  }

  async findByUserId(userId: string, skip: number = 0, take: number = 20) {
    try {
      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          where: { userId },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        }),
        prisma.activityLog.count({ where: { userId } }),
      ])

      return { data: logs, total }
    } catch (error) {
      logger.error('Failed to find user activity logs', error)
      throw error
    }
  }

  async findByAction(action: string, skip: number = 0, take: number = 20) {
    try {
      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          where: { action },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        }),
        prisma.activityLog.count({ where: { action } }),
      ])

      return { data: logs, total }
    } catch (error) {
      logger.error('Failed to find logs by action', error)
      throw error
    }
  }

  async findAll(skip: number = 0, take: number = 20) {
    try {
      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        }),
        prisma.activityLog.count(),
      ])

      return { data: logs, total }
    } catch (error) {
      logger.error('Failed to fetch activity logs', error)
      throw error
    }
  }

  async delete(id: string) {
    try {
      logger.debug('Deleting activity log', { id })
      
      await prisma.activityLog.delete({
        where: { id },
      })

      logger.info('Activity log deleted', { id })
    } catch (error) {
      logger.error('Failed to delete activity log', error)
      throw error
    }
  }

  async deleteByUserId(userId: string) {
    try {
      logger.debug('Deleting logs for user', { userId })
      
      const result = await prisma.activityLog.deleteMany({
        where: { userId },
      })

      logger.info('User activity logs deleted', { count: result.count })
      return result
    } catch (error) {
      logger.error('Failed to delete user activity logs', error)
      throw error
    }
  }
}

export const activityLogRepository = new ActivityLogRepository()
