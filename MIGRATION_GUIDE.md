# Guia de Migração: MySQL para SQLite

## Visão Geral

Este guia ajuda na migração do sistema de banco de dados MySQL (usado anteriormente no Render) para SQLite local.

## O que Mudou?

### Antes (MySQL)
- Banco de dados hospedado no Render (nuvem)
- Dependia de conexão com servidor MySQL remoto
- Configuração complexa com credenciais
- Problemas de conectividade ocasionais

### Agora (SQLite)
- Banco de dados local em arquivo (`./data/database.sqlite`)
- Sem necessidade de servidor externo
- Configuração simples com apenas um caminho de arquivo
- Dados armazenados localmente

## Instalação Nova (Sem Dados Anteriores)

Se você está instalando pela primeira vez ou não tem dados existentes:

1. **Atualizar dependências**:
   ```bash
   pnpm install
   ```

2. **Configurar variável de ambiente**:
   
   Edite o arquivo `.env`:
   ```bash
   # Remova ou comente a linha DATABASE_URL antiga
   # DATABASE_URL=mysql://...
   
   # Adicione a nova configuração
   DATABASE_PATH=./data/database.sqlite
   ```

3. **Executar migrations**:
   ```bash
   pnpm db:push
   ```

4. **Pronto!** O banco de dados será criado automaticamente em `./data/database.sqlite`

## Migração de Dados Existentes (MySQL → SQLite)

Se você tem dados no MySQL e quer migrar para SQLite:

### Opção 1: Exportar/Importar Manual (Recomendado para poucos dados)

1. **Exportar dados do MySQL**:
   ```bash
   # Conecte ao seu banco MySQL
   mysql -u usuario -p nome_banco
   
   # Exporte os dados
   SELECT * FROM users INTO OUTFILE '/tmp/users.csv' 
   FIELDS TERMINATED BY ',' 
   ENCLOSED BY '"' 
   LINES TERMINATED BY '\n';
   
   # Repita para outras tabelas: patients, assessmentLinks, etc.
   ```

2. **Configurar SQLite**:
   ```bash
   pnpm install
   pnpm db:push
   ```

3. **Importar dados para SQLite**:
   ```bash
   sqlite3 ./data/database.sqlite
   
   .mode csv
   .import /tmp/users.csv users
   # Repita para outras tabelas
   ```

### Opção 2: Script de Migração Automatizado

Crie um script `migrate-data.ts`:

```typescript
import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';

async function migrateData() {
  // Conectar ao MySQL
  const mysqlConn = await mysql.createConnection({
    host: 'seu-host.render.com',
    user: 'usuario',
    password: 'senha',
    database: 'nome_banco'
  });

  // Conectar ao SQLite
  const sqlite = new Database('./data/database.sqlite');

  try {
    // Migrar users
    const [users] = await mysqlConn.query('SELECT * FROM users');
    const insertUser = sqlite.prepare(
      'INSERT INTO users (id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    
    for (const user of users as any[]) {
      insertUser.run(
        user.id,
        user.openId,
        user.name,
        user.email,
        user.loginMethod,
        user.role,
        Math.floor(user.createdAt.getTime() / 1000),
        Math.floor(user.updatedAt.getTime() / 1000),
        Math.floor(user.lastSignedIn.getTime() / 1000)
      );
    }

    console.log('✅ Users migrados com sucesso');

    // Repita para outras tabelas (patients, assessmentLinks, etc.)
    
  } finally {
    await mysqlConn.end();
    sqlite.close();
  }
}

migrateData().catch(console.error);
```

Execute:
```bash
npx tsx migrate-data.ts
```

### Opção 3: Começar do Zero

Se os dados não são críticos, você pode simplesmente começar do zero com SQLite:

1. Instale as dependências
2. Configure o `.env`
3. Execute as migrations
4. Recadastre os dados necessários

## Verificação Pós-Migração

1. **Verificar se o banco foi criado**:
   ```bash
   ls -lh data/database.sqlite
   ```

2. **Verificar tabelas**:
   ```bash
   sqlite3 data/database.sqlite ".tables"
   ```
   
   Deve mostrar:
   ```
   assessmentLinks  assessmentResponses  assessments  patients  users
   ```

3. **Testar o servidor**:
   ```bash
   pnpm dev
   ```
   
   O servidor deve iniciar sem erros de banco de dados.

4. **Executar testes**:
   ```bash
   pnpm test
   ```
   
   Todos os 16 testes devem passar.

## Backup e Restauração

### Fazer Backup

SQLite é apenas um arquivo, então fazer backup é simples:

```bash
# Backup simples
cp ./data/database.sqlite ./data/backup-$(date +%Y%m%d).sqlite

# Backup compactado
tar -czf backup-$(date +%Y%m%d).tar.gz ./data/database.sqlite
```

### Restaurar Backup

```bash
# Parar o servidor
# Copiar o backup de volta
cp ./data/backup-20241211.sqlite ./data/database.sqlite

# Reiniciar o servidor
pnpm dev
```

## Vantagens do SQLite

✅ **Simples**: Um único arquivo, sem servidor externo  
✅ **Rápido**: Acesso local aos dados  
✅ **Confiável**: Não depende de conexão de rede  
✅ **Portátil**: Copie o arquivo .sqlite para mover o banco  
✅ **Sem custo**: Não precisa de serviço de banco em nuvem  
✅ **Fácil backup**: Apenas copie o arquivo  

## Perguntas Frequentes

### Posso usar SQLite em produção?

Sim! SQLite é perfeitamente adequado para aplicações de pequeno a médio porte (até milhares de usuários). Sites famosos como Fossil, Python.org e muitos outros usam SQLite em produção.

### Como fazer backup automático?

Você pode usar um cron job ou script scheduled:

```bash
# Crontab para backup diário às 2h da manhã
0 2 * * * cd /caminho/projeto && cp ./data/database.sqlite ./data/backup-$(date +\%Y\%m\%d).sqlite
```

### E se eu precisar de múltiplas conexões simultâneas?

SQLite suporta múltiplas leituras simultâneas. Para este projeto, o uso típico é adequado. Se precisar de centenas de escritas simultâneas, considere PostgreSQL ou MySQL.

### Posso voltar para MySQL depois?

Sim, você pode exportar os dados do SQLite e importar para MySQL se necessário no futuro.

### Onde ficam os dados?

Os dados ficam no arquivo `./data/database.sqlite` no diretório do projeto. Este arquivo contém todas as tabelas e dados.

## Suporte

Se encontrar problemas durante a migração:

1. Verifique os logs do servidor
2. Execute `pnpm check` para verificar erros de TypeScript
3. Execute `pnpm test` para verificar se tudo está funcionando
4. Consulte a [documentação do Drizzle ORM](https://orm.drizzle.team/)
5. Abra uma issue no GitHub se o problema persistir

## Próximos Passos

Após a migração bem-sucedida:

1. ✅ Faça um backup inicial do banco
2. ✅ Configure backups automáticos
3. ✅ Teste todas as funcionalidades principais
4. ✅ Monitore o tamanho do arquivo do banco (faça rotação de backups se necessário)
5. ✅ Considere usar `.gitignore` para não commitar o banco (já configurado)

---

**Última atualização**: Dezembro 2024
