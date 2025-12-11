# Changelog: Migração MySQL → SQLite

## [2.0.0] - 2024-12-11

### 🎯 Objetivo
Resolver problemas de conectividade com o banco de dados MySQL no Render e simplificar o deployment usando SQLite local.

### ⚠️ BREAKING CHANGES

Esta é uma mudança significativa que requer migração de dados para usuários existentes.

- **Banco de dados alterado**: MySQL → SQLite
- **Variável de ambiente alterada**: `DATABASE_URL` → `DATABASE_PATH`
- **Dependência removida**: `mysql2`
- **Nova dependência**: `better-sqlite3`

### ✨ Adicionado

- **SQLite Database**: Implementado armazenamento local usando better-sqlite3
- **MIGRATION_GUIDE.md**: Guia completo de migração para usuários existentes
- **Automatic Directory Creation**: O diretório `./data` é criado automaticamente
- **WAL Mode**: Write-Ahead Logging habilitado para melhor concorrência

### 🔄 Alterado

#### Configuração
- `.env.example`: DATABASE_URL → DATABASE_PATH
- `drizzle.config.ts`: Dialect alterado de "mysql" para "sqlite"
- `server/_core/env.ts`: Variável databaseUrl → databasePath
- `server/_core/env-validator.ts`: Removida validação de DATABASE_URL

#### Schema do Banco de Dados
- `drizzle/schema.ts`: Todos os tipos convertidos de MySQL para SQLite
  - `int()` → `integer()`
  - `varchar()` → `text()`
  - `timestamp()` → `integer({ mode: "timestamp" })`
  - `mysqlTable()` → `sqliteTable()`
  - `mysqlEnum()` → `text({ enum: [...] })`

#### Código do Servidor
- `server/db.ts`: 
  - Trocado `drizzle/mysql2` por `drizzle/better-sqlite3`
  - Implementado criação automática de diretório
  - Habilitado WAL mode para melhor performance
  - Substituído `onDuplicateKeyUpdate` por lógica de check-update-insert
- `server/_core/health.ts`: Ajustado para usar `db.get()` em vez de `db.execute()`

#### Documentação
- `README.md`: 
  - Removidas instruções de instalação do MySQL
  - Adicionadas instruções simplificadas do SQLite
  - Atualizada seção de troubleshooting
  - Atualizada seção de requisitos

#### Testes
- `server/assessment-links.test.ts`: Atualizado para aceitar mensagens de erro do SQLite

### 🗑️ Removido

- **mysql2**: Dependência removida do package.json
- **MySQL Migrations**: Arquivos de migração MySQL antigos removidos
- **MySQL Configuration**: Toda configuração relacionada ao MySQL

### 🔒 Segurança

- ✅ CodeQL scan: 0 vulnerabilidades encontradas
- ✅ Todos os testes passando (16/16)
- ✅ Compilação TypeScript sem erros
- ✅ WAL mode para prevenir database locks

### 📊 Performance

- ⚡ Queries locais são mais rápidas que conexões remotas
- ⚡ Sem latência de rede
- ⚡ WAL mode melhora concorrência de leitura/escrita

### 🐛 Correções

- **Database Connection Issues**: Eliminado problemas de conectividade com Render
- **Network Timeouts**: Não há mais timeouts de conexão
- **Credential Management**: Não precisa mais gerenciar credenciais de banco

### 📦 Dependências

#### Adicionadas
```json
{
  "better-sqlite3": "^12.5.0",
  "@types/better-sqlite3": "^7.6.13"
}
```

#### Removidas
```json
{
  "mysql2": "^3.15.0"
}
```

### 🔧 Migração

Para usuários existentes, consulte `MIGRATION_GUIDE.md` para instruções detalhadas de migração.

**Passos Rápidos:**
1. Atualize as dependências: `pnpm install`
2. Atualize `.env`: mude `DATABASE_URL` para `DATABASE_PATH=./data/database.sqlite`
3. Execute migrations: `pnpm db:push`
4. (Opcional) Migre dados existentes do MySQL seguindo o guia

### ✅ Testes

Todos os testes foram atualizados e passam com sucesso:

```bash
✓ server/assessment-analysis.test.ts (5 tests)
✓ server/auth.logout.test.ts (1 test)
✓ server/assessment-links.test.ts (6 tests)
✓ server/token-generation.test.ts (4 tests)

Test Files  4 passed (4)
Tests      16 passed (16)
```

### 📝 Notas Técnicas

#### Por que SQLite?

1. **Simplicidade**: Sem necessidade de servidor de banco externo
2. **Portabilidade**: Um único arquivo contém todo o banco
3. **Confiabilidade**: Não depende de conexão de rede
4. **Performance**: Acesso local é mais rápido
5. **Custo**: Sem custos de serviço de banco em nuvem
6. **Backup**: Simples cópia de arquivo

#### Limitações do SQLite

- **Concorrência**: Múltiplas escritas simultâneas são serializadas
- **Escala**: Ideal para pequeno/médio porte (até ~100k requests/dia)
- **Rede**: Não suporta acesso remoto direto (apenas local)

Para este projeto, SQLite é mais do que adequado para as necessidades típicas.

#### Timestamp Handling

SQLite armazena timestamps como integers (Unix epoch), mas Drizzle ORM com `mode: "timestamp"` 
converte automaticamente entre `Date` objects do JavaScript e Unix timestamps.

```typescript
// No código
updateSet.updatedAt = new Date();

// No banco (SQLite)
// Armazenado como: 1702308000 (Unix timestamp)

// Ao ler do banco
// Convertido de volta para: Date object
```

### 🔗 Links Úteis

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Drizzle ORM SQLite Guide](https://orm.drizzle.team/docs/get-started-sqlite)
- [WAL Mode Explanation](https://www.sqlite.org/wal.html)

### 👥 Contribuidores

- [@CarlosHonorato70](https://github.com/CarlosHonorato70) - Implementação
- GitHub Copilot - Assistência na migração

### 📅 Timeline

- **2024-12-11 17:00**: Início da migração
- **2024-12-11 17:30**: Schema convertido e migrations geradas
- **2024-12-11 17:35**: Testes atualizados e passando
- **2024-12-11 17:38**: Documentação atualizada
- **2024-12-11 17:40**: Code review e correções aplicadas
- **2024-12-11 17:42**: ✅ Migração completa

---

**Status**: ✅ COMPLETO  
**Breaking Changes**: Sim  
**Backward Compatible**: Não (requer migração)  
**Recommended Action**: Seguir MIGRATION_GUIDE.md
