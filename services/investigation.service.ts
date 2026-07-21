import { investigationRepository } from '@/repositories/investigation.repository'
import { logger } from '@/lib/logger'
import { InvestigationData, CreateInvestigationInput, UpdateInvestigationInput } from '@/types'
import { getInvestigationEngine } from './investigation/engine'

export class InvestigationService {
  async createInvestigation(input: CreateInvestigationInput): Promise<InvestigationData> {
    try {
      logger.info('Service: Creating new investigation')
      const investigation = await investigationRepository.create(input)

      // Async start investigation engine (non-blocking)
      try {
        const engine = getInvestigationEngine()
        if (engine.isReady()) {
          // Fire and forget - execute in background
          engine.startInvestigation(investigation.id).catch((error) => {
            logger.error('Error executing investigation in background', error)
          })
        }
      } catch (engineError) {
        logger.warn('Investigation engine not ready, will be executed later', engineError)
      }

      return investigation
    } catch (error) {
      logger.error('Service: Error creating investigation', error)
      throw error
    }
  }

  async getInvestigations(page: number = 1, limit: number = 10): Promise<{ data: InvestigationData[]; total: number; page: number; pages: number }> {
    try {
      logger.info('Service: Fetching investigations', { page, limit })
      
      const skip = (page - 1) * limit
      const { data, total } = await investigationRepository.findAll(skip, limit)
      
      return {
        data,
        total,
        page,
        pages: Math.ceil(total / limit),
      }
    } catch (error) {
      logger.error('Service: Error fetching investigations', error)
      throw error
    }
  }

  async getInvestigationById(id: string): Promise<InvestigationData | null> {
    try {
      logger.info('Service: Fetching investigation by ID', { id })
      return await investigationRepository.findById(id)
    } catch (error) {
      logger.error('Service: Error fetching investigation', { id, error })
      throw error
    }
  }

  async updateInvestigation(id: string, input: UpdateInvestigationInput): Promise<InvestigationData> {
    try {
      logger.info('Service: Updating investigation', { id })
      
      // Verify investigation exists
      const existing = await investigationRepository.findById(id)
      if (!existing) {
        throw new Error(`Investigation with ID ${id} not found`)
      }
      
      return await investigationRepository.update(id, input)
    } catch (error) {
      logger.error('Service: Error updating investigation', { id, error })
      throw error
    }
  }

  async deleteInvestigation(id: string): Promise<void> {
    try {
      logger.info('Service: Deleting investigation', { id })
      
      // Verify investigation exists
      const existing = await investigationRepository.findById(id)
      if (!existing) {
        throw new Error(`Investigation with ID ${id} not found`)
      }
      
      await investigationRepository.delete(id)
    } catch (error) {
      logger.error('Service: Error deleting investigation', { id, error })
      throw error
    }
  }

  /**
   * Manually trigger investigation engine execution
   */
  async triggerInvestigation(id: string): Promise<any> {
    try {
      logger.info('Service: Triggering investigation execution', { id })

      // Verify investigation exists
      const existing = await investigationRepository.findById(id)
      if (!existing) {
        throw new Error(`Investigation with ID ${id} not found`)
      }

      const engine = getInvestigationEngine()
      const result = await engine.startInvestigation(id)

      logger.info('Service: Investigation executed successfully', { id })
      return result
    } catch (error) {
      logger.error('Service: Error triggering investigation', { id, error })
      throw error
    }
  }

  /**
   * Get investigation results from engine
   */
  async getInvestigationResults(id: string): Promise<any> {
    try {
      logger.info('Service: Fetching investigation results', { id })

      const engine = getInvestigationEngine()
      const results = await engine.getResults(id)

      logger.info('Service: Results fetched successfully', { id })
      return results
    } catch (error) {
      logger.error('Service: Error fetching results', { id, error })
      throw error
    }
  }
}

export const investigationService = new InvestigationService()
