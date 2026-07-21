import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export class InvestigationResultRepository {
  async create(data: {
    investigationId: string
    userId?: string
    source: string
    category: string
    title: string
    description?: string
    url?: string
    confidence?: number
  }) {
    try {
      logger.debug('Creating investigation result', { investigationId: data.investigationId })
      
      const result = await prisma.investigationResult.create({
        data,
      })

      logger.info('Investigation result created', { id: result.id })
      return result
    } catch (error) {
      logger.error('Failed to create investigation result', error)
      throw error
    }
  }

  async findById(id: string) {
    try {
      const result = await prisma.investigationResult.findUnique({
        where: { id },
        include: {
          investigation: true,
          user: true,
        },
      })

      if (!result) {
        logger.warn('Investigation result not found', { id })
        return null
      }

      return result
    } catch (error) {
      logger.error('Failed to find investigation result', error)
      throw error
    }
  }

  async findByInvestigationId(investigationId: string, skip: number = 0, take: number = 10) {
    try {
      const [results, total] = await Promise.all([
        prisma.investigationResult.findMany({
          where: { investigationId },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        }),
        prisma.investigationResult.count({
          where: { investigationId },
        }),
      ])

      return { data: results, total }
    } catch (error) {
      logger.error('Failed to find investigation results', error)
      throw error
    }
  }

  async findBySource(source: string, skip: number = 0, take: number = 10) {
    try {
      const [results, total] = await Promise.all([
        prisma.investigationResult.findMany({
          where: { source },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.investigationResult.count({ where: { source } }),
      ])

      return { data: results, total }
    } catch (error) {
      logger.error('Failed to find results by source', error)
      throw error
    }
  }

  async update(id: string, data: { description?: string; confidence?: number }) {
    try {
      logger.debug('Updating investigation result', { id })
      
      const result = await prisma.investigationResult.update({
        where: { id },
        data,
      })

      logger.info('Investigation result updated', { id })
      return result
    } catch (error) {
      logger.error('Failed to update investigation result', error)
      throw error
    }
  }

  async delete(id: string) {
    try {
      logger.debug('Deleting investigation result', { id })
      
      await prisma.investigationResult.delete({
        where: { id },
      })

      logger.info('Investigation result deleted', { id })
    } catch (error) {
      logger.error('Failed to delete investigation result', error)
      throw error
    }
  }

  async deleteByInvestigationId(investigationId: string) {
    try {
      logger.debug('Deleting results for investigation', { investigationId })
      
      const result = await prisma.investigationResult.deleteMany({
        where: { investigationId },
      })

      logger.info('Investigation results deleted', { count: result.count })
      return result
    } catch (error) {
      logger.error('Failed to delete investigation results', error)
      throw error
    }
  }
}

export const investigationResultRepository = new InvestigationResultRepository()
