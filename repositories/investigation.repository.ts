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
          ip: data.ipAddress || null,
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

  async findByStatus(status: string, skip: number = 0, take: number = 10) {
    try {
      logger.debug('Finding investigations by status', { status })

      const [investigations, total] = await Promise.all([
        prisma.investigation.findMany({
          where: { status },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            results: true,
            reports: true,
          },
        }),
        prisma.investigation.count({ where: { status } }),
      ])

      logger.debug('Investigations fetched by status', { count: investigations.length })
      return {
        data: investigations.map((inv) => this.mapToDto(inv)),
        total,
      }
    } catch (error) {
      logger.error('Failed to find investigations by status', error)
      throw error
    }
  }

  async findByRisk(risk: string, skip: number = 0, take: number = 10) {
    try {
      logger.debug('Finding investigations by risk', { risk })

      const [investigations, total] = await Promise.all([
        prisma.investigation.findMany({
          where: { risk },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            results: true,
            reports: true,
          },
        }),
        prisma.investigation.count({ where: { risk } }),
      ])

      logger.debug('Investigations fetched by risk', { count: investigations.length })
      return {
        data: investigations.map((inv) => this.mapToDto(inv)),
        total,
      }
    } catch (error) {
      logger.error('Failed to find investigations by risk', error)
      throw error
    }
  }

  async search(query: string, skip: number = 0, take: number = 10) {
    try {
      logger.debug('Searching investigations', { query })

      const [investigations, total] = await Promise.all([
        prisma.investigation.findMany({
          where: {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
              { domain: { contains: query, mode: 'insensitive' } },
              { ip: { contains: query, mode: 'insensitive' } },
            ],
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            results: true,
            reports: true,
          },
        }),
        prisma.investigation.count({
          where: {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
              { domain: { contains: query, mode: 'insensitive' } },
              { ip: { contains: query, mode: 'insensitive' } },
            ],
          },
        }),
      ])

      logger.debug('Search results fetched', { count: investigations.length })
      return {
        data: investigations.map((inv) => this.mapToDto(inv)),
        total,
      }
    } catch (error) {
      logger.error('Failed to search investigations', error)
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
      ipAddress: investigation.ip,
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
