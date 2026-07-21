import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export class ReportRepository {
  async create(data: {
    investigationId: string
    summary: string
    recommendation?: string
    pdfUrl?: string
  }) {
    try {
      logger.debug('Creating report', { investigationId: data.investigationId })
      
      const report = await prisma.report.create({
        data,
      })

      logger.info('Report created', { id: report.id })
      return report
    } catch (error) {
      logger.error('Failed to create report', error)
      throw error
    }
  }

  async findById(id: string) {
    try {
      const report = await prisma.report.findUnique({
        where: { id },
        include: { investigation: true },
      })

      if (!report) {
        logger.warn('Report not found', { id })
        return null
      }

      return report
    } catch (error) {
      logger.error('Failed to find report', error)
      throw error
    }
  }

  async findByInvestigationId(investigationId: string) {
    try {
      const reports = await prisma.report.findMany({
        where: { investigationId },
        orderBy: { createdAt: 'desc' },
      })

      return reports
    } catch (error) {
      logger.error('Failed to find reports by investigation', error)
      throw error
    }
  }

  async findAll(skip: number = 0, take: number = 10) {
    try {
      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { investigation: true },
        }),
        prisma.report.count(),
      ])

      return { data: reports, total }
    } catch (error) {
      logger.error('Failed to fetch reports', error)
      throw error
    }
  }

  async update(id: string, data: { summary?: string; recommendation?: string; pdfUrl?: string }) {
    try {
      logger.debug('Updating report', { id })
      
      const report = await prisma.report.update({
        where: { id },
        data,
      })

      logger.info('Report updated', { id })
      return report
    } catch (error) {
      logger.error('Failed to update report', error)
      throw error
    }
  }

  async delete(id: string) {
    try {
      logger.debug('Deleting report', { id })
      
      await prisma.report.delete({
        where: { id },
      })

      logger.info('Report deleted', { id })
    } catch (error) {
      logger.error('Failed to delete report', error)
      throw error
    }
  }

  async deleteByInvestigationId(investigationId: string) {
    try {
      logger.debug('Deleting reports for investigation', { investigationId })
      
      const result = await prisma.report.deleteMany({
        where: { investigationId },
      })

      logger.info('Reports deleted', { count: result.count })
      return result
    } catch (error) {
      logger.error('Failed to delete reports', error)
      throw error
    }
  }
}

export const reportRepository = new ReportRepository()
