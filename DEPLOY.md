# 🚀 Guia de Deploy - FeedbackHub

## 📋 Pré-requisitos

### 1. Supabase Setup
1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings > Database** e copie a **Connection String**
4. Substitua `[YOUR-PASSWORD]` pela sua senha do banco
5. Substitua `[YOUR-PROJECT-REF]` pela referência do seu projeto

### 2. GitHub Repository
1. Crie um repositório no GitHub
2. Clone este código para o repositório
3. Faça push das alterações

## 🔧 Configuração do Banco de Dados

### Configurar Supabase
```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env

# 2. Edite o arquivo .env com suas credenciais do Supabase
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres"

# 3. Execute as migrações
npm run migrate:dev

# 4. Execute o seed (dados iniciais)
npm run db:seed
```

## 🌐 Deploy no Render

### Opção 1: Deploy Automático via GitHub
1. Acesse [render.com](https://render.com) e crie uma conta
2. Conecte sua conta do GitHub
3. Clique em **New +** > **Web Service**
4. Selecione seu repositório do FeedbackHub
5. Configure:
   - **Name**: `feedbackhub-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`

### Opção 2: Deploy via render.yaml
1. O arquivo `render.yaml` já está configurado
2. No Render, use **New +** > **Blueprint**
3. Conecte ao seu repositório GitHub
4. O Render criará automaticamente o serviço e banco de dados

### Variáveis de Ambiente no Render
Configure estas variáveis no painel do Render:

```
NODE_ENV=production
JWT_SECRET=seu-jwt-secret-super-forte-aqui
JWT_EXPIRES_IN=8h
DATABASE_URL=postgresql://... (do Supabase)
DIRECT_URL=postgresql://... (do Supabase)
```

## 🔍 Verificação do Deploy

### 1. Teste a API
```bash
# Health check
curl https://seu-app.onrender.com/api/status

# Deve retornar: "FeedbackHub API is running!"
```

### 2. Teste Login
```bash
curl -X POST https://seu-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@feedbackhub.com",
    "senha": "admin123"
  }'
```

## 📊 Credenciais Padrão (após seed)

```
Admin: admin@feedbackhub.com / admin123
Gestor: gestor.dev@feedbackhub.com / gestor123  
Usuário: dev1@feedbackhub.com / user123
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Gerar Prisma Client
npx prisma generate

# Executar migrações
npm run migrate

# Reset do banco (cuidado!)
npx prisma migrate reset

# Ver banco de dados
npx prisma studio
```

## 🚨 Troubleshooting

### Erro de Conexão com Banco
- Verifique se as credenciais do Supabase estão corretas
- Confirme se o projeto Supabase está ativo
- Teste a conexão localmente primeiro

### Erro no Deploy
- Verifique os logs no painel do Render
- Confirme se todas as variáveis de ambiente estão configuradas
- Teste o build localmente: `npm run build`

### Erro de Migração
- Execute `npx prisma migrate reset` (apaga dados!)
- Ou execute `npx prisma db push` para forçar o schema

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do Render
2. Teste localmente primeiro
3. Confirme as configurações do Supabase
4. Verifique se todas as variáveis estão configuradas
