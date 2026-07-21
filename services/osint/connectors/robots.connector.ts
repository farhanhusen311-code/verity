import { logger } from '@/lib/logger'
import { IOSINTConnector, OSINTConnectorResult, OSINTConnectorContext } from '../types'

/**
 * Robots.txt Connector - Analyzes robots.txt file
 * Extracts crawling rules and directives
 */
export class RobotsConnector implements IOSINTConnector {
  name = 'Robots.txt'
  description = 'Robots.txt file analysis and crawling rules'
  supported = ['domain', 'website']
  priority = 65

  async execute(context: OSINTConnectorContext): Promise<OSINTConnectorResult> {
    const startTime = Date.now()

    try {
      logger.debug(`${this.name}: Starting execution`, { target: context.target })

      if (!this.validate(context.target)) {
        return this.errorResult(startTime, 'Invalid domain format')
      }

      // Simulate robots.txt fetch
      await this.delay(400)

      const robotsData = this.generateDummyRobotsData()

      logger.info(`${this.name}: Completed successfully`, { target: context.target })

      return {
        source: this.name,
        category: 'infrastructure',
        title: `Robots.txt for ${context.target}`,
        description: `Web crawler directives and SEO information for ${context.target}`,
        data: robotsData,
        confidence: 95,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'success',
        url: `https://${context.target}/robots.txt`,
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

  private generateDummyRobotsData(): Record<string, any> {
    const hasSitemap = Math.random() > 0.3

    const content = `# Robots.txt for website
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /temp/
Crawl-delay: 1
Request-rate: 30/1m

User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Disallow: /

${hasSitemap ? 'Sitemap: https://example.com/sitemap.xml' : ''}`

    const rules = [
      { userAgent: '*', allow: ['/'], disallow: ['/admin/', '/private/', '/temp/'], crawlDelay: 1 },
      { userAgent: 'Googlebot', allow: ['/'], disallow: [], crawlDelay: 0 },
      { userAgent: 'Bingbot', allow: [], disallow: ['/'], crawlDelay: 2 },
    ]

    return {
      status: 'found',
      exists: true,
      httpStatusCode: 200,
      content: content,
      rules: rules,
      sitemaps: hasSitemap ? ['https://example.com/sitemap.xml', 'https://example.com/sitemap-news.xml'] : [],
      crawlDelayDefined: true,
      userAgentCount: Math.floor(Math.random() * 10) + 3,
      disallowedPaths: ['/admin/', '/private/', '/temp/', '/api/', '/*.pdf$'],
      allowedPaths: ['/public/', '/assets/'],
      insights: {
        hasRestrictiveRules: Math.random() > 0.5,
        blocksCrawlers: Math.random() > 0.7,
        blocksBingbot: false,
        hasLongCrawlDelay: false,
      },
    }
  }

  private errorResult(startTime: number, errorMessage: string): OSINTConnectorResult {
    return {
      source: this.name,
      category: 'infrastructure',
      title: 'Robots.txt',
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
