import { logger } from '@/lib/logger'
import { IOSINTConnector, OSINTConnectorResult, OSINTConnectorContext } from '../types'

/**
 * Website Metadata Connector - Extracts page metadata
 * Title, description, keywords, language, generator, canonical URL
 */
export class MetadataConnector implements IOSINTConnector {
  name = 'Metadata'
  description = 'Website metadata extraction (title, description, keywords, etc.)'
  supported = ['domain', 'website']
  priority = 70

  async execute(context: OSINTConnectorContext): Promise<OSINTConnectorResult> {
    const startTime = Date.now()

    try {
      logger.debug(`${this.name}: Starting execution`, { target: context.target })

      if (!this.validate(context.target)) {
        return this.errorResult(startTime, 'Invalid domain format')
      }

      // Simulate page fetch and parsing
      await this.delay(500)

      const metadataData = this.generateDummyMetadata(context.target)

      logger.info(`${this.name}: Completed successfully`, { target: context.target })

      return {
        source: this.name,
        category: 'metadata',
        title: `Website Metadata for ${context.target}`,
        description: `Page metadata and SEO information for ${context.target}`,
        data: metadataData,
        confidence: 85,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'success',
      }
    } catch (error) {
      logger.error(`${this.name}: Execution failed`, error)
      return this.errorResult(startTime, String(error))
    }
  }

  validate(target: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i
    const urlRegex = /^https?:\/\/.+/i
    return domainRegex.test(target) || urlRegex.test(target)
  }

  async isAvailable(): Promise<boolean> {
    return true
  }

  private generateDummyMetadata(domain: string): Record<string, any> {
    const sampleTitles = [
      `Welcome to ${domain}`,
      `${domain} - Professional Services`,
      `${domain} | Modern Solutions`,
      `Discover ${domain}`,
    ]

    const sampleDescriptions = [
      `Explore our comprehensive platform at ${domain}. Leading solutions in technology and innovation.`,
      `${domain} offers world-class services and products tailored to your needs.`,
      `Join millions of users on ${domain}. Your trusted partner in digital transformation.`,
    ]

    const keywords = [
      'technology, innovation, digital',
      'service, solution, professional',
      'business, enterprise, cloud',
      'digital, marketing, analytics',
    ]

    const generators = [
      'WordPress 6.2',
      'Wix',
      'Webflow',
      'Hugo',
      'Next.js',
      'Gatsby',
    ]

    const languages = ['en', 'en-US', 'en-GB', 'de', 'fr', 'es', 'ja']

    return {
      title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
      description: sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)],
      keywords: keywords[Math.floor(Math.random() * keywords.length)],
      language: languages[Math.floor(Math.random() * languages.length)],
      charset: 'UTF-8',
      viewport: 'width=device-width, initial-scale=1.0',
      generator: generators[Math.floor(Math.random() * generators.length)],
      canonicalUrl: `https://${domain}/`,
      ogTitle: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
      ogDescription: sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)],
      ogImage: `https://${domain}/og-image.png`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterSite: `@${domain.replace(/\./g, '')}`,
      author: `${domain} Team`,
      robots: 'index, follow',
      refreshInterval: null,
      themeColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
    }
  }

  private errorResult(startTime: number, errorMessage: string): OSINTConnectorResult {
    return {
      source: this.name,
      category: 'metadata',
      title: 'Website Metadata',
      data: {},
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
