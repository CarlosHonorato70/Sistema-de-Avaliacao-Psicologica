# Sistema de Avaliação Psicológica

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)

Sistema web completo para psicólogos gerenciarem avaliações psicológicas de pacientes de forma digital, segura e eficiente.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [Configuração](#configuração)
- [Desenvolvimento](#desenvolvimento)
- [Testes](#testes)
- [Build e Deploy](#build-e-deploy)
- [Troubleshooting](#troubleshooting)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O Sistema de Avaliação Psicológica é uma plataforma web moderna desenvolvida para facilitar o trabalho de psicólogos no processo de avaliação de pacientes. O sistema permite:

- Cadastro e gerenciamento de pacientes
- Geração de links seguros de avaliação
- Envio automático de convites por email ou WhatsApp
- Coleta de respostas de questionários psicológicos
- Análise automatizada com IA das respostas
- Geração de relatórios profissionais
- Auditoria completa de acessos

## ✨ Funcionalidades

### Para Psicólogos

- **Dashboard completo**: Visualização de todos os pacientes e avaliações
- **Gerenciamento de pacientes**: Cadastro com informações detalhadas (nome, idade, email, telefone, notas)
- **Geração de links**: Criação de links únicos e seguros para cada avaliação
- **Envio automatizado**: 
  - Email com template profissional
  - WhatsApp com mensagem pré-formatada
  - Cópia manual do link
- **Expiração customizável**: Defina o prazo de validade de cada link (1-365 dias)
- **Acompanhamento**: Visualize status, acessos e conclusão das avaliações
- **Análise com IA**: Relatórios automáticos com insights sobre as respostas
- **Exportação**: Exporte resultados em formato PDF ou JSON

### Para Pacientes

- **Acesso simplificado**: Link único e direto, sem necessidade de login
- **Interface amigável**: Design responsivo e intuitivo
- **Dashboard personalizado**: Boas-vindas com nome e informações da avaliação
- **Questionário estruturado**: Perguntas organizadas e fáceis de responder
- **Validação em tempo real**: Feedback imediato sobre as respostas
- **Confirmação de envio**: Mensagem clara ao concluir a avaliação

### Segurança

- ✅ Tokens criptograficamente seguros (nanoid - 32 caracteres)
- ✅ Validação de unicidade no banco de dados
- ✅ Controle de expiração server-side
- ✅ Auditoria de acessos (IP, timestamp, contagem)
- ✅ Proteção contra uso múltiplo (link expira após conclusão)
- ✅ Sessões seguras com JWT
- ✅ Sem vulnerabilidades conhecidas (CodeQL verified)

## 🛠 Tecnologias Utilizadas

### Backend

- **Node.js** (v18+) - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express** - Framework web
- **tRPC** - API type-safe end-to-end
- **MySQL** - Banco de dados relacional
- **Drizzle ORM** - ORM TypeScript-first
- **Jose** - JWT para autenticação
- **Nanoid** - Geração de tokens seguros

### Frontend

- **React** (v19) - Biblioteca UI
- **Vite** - Build tool e dev server
- **TanStack Query** - Gerenciamento de estado servidor
- **Wouter** - Roteamento leve
- **Tailwind CSS** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações
- **Recharts** - Gráficos e visualizações

### DevOps & Qualidade

- **Vitest** - Framework de testes
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **GitHub Actions** - CI/CD
- **Docker** - Containerização
- **Render** - Plataforma de deploy

## 📦 Requisitos

- **Node.js**: >= 18.0.0
- **pnpm**: >= 10.4.1 (package manager)
- **MySQL**: >= 8.0
- **Git**: >= 2.0

## 🚀 Instalação

### Windows

1. **Instalar Node.js**:
   - Baixe o instalador em [nodejs.org](https://nodejs.org/)
   - Execute e siga as instruções (marque "Add to PATH")
   - Verifique: `node --version` e `npm --version`

2. **Instalar pnpm**:
   ```powershell
   npm install -g pnpm@10.4.1
   ```

3. **Instalar MySQL**:
   - Baixe o instalador em [mysql.com](https://dev.mysql.com/downloads/installer/)
   - Execute e configure (lembre-se da senha root)
   - Verifique: `mysql --version`

4. **Clonar o repositório**:
   ```powershell
   git clone https://github.com/CarlosHonorato70/Sistema-de-Avaliacao-Psicologica.git
   cd Sistema-de-Avaliacao-Psicologica
   ```

5. **Instalar dependências**:
   ```powershell
   pnpm install
   ```

### macOS

1. **Instalar Homebrew** (se não tiver):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Instalar Node.js e MySQL**:
   ```bash
   brew install node@18
   brew install mysql
   brew services start mysql
   ```

3. **Instalar pnpm**:
   ```bash
   npm install -g pnpm@10.4.1
   ```

4. **Clonar e configurar**:
   ```bash
   git clone https://github.com/CarlosHonorato70/Sistema-de-Avaliacao-Psicologica.git
   cd Sistema-de-Avaliacao-Psicologica
   pnpm install
   ```

### Linux (Ubuntu/Debian)

1. **Instalar Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Instalar pnpm**:
   ```bash
   npm install -g pnpm@10.4.1
   ```

3. **Instalar MySQL**:
   ```bash
   sudo apt-get update
   sudo apt-get install mysql-server
   sudo systemctl start mysql
   sudo mysql_secure_installation
   ```

4. **Clonar e configurar**:
   ```bash
   git clone https://github.com/CarlosHonorato70/Sistema-de-Avaliacao-Psicologica.git
   cd Sistema-de-Avaliacao-Psicologica
   pnpm install
   ```

## ⚙️ Configuração

### 1. Configurar Banco de Dados

Crie o banco de dados MySQL:

```sql
CREATE DATABASE avaliacao_psicologica;
CREATE USER 'avaliacao_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON avaliacao_psicologica.* TO 'avaliacao_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e edite com suas configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as seguintes variáveis **obrigatórias**:

```bash
# Ambiente
NODE_ENV=development

# Servidor
PORT=3000

# Banco de Dados
DATABASE_URL=mysql://avaliacao_user:sua_senha_segura@localhost:3306/avaliacao_psicologica

# Segurança (gere uma string aleatória segura)
SESSION_SECRET=gere_uma_string_aleatoria_de_pelo_menos_32_caracteres_aqui
JWT_SECRET=outra_string_aleatoria_segura_para_jwt

# URL da Aplicação
APP_URL=http://localhost:3000
```

**Variáveis opcionais** para funcionalidades adicionais:

```bash
# AWS S3 (para armazenamento de arquivos)
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket

# Email (SendGrid)
SENDGRID_API_KEY=sua_sendgrid_api_key
FROM_EMAIL=noreply@seudominio.com
FROM_NAME=Sistema de Avaliação Psicológica

# OU Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
FROM_EMAIL=noreply@seudominio.com
FROM_NAME=Sistema de Avaliação Psicológica

# Monitoramento (Sentry)
SENTRY_DSN=https://sua_sentry_dsn

# OpenAI (para análise com IA)
OPENAI_API_KEY=sua_openai_api_key

# CDN (opcional)
CDN_URL=https://cdn.seudominio.com
```

### 3. Executar Migrations

Crie as tabelas no banco de dados:

```bash
pnpm db:push
```

### 4. Validar Configuração

Verifique se tudo está correto:

```bash
pnpm check
```

## 💻 Desenvolvimento

### Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

O sistema estará disponível em:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3000/api`

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor com hot-reload

# Build
pnpm build            # Compila frontend e backend para produção
pnpm start            # Inicia servidor em modo produção

# Qualidade
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formata código com Prettier
pnpm test             # Executa testes
pnpm test:watch       # Testes em modo watch
pnpm test:coverage    # Testes com relatório de cobertura

# Banco de Dados
pnpm db:push          # Executa migrations
pnpm db:studio        # Abre interface visual do banco
```

### Estrutura do Projeto

```
Sistema-de-Avaliacao-Psicologica/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilitários
│   │   └── App.tsx      # Componente raiz
├── server/              # Backend Node.js
│   ├── _core/           # Infraestrutura core
│   │   ├── trpc.ts      # Configuração tRPC
│   │   ├── context.ts   # Context do servidor
│   │   ├── email.ts     # Serviço de email
│   │   └── env.ts       # Variáveis de ambiente
│   ├── routers.ts       # Definição de rotas tRPC
│   ├── db.ts            # Funções de banco de dados
│   └── *.test.ts        # Testes unitários
├── shared/              # Código compartilhado
├── drizzle/             # Migrations e schemas
├── .github/             # GitHub Actions workflows
├── .env.example         # Template de variáveis
├── package.json         # Dependências
├── vite.config.ts       # Configuração Vite
├── vitest.config.ts     # Configuração testes
└── README.md            # Este arquivo
```

## 🧪 Testes

### Executar Todos os Testes

```bash
pnpm test
```

### Testes com Cobertura

```bash
pnpm test:coverage
```

Meta de cobertura: **> 80%**

### Estrutura de Testes

- `server/**/*.test.ts` - Testes do backend
- Frameworks: Vitest
- Cobertura: statements, branches, functions, lines

### Testes Existentes

- ✅ `auth.logout.test.ts` - Autenticação e logout
- ✅ `token-generation.test.ts` - Geração de tokens
- ✅ `assessment-links.test.ts` - Gestão de links
- ✅ `assessment-analysis.test.ts` - Análise de respostas

## 📦 Build e Deploy

### Build Local

```bash
pnpm build
```

Gera arquivos otimizados em:
- `dist/` - Backend compilado
- `dist/public/` - Frontend estático

### Deploy no Render

Consulte o guia detalhado em [DEPLOY.md](./DEPLOY.md)

Resumo:
1. Crie banco MySQL no Render
2. Crie Web Service conectado ao GitHub
3. Configure variáveis de ambiente
4. Deploy automático a cada push

### Deploy com Docker

```bash
# Build da imagem
docker build -t avaliacao-psicologica .

# Executar container
docker run -p 3000:3000 --env-file .env avaliacao-psicologica
```

Ou use docker-compose:

```bash
docker-compose up -d
```

## 🔧 Troubleshooting

### Problema: Erro de conexão com banco de dados

**Sintomas**: `Error: connect ECONNREFUSED` ou `ER_ACCESS_DENIED_ERROR`

**Solução**:
1. Verifique se o MySQL está rodando: `systemctl status mysql` (Linux) ou Activity Monitor (macOS/Windows)
2. Confirme as credenciais no `.env`
3. Teste a conexão: `mysql -u avaliacao_user -p avaliacao_psicologica`
4. Verifique o firewall e portas (3306)

### Problema: Dependências não instalam

**Sintomas**: Erros durante `pnpm install`

**Solução**:
1. Limpe o cache: `pnpm store prune`
2. Delete `node_modules` e `pnpm-lock.yaml`
3. Reinstale: `pnpm install`
4. Verifique a versão do Node.js: `node --version` (deve ser >= 18)

### Problema: Build falha

**Sintomas**: Erros de TypeScript durante build

**Solução**:
1. Execute o check: `pnpm check`
2. Verifique tipos faltando: `pnpm add -D @types/...`
3. Limpe e rebuilde: `rm -rf dist && pnpm build`

### Problema: Testes falham

**Sintomas**: Testes não passam

**Solução**:
1. Verifique variáveis de ambiente de teste
2. Confirme que o banco de teste está configurado
3. Execute testes individualmente: `pnpm vitest run nome-do-teste`
4. Veja logs detalhados: `pnpm test --reporter=verbose`

### Problema: Email não envia

**Sintomas**: Links gerados mas email não chega

**Solução**:
1. Verifique configuração de email no `.env`
2. Confirme credenciais do serviço (SendGrid/SMTP)
3. Veja logs: `tail -f logs/app.log`
4. Para Gmail, use "App Password" ao invés da senha normal
5. Verifique spam/lixo eletrônico

### Problema: Hot-reload não funciona

**Sintomas**: Mudanças não aparecem sem restart

**Solução**:
1. Verifique se está usando `pnpm dev` (não `pnpm start`)
2. Limpe cache do navegador (Ctrl+Shift+R)
3. Reinicie o servidor dev
4. No Windows, pode ser necessário rodar como Administrador

### Suporte Adicional

Se o problema persistir:
1. Veja issues abertas: [GitHub Issues](https://github.com/CarlosHonorato70/Sistema-de-Avaliacao-Psicologica/issues)
2. Abra uma nova issue com:
   - Descrição do problema
   - Passos para reproduzir
   - Versões (Node, OS, etc)
   - Logs de erro
   - Screenshots se aplicável

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

### 1. Fork o Projeto

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/Sistema-de-Avaliacao-Psicologica.git
cd Sistema-de-Avaliacao-Psicologica
```

### 2. Crie uma Branch

```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bugfix
```

### 3. Faça suas Alterações

- Siga o estilo de código existente
- Adicione testes para novas funcionalidades
- Mantenha cobertura > 80%
- Execute `pnpm format` antes de commitar
- Execute `pnpm check` para validar tipos
- Execute `pnpm test` para validar testes

### 4. Commit suas Mudanças

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: adiciona nova funcionalidade X"
git commit -m "fix: corrige bug Y"
git commit -m "docs: atualiza documentação Z"
```

### 5. Push e Pull Request

```bash
git push origin feature/minha-feature
```

Abra um Pull Request no GitHub com:
- Descrição clara das mudanças
- Referência a issues relacionadas
- Screenshots (se aplicável)
- Checklist de validação

### Diretrizes

- **Código limpo**: Siga princípios SOLID
- **Testes**: Todas features devem ter testes
- **Documentação**: Atualize README/docs se necessário
- **Commits**: Mensagens claras e descritivas
- **Issues**: Referencie issues relacionadas
- **Review**: Seja receptivo a feedback

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License

Copyright (c) 2024 Carlos Honorato

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contato

**Desenvolvedor**: Carlos Honorato

- GitHub: [@CarlosHonorato70](https://github.com/CarlosHonorato70)
- Email: contato@seudominio.com

## 🙏 Agradecimentos

- [Manus](https://manus.im) - Framework e infraestrutura base
- Comunidade open-source pelas bibliotecas utilizadas
- Psicólogos que inspiraram este projeto

---

**Feito com ❤️ para facilitar o trabalho de psicólogos e melhorar o atendimento aos pacientes.**
