# Backup and Recovery Guide

This document outlines backup strategies and recovery procedures for the Sistema de Avaliação Psicológica.

## Overview

Regular backups are essential to protect against:
- Data loss
- Hardware failures
- Human errors
- Security incidents
- Corruption

## What to Backup

### 1. Database (Critical)
- All MySQL tables
- Schema and migrations
- Stored procedures (if any)

### 2. File Storage (Important)
- AWS S3 assessment files
- Uploaded documents
- Generated reports

### 3. Environment Configuration (Important)
- `.env` file (securely stored)
- SSL certificates
- API keys documentation

### 4. Application Code (Version Controlled)
- Git repository (already backed up on GitHub)
- Configuration files
- Custom scripts

## Backup Strategies

### Database Backup

#### Option 1: Automated Script (Recommended)

Create a backup script `scripts/backup-db.sh`:

```bash
#!/bin/bash

# Configuration
DB_USER="avaliacao_user"
DB_NAME="avaliacao_psicologica"
BACKUP_DIR="/backups/mysql"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting database backup..."
mysqldump \
  --user=$DB_USER \
  --password=$DB_PASS \
  --host=$DB_HOST \
  --port=$DB_PORT \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_FILE"
  
  # Calculate backup size
  SIZE=$(du -h $BACKUP_FILE | cut -f1)
  echo "Backup size: $SIZE"
  
  # Remove old backups
  find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
  echo "Removed backups older than $RETENTION_DAYS days"
else
  echo "Backup failed!"
  exit 1
fi
```

Make it executable:
```bash
chmod +x scripts/backup-db.sh
```

#### Option 2: Node.js Script

Create `scripts/backup-db.ts`:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface BackupConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  backupDir: string;
  retentionDays: number;
}

async function backupDatabase(config: BackupConfig): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(
    config.backupDir,
    `${config.database}_${timestamp}.sql.gz`
  );

  // Ensure backup directory exists
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
  }

  // Create backup
  const command = `mysqldump \
    --host=${config.host} \
    --user=${config.user} \
    --password=${config.password} \
    --single-transaction \
    --routines \
    --triggers \
    ${config.database} | gzip > ${backupFile}`;

  try {
    await execAsync(command);
    console.log(`✅ Backup completed: ${backupFile}`);

    // Clean old backups
    await cleanOldBackups(config.backupDir, config.retentionDays);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

async function cleanOldBackups(backupDir: string, retentionDays: number): Promise<void> {
  const files = fs.readdirSync(backupDir);
  const now = Date.now();
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

  for (const file of files) {
    if (file.endsWith('.sql.gz')) {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > retentionMs) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed old backup: ${file}`);
      }
    }
  }
}

// Run backup
const config: BackupConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'avaliacao_psicologica',
  backupDir: process.env.BACKUP_DIR || './backups',
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
};

backupDatabase(config);
```

Run with:
```bash
tsx scripts/backup-db.ts
```

#### Option 3: Render Automated Backups

If using Render's managed MySQL:
1. Go to your database dashboard
2. Enable "Automated Backups"
3. Configure backup frequency (daily recommended)
4. Set retention period

### AWS S3 Backup

If using AWS S3 for file storage, enable S3 versioning:

```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket your-bucket-name \
  --versioning-configuration Status=Enabled

# Configure lifecycle policy for old versions
aws s3api put-bucket-lifecycle-configuration \
  --bucket your-bucket-name \
  --lifecycle-configuration file://s3-lifecycle.json
```

`s3-lifecycle.json`:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 90
      }
    }
  ]
}
```

### Automated Backup Schedule

#### Using Cron (Linux/macOS)

Add to crontab:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-db.sh

# Add weekly full backup on Sundays at 3 AM
0 3 * * 0 /path/to/scripts/full-backup.sh
```

#### Using Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 2:00 AM)
4. Action: Start a program
5. Program: `C:\path\to\backup-db.bat`

#### Using GitHub Actions (Cloud Backup)

`.github/workflows/backup.yml`:
```yaml
name: Automated Backup

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          # Trigger backup via API or SSH
          echo "Triggering backup..."
```

## Backup Best Practices

### 1. Follow the 3-2-1 Rule
- **3** copies of data
- **2** different storage media
- **1** copy off-site

### 2. Test Backups Regularly
```bash
# Test restore on a separate database
./scripts/test-restore.sh backup_file.sql.gz
```

### 3. Encrypt Sensitive Backups
```bash
# Encrypt backup
gpg --symmetric --cipher-algo AES256 backup.sql.gz

# Decrypt backup
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

### 4. Monitor Backup Success
- Set up alerts for failed backups
- Check backup file sizes
- Verify backup integrity

### 5. Document Retention Policy
- Daily backups: Keep for 7 days
- Weekly backups: Keep for 4 weeks
- Monthly backups: Keep for 12 months
- Yearly backups: Keep indefinitely

## Recovery Procedures

### Database Recovery

#### Full Database Restore

```bash
# From compressed backup
gunzip < backup.sql.gz | mysql \
  --user=avaliacao_user \
  --password=yourpassword \
  --host=localhost \
  avaliacao_psicologica

