import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { UserRole } from '@prisma/client'

export class UserRepository {
  async create(data: { name: string; email: string; password: string; role?: UserRole }) {
    try {
      logger.debug('Creating user', { email: data.email })
      
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role || UserRole.ANALYST,
        },
      })

      logger.info('User created', { id: user.id, email: user.email })
      return user
    } catch (error) {
      logger.error('Failed to create user', error)
      throw error
    }
  }

  async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          investigations: true,
          activityLogs: true,
        },
      })

      if (!user) {
        logger.warn('User not found', { id })
        return null
      }

      return user
    } catch (error) {
      logger.error('Failed to find user', error)
      throw error
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      return user
    } catch (error) {
      logger.error('Failed to find user by email', error)
      throw error
    }
  }

  async findAll(skip: number = 0, take: number = 10) {
    try {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count(),
      ])

      return { data: users, total }
    } catch (error) {
      logger.error('Failed to fetch users', error)
      throw error
    }
  }

  async update(id: string, data: { name?: string; role?: UserRole }) {
    try {
      logger.debug('Updating user', { id })
      
      const user = await prisma.user.update({
        where: { id },
        data,
      })

      logger.info('User updated', { id })
      return user
    } catch (error) {
      logger.error('Failed to update user', error)
      throw error
    }
  }

  async delete(id: string) {
    try {
      logger.debug('Deleting user', { id })
      
      await prisma.user.delete({
        where: { id },
      })

      logger.info('User deleted', { id })
    } catch (error) {
      logger.error('Failed to delete user', error)
      throw error
    }
  }
}

export const userRepository = new UserRepository()
