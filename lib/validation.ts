import { z } from 'zod'

// Create Investigation validation
export const CreateInvestigationSchema = z
  .object({
    email: z.string().email().optional().or(z.literal('')),
    username: z.string().min(1).max(255).optional().or(z.literal('')),
    phone: z.string().regex(/^[0-9+\-\s()]*$/).optional().or(z.literal('')),
    fullName: z.string().min(1).max(255).optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    domain: z.string().min(1).max(255).optional().or(z.literal('')),
    ipAddress: z.string().regex(/^((\d{1,3}\.){3}\d{1,3}|[0-9a-f:]+)$/i).optional().or(z.literal('')),
    includeOsint: z.boolean().default(true),
    includeLeakDetection: z.boolean().default(true),
    includeDomainIntelligence: z.boolean().default(true),
    includeSocialMedia: z.boolean().default(true),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      // At least one identifier must be provided
      const hasIdentifier =
        (data.email && data.email !== '') ||
        (data.username && data.username !== '') ||
        (data.phone && data.phone !== '') ||
        (data.fullName && data.fullName !== '') ||
        (data.website && data.website !== '') ||
        (data.domain && data.domain !== '') ||
        (data.ipAddress && data.ipAddress !== '')

      return hasIdentifier
    },
    {
      message: 'At least one identifier must be provided (email, username, phone, fullName, website, domain, or ipAddress)',
    }
  )

// Update Investigation validation
export const UpdateInvestigationSchema = z.object({
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']).optional(),
  risk: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  findings: z.string().max(5000).optional(),
  notes: z.string().max(1000).optional(),
})

export type CreateInvestigationInput = z.infer<typeof CreateInvestigationSchema>
export type UpdateInvestigationInput = z.infer<typeof UpdateInvestigationSchema>
