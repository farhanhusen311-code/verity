import { logger } from '@/lib/logger'
import { IOSINTConnector, OSINTConnectorResult, OSINTConnectorContext } from '../types'

/**
 * Security.txt Connector - Retrieves security.txt file
 * Provides security contact information and policies
 */
export class SecurityTxtConnector implements IOSINTConnector {
  name = 'Security.txt'
  description = 'Security.txt file with contact and vulnerability disclosure info'
  supported = ['domain', 'website']
  priority = 60

  async execute(context: OSINTConnectorContext): Promise<OSINTConnectorResult> {
    const startTime = Date.now()

    try {
      logger.debug(`${this.name}: Starting execution`, { target: context.target })

      if (!this.validate(context.target)) {
        return this.errorResult(startTime, 'Invalid domain format')
      }

      // Simulate security.txt fetch
      await this.delay(350)

      const securityData = this.generateDummySecurityData(context.target)

      logger.info(`${this.name}: Completed successfully`, { target: context.target })

      return {
        source: this.name,
        category: 'security',
        title: `Security.txt for ${context.target}`,
        description: `Security vulnerability disclosure and contact information for ${context.target}`,
        data: securityData,
        confidence: Math.random() > 0.4 ? 95 : 30, // Low confidence if not found
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'success',
        url: `https://${context.target}/.well-known/security.txt`,
      }
    } catch (error) {
      logger.error(`${this.name}: Execution failed`, error)
      return this.errorResult(startTime, String(error))
    }
  }

  validate(target: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i
    return domainRegex.test(target)
  }

  async isAvailable(): Promise<boolean> {
    return true
  }

  private generateDummySecurityData(domain: string): Record<string, any> {
    const hasSecurityTxt = Math.random() > 0.3
    const emailAddresses = [
      `security@${domain}`,
      `security-team@${domain}`,
      `abuse@${domain}`,
    ]

    if (!hasSecurityTxt) {
      return {
        status: 'not_found',
        exists: false,
        httpStatusCode: 404,
        message: 'security.txt file not found',
        recommendation: 'Consider creating .well-known/security.txt for better security transparency',
      }
    }

    return {
      status: 'found',
      exists: true,
      httpStatusCode: 200,
      contact: emailAddresses[Math.floor(Math.random() * emailAddresses.length)],
      expires: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      acknowledgements: Math.random() > 0.5 ? `https://${domain}/security/acknowledgements` : null,
      preferredLanguages: ['en', 'en-US'],
      policy: Math.random() > 0.4 ? `https://${domain}/security/policy` : null,
      encryption: {
        pgpKeys: ['https://pgp.key.example.com/security'],
        pgpKeyId: Math.floor(Math.random() * 9999999).toString().toUpperCase(),
      },
      additionalContacts: [
        { name: 'CISO', email: `ciso@${domain}` },
        { name: 'Privacy Officer', email: `privacy@${domain}` },
      ],
      content: `Contact: security@${domain}
Expires: ${new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T00:00:00Z
Preferred-Languages: en
Canonical: https://${domain}/.well-known/security.txt`,
      details: {
        responsesTimeframe: '72 hours',
        hasVulnerabilityProgram: true,
        acceptsEncryptedReports: Math.random() > 0.5,
        hasBugBounty: Math.random() > 0.6,
        hasPublicDisclosure: Math.random() > 0.4,
      },
    }
  }

  private errorResult(startTime: number, errorMessage: string): OSINTConnectorResult {
    return {
      source: this.name,
      category: 'security',
      title: 'Security.txt',
      data: {
        status: 'not_found',
        exists: false,
      },
      confidence: 0,
      error: errorMessage,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      status: 'error',
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
