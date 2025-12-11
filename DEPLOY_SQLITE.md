# Guia de Implantação - SQLite

Este guia explica como fazer o deploy do sistema usando a nova configuração SQLite.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Requisitos](#requisitos)
- [Deploy Local](#deploy-local)
- [Deploy em Servidor VPS](#deploy-em-servidor-vps)
- [Deploy no Render](#deploy-no-render)
- [Deploy com Docker](#deploy-com-docker)
- [Backup e Manutenção](#backup-e-manutenção)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

Com SQLite, o deploy é muito mais simples:
- ✅ Não precisa de servidor de banco de dados separado
- ✅ Dados armazenados em um único arquivo
- ✅ Backup é simples (copiar o arquivo)
- ✅ Sem configuração de credenciais de banco

## 📦 Requisitos

- **Node.js**: >= 18.0.0
- **pnpm**: >= 10.4.1
- **Sistema Operacional**: Linux, macOS ou Windows
- **Espaço em disco**: ~100MB + espaço para dados

## 🏠 Deploy Local

### 1. Preparar o Ambiente

```bash
# Clonar o repositório
git clone https://github.com/CarlosHonorato70/Sistema-de-Avaliacao-Psicologica.git
cd Sistema-de-Avaliacao-Psicologica

# Instalar dependências
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env`:

```bash
# Copiar template
cp .env.example .env
```

Edite `.env` com as configurações mínimas:

```bash
# Ambiente
NODE_ENV=production

# Servidor
PORT=3000
APP_URL=http://localhost:3000

# Banco de Dados SQLite
DATABASE_PATH=./data/database.sqlite

# Segurança (IMPORTANTE: Gere strings aleatórias seguras!)
SESSION_SECRET=sua-chave-secreta-com-pelo-menos-32-caracteres-aqui
JWT_SECRET=outra-chave-secreta-diferente-para-jwt-com-32-chars

# Opcional: Email (para enviar links de avaliação)
# SENDGRID_API_KEY=sua-key
# FROM_EMAIL=noreply@seudominio.com
# FROM_NAME=Sistema de Avaliação Psicológica
```

**⚠️ IMPORTANTE**: Nunca use as chaves do exemplo em produção! Gere suas próprias:

```bash
# Gerar chaves seguras no Linux/macOS
openssl rand -base64 32

# Ou no Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Inicializar o Banco de Dados

```bash
# Criar estrutura do banco
pnpm db:push
```

Isso criará automaticamente:
- O diretório `./data/`
- O arquivo `./data/database.sqlite`
- Todas as tabelas necessárias

### 4. Build da Aplicação

```bash
# Compilar frontend e backend
pnpm build
```

Arquivos gerados em `./dist/`

### 5. Iniciar o Servidor

```bash
# Modo produção
pnpm start
```

✅ Aplicação rodando em: `http://localhost:3000`

## 🖥️ Deploy em Servidor VPS

### Ubuntu/Debian

#### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm@10.4.1

# Instalar ferramentas de build (necessário para better-sqlite3)
sudo apt-get install -y build-essential python3
```

#### 2. Fazer Deploy da Aplicação

```bash
# Criar diretório
sudo mkdir -p /var/www/avaliacao-psicologica
sudo chown $USER:$USER /var/www/avaliacao-psicologica
cd /var/www/avaliacao-psicologica

# Clonar repositório
git clone https://github.com/CarlosHonorato70/Sistema-de-Avaliacao-Psicologica.git .

# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env
nano .env  # Editar com suas configurações

# Build
pnpm build

# Inicializar banco
pnpm db:push
```

#### 3. Configurar como Serviço (systemd)

Criar `/etc/systemd/system/avaliacao-psicologica.service`:

```ini
[Unit]
Description=Sistema de Avaliação Psicológica
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/avaliacao-psicologica
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/avaliacao-psicologica/dist/index.js
Restart=always
RestartSec=10

# Segurança
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/avaliacao-psicologica/data

[Install]
WantedBy=multi-user.target
```

Ativar o serviço:

```bash
# Ajustar permissões
sudo chown -R www-data:www-data /var/www/avaliacao-psicologica

# Ativar serviço
sudo systemctl daemon-reload
sudo systemctl enable avaliacao-psicologica
sudo systemctl start avaliacao-psicologica

# Verificar status
sudo systemctl status avaliacao-psicologica
```

#### 4. Configurar Nginx (Opcional, mas Recomendado)

Criar `/etc/nginx/sites-available/avaliacao-psicologica`:

```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/avaliacao-psicologica /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Configurar SSL (Certbot)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com

# Renovação automática já está configurada
```

## ☁️ Deploy no Render

Mesmo com SQLite, você pode fazer deploy no Render:

### 1. Criar Web Service

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub

### 2. Configurar o Service

**Build Command:**
```bash
pnpm install && pnpm build && pnpm db:push
```

**Start Command:**
```bash
pnpm start
```

**Environment Variables:**
```
NODE_ENV=production
DATABASE_PATH=/opt/render/project/src/data/database.sqlite
SESSION_SECRET=<gere-uma-chave-segura>
JWT_SECRET=<gere-outra-chave-segura>
PORT=10000
```

### 3. Configurar Disco Persistente

⚠️ **IMPORTANTE**: No Render, o filesystem é efêmero por padrão. Para persistir o banco SQLite:

1. Vá em "Settings" do seu service
2. Em "Disks", clique em "Add Disk"
3. Configure:
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: 1 GB (ou mais conforme necessidade)

4. Atualize `DATABASE_PATH` no .env:
```bash
DATABASE_PATH=/opt/render/project/src/data/database.sqlite
```

### 4. Deploy

Clique em "Create Web Service". O Render fará o deploy automaticamente.

**⚠️ Limitação do Render com SQLite:**
- Render pode reiniciar containers, causando perda de dados se não usar disco persistente
- Para produção no Render, considere usar PostgreSQL ao invés de SQLite
- Ou use outro serviço de hospedagem (VPS, AWS, etc.)

## 🐳 Deploy com Docker

### Dockerfile

Já existe um `Dockerfile` no projeto. Para usar SQLite:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependências de build para better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# Copiar arquivos
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm@10.4.1
RUN pnpm install

COPY . .

# Build
RUN pnpm build

# Criar diretório de dados
RUN mkdir -p /app/data && chmod 755 /app/data

# Volume para persistir dados
VOLUME ["/app/data"]

EXPOSE 3000

CMD ["pnpm", "start"]
```

### Docker Compose

Criar `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/database.sqlite
      - SESSION_SECRET=${SESSION_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
    restart: unless-stopped
```

### Deploy com Docker

```bash
# Build
docker-compose build

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## 💾 Backup e Manutenção

### Backup Manual

O backup é extremamente simples com SQLite:

```bash
# Backup básico
cp ./data/database.sqlite ./data/backup-$(date +%Y%m%d-%H%M%S).sqlite

# Backup comprimido
tar -czf backup-$(date +%Y%m%d).tar.gz ./data/database.sqlite
```

### Backup Automático (Cron)

Adicionar ao crontab (`crontab -e`):

```bash
# Backup diário às 3h da manhã
0 3 * * * cd /var/www/avaliacao-psicologica && cp ./data/database.sqlite ./data/backup-$(date +\%Y\%m\%d).sqlite

# Limpeza de backups antigos (manter 30 dias)
0 4 * * * find /var/www/avaliacao-psicologica/data/backup-*.sqlite -mtime +30 -delete
```

### Script de Backup com Rotação

Criar `scripts/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/www/avaliacao-psicologica/backups"
DB_PATH="/var/www/avaliacao-psicologica/data/database.sqlite"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sqlite"

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

# Fazer backup
cp "$DB_PATH" "$BACKUP_FILE"

# Comprimir
gzip "$BACKUP_FILE"

# Manter apenas últimos 30 backups
ls -t "$BACKUP_DIR"/backup-*.sqlite.gz | tail -n +31 | xargs -r rm

echo "Backup criado: $BACKUP_FILE.gz"
```

### Restaurar Backup

```bash
# Parar o servidor
sudo systemctl stop avaliacao-psicologica

# Restaurar
cp ./data/backup-20241211.sqlite ./data/database.sqlite

# Reiniciar servidor
sudo systemctl start avaliacao-psicologica
```

### Monitoramento do Tamanho do Banco

```bash
# Ver tamanho atual
du -h ./data/database.sqlite

# Ver tamanho detalhado por tabela
sqlite3 ./data/database.sqlite "
SELECT 
    name,
    SUM(pgsize) as size_bytes,
    ROUND(SUM(pgsize)/1024.0/1024.0, 2) as size_mb
FROM dbstat 
GROUP BY name 
ORDER BY size_bytes DESC;
"
```

### Otimização (VACUUM)

Periodicamente, otimize o banco:

```bash
# Compactar banco (recuperar espaço)
sqlite3 ./data/database.sqlite "VACUUM;"

# Analisar e otimizar índices
sqlite3 ./data/database.sqlite "ANALYZE;"
```

Adicionar ao cron (mensal):

```bash
# Primeiro domingo do mês às 2h
0 2 1-7 * * [ "$(date +\%u)" = "7" ] && sqlite3 /var/www/avaliacao-psicologica/data/database.sqlite "VACUUM; ANALYZE;"
```

## 🔧 Troubleshooting

### Erro: "Cannot open database"

**Causa**: Diretório `./data` não existe ou sem permissões

**Solução**:
```bash
mkdir -p ./data
chmod 755 ./data
pnpm db:push
```

### Erro: "EACCES: permission denied"

**Causa**: Usuário sem permissão de escrita

**Solução**:
```bash
# No servidor
sudo chown -R www-data:www-data /var/www/avaliacao-psicologica/data
sudo chmod 755 /var/www/avaliacao-psicologica/data
sudo chmod 644 /var/www/avaliacao-psicologica/data/database.sqlite
```

### Erro: "database is locked"

**Causa**: Múltiplos processos tentando escrever simultaneamente

**Solução**: O WAL mode já está habilitado. Se persistir:
```bash
# Verificar processos usando o banco
lsof ./data/database.sqlite

# Reiniciar o serviço
sudo systemctl restart avaliacao-psicologica
```

### Banco Corrompido

**Solução**:
```bash
# 1. Parar o servidor
sudo systemctl stop avaliacao-psicologica

# 2. Verificar integridade
sqlite3 ./data/database.sqlite "PRAGMA integrity_check;"

# 3. Se corrompido, restaurar backup
cp ./data/backup-20241211.sqlite ./data/database.sqlite

# 4. Reiniciar
sudo systemctl start avaliacao-psicologica
```

### Performance Lenta

**Causas comuns**:
1. Banco muito grande sem VACUUM
2. Índices ausentes
3. Disco cheio

**Soluções**:
```bash
# Compactar banco
sqlite3 ./data/database.sqlite "VACUUM; ANALYZE;"

# Verificar espaço em disco
df -h

# Ver estatísticas do banco
sqlite3 ./data/database.sqlite "
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM patients) as total_patients,
    (SELECT COUNT(*) FROM assessmentLinks) as total_links;
"
```

## 📊 Monitoramento

### Health Check

O sistema tem um endpoint de health check:

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-11T17:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 5
    },
    "memory": {
      "used": 150,
      "total": 512,
      "percentage": 29
    }
  }
}
```

### Logs

```bash
# Ver logs do serviço
sudo journalctl -u avaliacao-psicologica -f

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 Segurança

### Permissões Recomendadas

```bash
# Aplicação
chown -R www-data:www-data /var/www/avaliacao-psicologica
chmod 755 /var/www/avaliacao-psicologica

# Banco de dados
chmod 755 /var/www/avaliacao-psicologica/data
chmod 644 /var/www/avaliacao-psicologica/data/database.sqlite

# Arquivo .env
chmod 600 /var/www/avaliacao-psicologica/.env
```

### Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## 📈 Escalabilidade

### Quando Migrar do SQLite?

SQLite é adequado para:
- ✅ Até ~100k requisições/dia
- ✅ Até ~100 usuários simultâneos
- ✅ Banco de dados até ~100GB

Se ultrapassar esses limites, considere:
- PostgreSQL
- MySQL
- Escalar horizontalmente com replicação

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs
2. Consulte a seção de [Troubleshooting](#troubleshooting)
3. Veja o [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
4. Abra uma [issue no GitHub](https://github.com/CarlosHonorato70/Sistema-de-Avaliacao-Psicologica/issues)

---

**Última atualização**: Dezembro 2024  
**Autor**: Carlos Honorato
