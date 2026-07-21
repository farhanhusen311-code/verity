import {
  Mail,
  User,
  Phone,
  Globe,
  Link2,
  Server,
  Building2,
  ShieldCheck,
  Network,
  MapPin,
  Map,
  Code2,
  Contact,
  Share2,
  Camera,
  AtSign,
  Users,
  FileBadge,
  Hash,
  Fingerprint,
  type LucideIcon,
} from 'lucide-react'
import type { EntityTypeStr, RelationshipTypeStr } from '@/services/correlation/types'

/**
 * Visual category groupings used for consistent coloring.
 * Colors are defined per the design spec.
 */
export type NodeCategory =
  | 'email'
  | 'username'
  | 'phone'
  | 'domain'
  | 'website'
  | 'ip'
  | 'organization'
  | 'social'
  | 'infrastructure'
  | 'location'
  | 'other'

export interface NodeVisual {
  label: string
  icon: LucideIcon
  category: NodeCategory
}

/**
 * Maps each backend entity type to its icon + color category.
 * Frontend visual concern only — no analysis happens here.
 */
export const NODE_VISUALS: Record<EntityTypeStr, NodeVisual> = {
  EMAIL: { label: 'Email', icon: Mail, category: 'email' },
  USERNAME: { label: 'Username', icon: User, category: 'username' },
  PHONE_NUMBER: { label: 'Phone', icon: Phone, category: 'phone' },
  FULL_NAME: { label: 'Full Name', icon: User, category: 'username' },
  WEBSITE_URL: { label: 'Website', icon: Link2, category: 'website' },
  DOMAIN: { label: 'Domain', icon: Globe, category: 'domain' },
  SUBDOMAIN: { label: 'Subdomain', icon: Globe, category: 'domain' },
  IP_ADDRESS: { label: 'IP Address', icon: Server, category: 'ip' },
  IPV6: { label: 'IPv6', icon: Server, category: 'ip' },
  ASN: { label: 'ASN', icon: Hash, category: 'infrastructure' },
  DNS_RECORD: { label: 'DNS', icon: Network, category: 'infrastructure' },
  SSL_CERTIFICATE: { label: 'SSL Certificate', icon: FileBadge, category: 'infrastructure' },
  ORGANIZATION: { label: 'Organization', icon: Building2, category: 'organization' },
  REGISTRAR: { label: 'Registrar', icon: ShieldCheck, category: 'infrastructure' },
  COUNTRY: { label: 'Country', icon: Map, category: 'location' },
  CITY: { label: 'City', icon: MapPin, category: 'location' },
  SOCIAL_MEDIA_ACCOUNT: { label: 'Social Media', icon: Share2, category: 'social' },
  GITHUB_ACCOUNT: { label: 'GitHub', icon: Code2, category: 'social' },
  LINKEDIN_ACCOUNT: { label: 'LinkedIn', icon: Contact, category: 'social' },
  FACEBOOK_ACCOUNT: { label: 'Facebook', icon: Users, category: 'social' },
  INSTAGRAM_ACCOUNT: { label: 'Instagram', icon: Camera, category: 'social' },
  X_ACCOUNT: { label: 'X', icon: AtSign, category: 'social' },
}

const FALLBACK_VISUAL: NodeVisual = { label: 'Entity', icon: Fingerprint, category: 'other' }

export function getNodeVisual(type: string): NodeVisual {
  return NODE_VISUALS[type as EntityTypeStr] ?? FALLBACK_VISUAL
}

/**
 * Category color tokens. Each entry provides classes for the different
 * visual states of a node (border, background, text, ring).
 */
export interface CategoryColor {
  border: string
  bg: string
  text: string
  dot: string
  hex: string // used for edges / minimap / PNG export
}

export const CATEGORY_COLORS: Record<NodeCategory, CategoryColor> = {
  email: {
    border: 'border-blue-500/60',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    dot: 'bg-blue-500',
    hex: '#3b82f6',
  },
  username: {
    border: 'border-violet-500/60',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    dot: 'bg-violet-500',
    hex: '#8b5cf6',
  },
  phone: {
    border: 'border-green-500/60',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    dot: 'bg-green-500',
    hex: '#22c55e',
  },
  domain: {
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    dot: 'bg-orange-500',
    hex: '#f97316',
  },
  website: {
    border: 'border-cyan-500/60',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    dot: 'bg-cyan-500',
    hex: '#06b6d4',
  },
  ip: {
    border: 'border-red-500/60',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-500',
    hex: '#ef4444',
  },
  organization: {
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    dot: 'bg-yellow-500',
    hex: '#eab308',
  },
  social: {
    border: 'border-pink-500/60',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    dot: 'bg-pink-500',
    hex: '#ec4899',
  },
  infrastructure: {
    border: 'border-teal-500/60',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    dot: 'bg-teal-500',
    hex: '#14b8a6',
  },
  location: {
    border: 'border-amber-500/60',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
    hex: '#f59e0b',
  },
  other: {
    border: 'border-slate-500/60',
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    dot: 'bg-slate-500',
    hex: '#94a3b8',
  },
}

export function getCategoryColor(type: string): CategoryColor {
  return CATEGORY_COLORS[getNodeVisual(type).category]
}

/**
 * Distinct entity types present in the spec, used to build the legend
 * and the entity-type filter without duplicating category groupings.
 */
export const LEGEND_ITEMS: { category: NodeCategory; label: string }[] = [
  { category: 'email', label: 'Email' },
  { category: 'username', label: 'Username / Name' },
  { category: 'phone', label: 'Phone' },
  { category: 'domain', label: 'Domain' },
  { category: 'website', label: 'Website' },
  { category: 'ip', label: 'IP Address' },
  { category: 'organization', label: 'Organization' },
  { category: 'social', label: 'Social Media' },
  { category: 'infrastructure', label: 'Infrastructure' },
  { category: 'location', label: 'Location' },
]

export const RELATIONSHIP_LABELS: Record<RelationshipTypeStr, string> = {
  OWNS: 'Owns',
  USES: 'Uses',
  REGISTERED_TO: 'Registered To',
  HOSTED_ON: 'Hosted On',
  RESOLVES_TO: 'Resolves To',
  BELONGS_TO: 'Belongs To',
  ASSOCIATED_WITH: 'Associated With',
  LINKED_TO: 'Linked To',
  MENTIONED_IN: 'Mentioned In',
  CONNECTED_TO: 'Connected To',
}

export function getRelationshipLabel(type: string): string {
  return RELATIONSHIP_LABELS[type as RelationshipTypeStr] ?? type
}

export function confidenceColor(confidence: number): string {
  if (confidence >= 75) return 'text-green-400'
  if (confidence >= 50) return 'text-yellow-400'
  if (confidence >= 25) return 'text-orange-400'
  return 'text-red-400'
}