# From uncompressed backup
mysql \
  --user=avaliacao_user \
  --password=yourpassword \
  --host=localhost \
  avaliacao_psicologica < backup.sql
```

#### Point-in-Time Recovery (if binary logs enabled)

```bash
# Restore base backup
mysql < base_backup.sql

# Apply binary logs
mysqlbinlog \
  --start-datetime="2024-01-01 00:00:00" \
  --stop-datetime="2024-01-01 12:00:00" \
  binlog.000001 | mysql
```

#### Single Table Restore

```bash
# Extract single table from backup
gunzip < backup.sql.gz | \
  sed -n '/Table structure for table `patients`/,/Table structure for table/p' | \
  mysql avaliacao_psicologica
```

### AWS S3 Recovery

#### Restore from S3 Version
```bash
# List object versions
aws s3api list-object-versions \
  --bucket your-bucket-name \
  --prefix path/to/file

# Restore specific version
aws s3api get-object \
  --bucket your-bucket-name \
  --key path/to/file \
  --version-id VERSION_ID \
  restored-file.pdf
```

### Application Recovery

#### From Git Repository
```bash
# Clone repository
git clone https://github.com/CarlosHonorato70/Sistema-de-Avaliacao-Psicologica.git

# Checkout specific version
git checkout v1.0.0

# Install dependencies
pnpm install

# Restore .env file (from secure storage)
# Configure environment variables

# Start application
pnpm build
pnpm start
```

## Disaster Recovery Plan

### Scenario 1: Database Corruption

1. Stop application
2. Assess corruption extent
3. Restore from latest good backup
4. Apply binary logs if available
5. Verify data integrity
6. Restart application
7. Monitor for issues

**Estimated Recovery Time**: 30-60 minutes

### Scenario 2: Complete Server Failure

1. Provision new server
2. Install dependencies (MySQL, Node.js)
3. Clone application from Git
4. Restore database from backup
5. Restore .env configuration
6. Test application
7. Update DNS/load balancer
8. Monitor

**Estimated Recovery Time**: 2-4 hours

### Scenario 3: Data Breach

1. Immediately revoke all access tokens
2. Change all passwords and secrets
3. Isolate affected systems
4. Restore from pre-breach backup
5. Audit all access logs
6. Notify affected users (if applicable)
7. Implement additional security measures

**Estimated Recovery Time**: 4-8 hours

## Backup Checklist

### Daily
- [ ] Verify database backup completed
- [ ] Check backup file size
- [ ] Verify backup uploaded to remote storage

### Weekly
- [ ] Test restore on development environment
- [ ] Review backup logs
- [ ] Clean up old backups

### Monthly
- [ ] Full disaster recovery test
- [ ] Review and update backup scripts
- [ ] Audit backup access controls
- [ ] Review retention policies

### Quarterly
- [ ] Test complete recovery from backup
- [ ] Update disaster recovery documentation
- [ ] Train team on recovery procedures
- [ ] Review and update RTO/RPO objectives

## Backup Storage Locations

### Local Storage
- **Path**: `/backups` or `C:\Backups`
- **Retention**: 7 days
- **Pros**: Fast access
- **Cons**: No protection against hardware failure

### Cloud Storage (Recommended)
- **AWS S3**: Long-term storage with versioning
- **Google Cloud Storage**: Alternative cloud option
- **Backblaze B2**: Cost-effective option
- **Retention**: 90 days to 1 year

### Off-Site Storage
- **External Hard Drive**: Monthly full backups
- **Different Data Center**: For critical production
- **Retention**: 1 year

## Security Considerations

### Backup Encryption
Always encrypt backups containing sensitive data:
- Patient information
- Assessment responses
- Authentication credentials

### Access Control
- Limit who can access backups
- Use separate credentials for backup access
- Audit backup access logs

### Secure Transmission
- Use SFTP or SCP for backup transfers
- Enable encryption in transit (SSL/TLS)
- Verify checksums after transfer

## Monitoring and Alerts

Set up alerts for:
- Backup failure
- Backup size anomalies (too small/large)
- Missing backups
- Storage space issues
- Restore failures during testing

## Contact Information

For backup and recovery assistance:
- **Primary**: DevOps Team
- **Backup**: Database Administrator
- **Emergency**: On-call Engineer

## References

- [MySQL Backup Documentation](https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html)
- [AWS S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
- [Backup Best Practices](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/)

---

**Last Updated**: December 11, 2024  
**Version**: 1.0.0
