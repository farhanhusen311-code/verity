import { logger } from '@/lib/logger'
import { IOSINTConnector, OSINTConnectorRegistry } from './types'
import { WHOISConnector } from './connectors/whois.connector'
import { DNSConnector } from './connectors/dns.connector'
import { SSLConnector } from './connectors/ssl.connector'
import { HTTPHeaderConnector } from './connectors/http-header.connector'
import { MetadataConnector } from './connectors/metadata.connector'
import { RobotsConnector } from './connectors/robots.connector'
import { SecurityTxtConnector } from './connectors/security-txt.connector'

/**
 * OSINT Connector Registry
 * Manages registration and discovery of all OSINT connectors
 */
export class OSINTConnectorRegistry implements OSINTConnectorRegistry {
  private connectors: Map<string, IOSINTConnector> = new Map()

  constructor() {
    this.registerDefaultConnectors()
  }

  /**
   * Register a new connector
   */
  register(connector: IOSINTConnector): void {
    if (this.connectors.has(connector.name)) {
      logger.warn(`Connector ${connector.name} already registered, replacing`, { name: connector.name })
    }

    this.connectors.set(connector.name, connector)
    logger.info(`Connector registered: ${connector.name}`, {
      name: connector.name,
      description: connector.description,
      supported: connector.supported,
    })
  }

  /**
   * Unregister a connector
   */
  unregister(name: string): void {
    if (!this.connectors.has(name)) {
      logger.warn(`Attempting to unregister non-existent connector: ${name}`)
      return
    }

    this.connectors.delete(name)
    logger.info(`Connector unregistered: ${name}`)
  }

  /**
   * Get a specific connector by name
   */
  get(name: string): IOSINTConnector | null {
    return this.connectors.get(name) || null
  }

  /**
   * Get all registered connectors
   */
  getAll(): IOSINTConnector[] {
    return Array.from(this.connectors.values()).sort((a, b) => b.priority - a.priority)
  }

  /**
   * Get connectors that support a specific target type
   */
  getBySupportedType(type: string): IOSINTConnector[] {
    return this.getAll().filter((connector) => connector.supported.includes(type))
  }

  /**
   * Get connector statistics
   */
  getStats(): {
    totalConnectors: number
    connectorNames: string[]
    supportedTypes: string[]
  } {
    const supportedTypes = new Set<string>()
    const connectorNames: string[] = []

    for (const connector of this.connectors.values()) {
      connectorNames.push(connector.name)
      connector.supported.forEach((type) => supportedTypes.add(type))
    }

    return {
      totalConnectors: this.connectors.size,
      connectorNames: connectorNames.sort(),
      supportedTypes: Array.from(supportedTypes).sort(),
    }
  }

  /**
   * Verify all connectors are available
   */
  async verifyAvailability(): Promise<Record<string, boolean>> {
    const availability: Record<string, boolean> = {}

    for (const connector of this.connectors.values()) {
      try {
        availability[connector.name] = await connector.isAvailable()
      } catch (error) {
        logger.error(`Availability check failed for ${connector.name}`, error)
        availability[connector.name] = false
      }
    }

    return availability
  }

  /**
   * Register default connectors
   */
  private registerDefaultConnectors(): void {
    logger.info('Registering default OSINT connectors')

    // Domain/Website connectors
    this.register(new WHOISConnector())
    this.register(new DNSConnector())
    this.register(new SSLConnector())
    this.register(new HTTPHeaderConnector())
    this.register(new MetadataConnector())
    this.register(new RobotsConnector())
    this.register(new SecurityTxtConnector())

    logger.info('Default OSINT connectors registered', {
      count: this.connectors.size,
    })
  }
}

// Global registry instance
let registryInstance: OSINTConnectorRegistry | null = null

export function getOSINTRegistry(): OSINTConnectorRegistry {
  if (!registryInstance) {
    registryInstance = new OSINTConnectorRegistry()
  }
  return registryInstance
}
