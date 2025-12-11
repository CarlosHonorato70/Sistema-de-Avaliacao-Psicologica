# Deployment Guide - Render

Este guia explica como fazer o deploy do Sistema de Avaliação Psicológica no Render.

## Pré-requisitos

- Conta no [Render](https://render.com)
- Conta no GitHub com o repositório do projeto
- Banco de dados MySQL (pode ser criado no Render)

## Passos para Deploy

### 1. Criar o Banco de Dados MySQL

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Clique em "New +" e selecione "MySQL"
3. Configure:
   - **Name**: `avaliacao-psicologica-db`
   - **Database Name**: `avaliacao_psicologica`
   - **User**: `avaliacao_user`
   - **Region**: Oregon (ou mais próxima)
   - **Plan**: Free (para testes)
4. Clique em "Create Database"
5. Aguarde a criação e copie a **Internal Connection String**

### 2. Criar o Web Service

1. No Dashboard, clique em "New +" e selecione "Web Service"
2. Conecte seu repositório do GitHub
3. Configure:
   - **Name**: `avaliacao-psicologica`
   - **Region**: Oregon (mesma do banco)
   - **Branch**: `main` (ou sua branch principal)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (para testes)

### 3. Configurar Variáveis de Ambiente

Na página do Web Service, vá para "Environment" e adicione:

```
NODE_ENV=production
DATABASE_URL=<sua_connection_string_do_mysql>
SESSION_SECRET=<gere_uma_string_aleatoria_segura>
PORT=10000
```

**Importante**: 
- A `DATABASE_URL` deve ser a Internal Connection String copiada do banco MySQL
- O `SESSION_SECRET` deve ser uma string aleatória e segura (pode gerar em https://randomkeygen.com/)

### 4. Executar Migrations

Após o primeiro deploy bem-sucedido:

1. No Dashboard do Web Service, vá para "Shell"
2. Execute o comando:
   ```bash
   npm run db:push
   ```

### 5. Verificar o Deploy

1. Aguarde o build completar (pode levar alguns minutos)
2. Acesse a URL fornecida pelo Render (ex: `https://avaliacao-psicologica.onrender.com`)
3. O sistema deve estar funcionando!

## Funcionalidades Implementadas

✅ **Geração de Tokens Seguros**
- Tokens únicos com 32 caracteres usando nanoid
- Retry automático em caso de colisão
- Validação de unicidade no banco de dados

✅ **Envio de Links por Email e WhatsApp**
- Email automático com template profissional
- Integração com WhatsApp Web
- Opção de copiar link manualmente

✅ **Auditoria de Acesso**
- Rastreamento de acessos (lastAccessedAt, accessCount)
- Registro de endereço IP
- Tracking de emails enviados

✅ **Validações de Segurança**
- Expiração customizável de links (padrão: 30 dias)
- Bloqueio de links já utilizados
- Bloqueio de links expirados
- Validação de dados do paciente

✅ **Interface Amigável**
- Dashboard para psicólogos
- Página de boas-vindas para pacientes
- Feedback visual de status
- Suporte mobile

## Troubleshooting

### Erro de Conexão com Banco
- Verifique se a `DATABASE_URL` está correta
- Confirme que o banco MySQL foi criado
- Teste a conexão usando o Shell do Render

### Build Falha
- Verifique os logs de build no Dashboard
- Confirme que todas as dependências estão no `package.json`
- Certifique-se de que o Node.js version é compatível

### Aplicação não inicia
- Verifique os logs no Dashboard
- Confirme que a porta está configurada corretamente
- Verifique se todas as env vars estão definidas

## Configurações Adicionais (Opcional)

### Email Service (Produção)

Para envios reais de email, você precisa configurar um serviço de email:

1. **SendGrid** (Recomendado):
   ```bash
   npm install @sendgrid/mail
   ```
   Adicione `SENDGRID_API_KEY` nas env vars

2. **AWS SES**:
   ```bash
   npm install @aws-sdk/client-ses
   ```
   Configure credenciais AWS

3. **Nodemailer + SMTP**:
   ```bash
   npm install nodemailer
   ```
   Configure servidor SMTP

Atualize o arquivo `server/_core/email.ts` com a integração escolhida.

### Custom Domain

1. No Dashboard do Web Service, vá para "Settings"
2. Em "Custom Domain", clique em "Add Custom Domain"
3. Siga as instruções para configurar DNS

## Monitoramento

O Render fornece:
- Logs em tempo real
- Métricas de performance
- Alertas de erro
- Health checks automáticos

Acesse através do Dashboard > Seu Service > Logs/Metrics

## Suporte

Para problemas específicos do Render, consulte:
- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)

Para problemas do aplicativo, abra uma issue no repositório do GitHub.
