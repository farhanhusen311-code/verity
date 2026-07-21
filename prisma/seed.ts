import { PrismaClient, UserRole, InvestigationStatus, RiskLevel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🗑️ Clearing existing data...')
  await prisma.activityLog.deleteMany({})
  await prisma.report.deleteMany({})
  await prisma.investigationResult.deleteMany({})
  await prisma.investigation.deleteMany({})
  await prisma.user.deleteMany({})

  // Create admin user
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashed_password_123',
      role: UserRole.ADMIN,
    },
  })

  // Create investigator users
  console.log('👥 Creating investigator users...')
  const investigatorUser = await prisma.user.create({
    data: {
      name: 'John Investigator',
      email: 'john@example.com',
      password: 'hashed_password_456',
      role: UserRole.INVESTIGATOR,
    },
  })

  const analystUser = await prisma.user.create({
    data: {
      name: 'Jane Analyst',
      email: 'jane@example.com',
      password: 'hashed_password_789',
      role: UserRole.ANALYST,
    },
  })

  // Create 20 investigations
  console.log('🔍 Creating 20 investigations...')
  const investigations = []
  const emails = [
    'test1@breach.com',
    'hacker2021@example.com',
    'user.email@company.org',
    'admin@suspicious.net',
    'leaked.account@domain.io',
  ]
  const usernames = ['admin', 'hacker2021', 'john_doe', 'jane_smith', 'test_user']
  const domains = ['example.com', 'suspicious.net', 'data-breach.org', 'phishing-site.io', 'malware-host.cc']
  const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '8.8.8.8', '1.1.1.1']

  for (let i = 0; i < 20; i++) {
    const investigation = await prisma.investigation.create({
      data: {
        email: emails[i % emails.length] ? `test${i}@${emails[i % emails.length].split('@')[1]}` : null,
        username: usernames[i % usernames.length] || null,
        phone: i % 3 === 0 ? `+1555${String(i * 100).padStart(4, '0')}` : null,
        fullName: i % 2 === 0 ? `Test User ${i}` : null,
        website: i % 4 === 0 ? `https://example${i}.com` : null,
        domain: domains[i % domains.length] || null,
        ip: ips[i % ips.length] || null,
        status: [InvestigationStatus.PENDING, InvestigationStatus.RUNNING, InvestigationStatus.COMPLETED, InvestigationStatus.FAILED][i % 4],
        risk: [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL][i % 4],
        notes: `Investigation #${i + 1} - Monitoring for suspicious activity`,
        createdBy: adminUser.id,
        includeOsint: i % 2 === 0,
        includeLeakDetection: i % 3 === 0,
        includeDomainIntelligence: i % 5 !== 0,
        includeSocialMedia: i % 7 === 0,
      },
    })
    investigations.push(investigation)
  }

  // Create 50 investigation results
  console.log('📊 Creating 50 investigation results...')
  const sources = ['email-breach', 'domain-whois', 'ip-geolocation', 'ssl-certificate', 'dns-records', 'port-scan']
  const categories = ['breach', 'whois', 'geolocation', 'certificate', 'dns', 'vulnerability']
  const titles = [
    'Potential data breach detected',
    'Domain registered with anonymity service',
    'IP located in high-risk country',
    'SSL certificate mismatch',
    'Suspicious DNS records found',
    'Open ports detected',
  ]

  for (let i = 0; i < 50; i++) {
    const investigation = investigations[i % investigations.length]
    const sourceIdx = i % sources.length
    const categoryIdx = i % categories.length

    await prisma.investigationResult.create({
      data: {
        investigationId: investigation.id,
        userId: [adminUser.id, investigatorUser.id, analystUser.id][i % 3],
        source: sources[sourceIdx],
        category: categories[categoryIdx],
        title: titles[sourceIdx],
        description: `Result details for ${sources[sourceIdx]} scan on investigation ${i + 1}`,
        url: `https://results.example.com/detail/${i}`,
        confidence: 50 + (i % 50),
      },
    })
  }

  // Create 10 reports
  console.log('📄 Creating 10 reports...')
  for (let i = 0; i < 10; i++) {
    const investigation = investigations[i * 2]

    await prisma.report.create({
      data: {
        investigationId: investigation.id,
        summary: `Comprehensive security report for investigation #${i + 1}. Multiple findings indicate potential security risks.`,
        recommendation: `Recommended actions: 1) Review account credentials, 2) Enable 2FA, 3) Monitor for unauthorized access`,
        pdfUrl: `https://reports.example.com/report-${i + 1}.pdf`,
      },
    })
  }

  // Create activity logs
  console.log('📝 Creating activity logs...')
  const actions = ['created', 'updated', 'deleted', 'viewed', 'exported', 'archived']

  for (let i = 0; i < 30; i++) {
    const user = [adminUser, investigatorUser, analystUser][i % 3]
    const investigation = investigations[i % investigations.length]

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: actions[i % actions.length],
        target: `investigation:${investigation.id}`,
      },
    })
  }

  console.log('✅ Database seed completed successfully!')
  console.log(`
  📊 Summary:
  - 1 Admin user
  - 2 Additional users (Investigator, Analyst)
  - 20 Investigations
  - 50 Investigation results
  - 10 Reports
  - 30 Activity logs
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
