import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { InvestigationData, CreateInvestigationInput, UpdateInvestigationInput } from '@/types'

export class InvestigationRepository {
  async create(data: CreateInvestigationInput): Promise<InvestigationData> {
    try {
      logger.debug('Creating investigation', data)
      
      const investigation = await prisma.investigation.create({
        data: {
          email: data.email || null,
          username: data.username || null,
          phone: data.phone || null,
          fullName: data.fullName || null,
          website: data.website || null,
          domain: data.domain || null,
          ipAddress: data.ipAddress || null,
          includeOsint: data.includeOsint ?? true,
          includeLeakDetection: data.includeLeakDetection ?? true,
          includeDomainIntelligence: data.includeDomainIntelligence ?? true,
          includeSocialMedia: data.includeSocialMedia ?? true,
          notes: data.notes || null,
        },
      })

      logger.info('Investigation created', { id: investigation.id })
      return this.mapToDto(investigation)
    } catch (error) {
      logger.error('Failed to create investigation', error)
      throw error
    }
  }

  async findAll(skip: number = 0, take: number = 10): Promise<{ data: InvestigationData[]; total: number }> {
    try {
      logger.debug('Fetching investigations', { skip, take })
      
      const [investigations, total] = await Promise.all([
        prisma.investigation.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.investigation.count(),
      ])

      logger.debug('Investigations fetched', { count: investigations.length, total })
      return {
        data: investigations.map((inv) => this.mapToDto(inv)),
        total,
      }
    } catch (error) {
      logger.error('Failed to fetch investigations', error)
      throw error
    }
  }

  async findById(id: string): Promise<InvestigationData | null> {
    try {
      logger.debug('Finding investigation by ID', { id })
      
      const investigation = await prisma.investigation.findUnique({
        where: { id },
      })

      if (!investigation) {
        logger.warn('Investigation not found', { id })
        return null
      }

      return this.mapToDto(investigation)
    } catch (error) {
      logger.error('Failed to find investigation', error)
      throw error
    }
  }

  async update(id: string, data: UpdateInvestigationInput): Promise<InvestigationData> {
    try {
      logger.debug('Updating investigation', { id, data })
      
      const investigation = await prisma.investigation.update({
        where: { id },
        data: {
          status: data.status,
          risk: data.risk,
          findings: data.findings || undefined,
          notes: data.notes || undefined,
        },
      })

      logger.info('Investigation updated', { id })
      return this.mapToDto(investigation)
    } catch (error) {
      logger.error('Failed to update investigation', { id, error })
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      logger.debug('Deleting investigation', { id })
      
      await prisma.investigation.delete({
        where: { id },
      })

      logger.info('Investigation deleted', { id })
    } catch (error) {
      logger.error('Failed to delete investigation', { id, error })
      throw error
    }
  }

  private mapToDto(investigation: any): InvestigationData {
    return {
      id: investigation.id,
      email: investigation.email,
      username: investigation.username,
      phone: investigation.phone,
      fullName: investigation.fullName,
      website: investigation.website,
      domain: investigation.domain,
      ipAddress: investigation.ipAddress,
      status: investigation.status,
      risk: investigation.risk,
      findings: investigation.findings,
      notes: investigation.notes,
      includeOsint: investigation.includeOsint,
      includeLeakDetection: investigation.includeLeakDetection,
      includeDomainIntelligence: investigation.includeDomainIntelligence,
      includeSocialMedia: investigation.includeSocialMedia,
      createdAt: investigation.createdAt.toISOString(),
      updatedAt: investigation.updatedAt.toISOString(),
    }
  }
}

export const investigationRepository = new InvestigationRepository()
