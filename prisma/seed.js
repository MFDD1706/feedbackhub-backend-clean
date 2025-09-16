const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar tipos de feedback
  console.log('📝 Criando tipos de feedback...');
  const feedbackTypes = await Promise.all([
    prisma.feedbackType.upsert({
      where: { nome: 'Desempenho' },
      update: {},
      create: { nome: 'Desempenho' }
    }),
    prisma.feedbackType.upsert({
      where: { nome: 'Comportamento' },
      update: {},
      create: { nome: 'Comportamento' }
    }),
    prisma.feedbackType.upsert({
      where: { nome: 'Projeto Específico' },
      update: {},
      create: { nome: 'Projeto Específico' }
    }),
    prisma.feedbackType.upsert({
      where: { nome: '360°' },
      update: {},
      create: { nome: '360°' }
    })
  ]);

  // Criar equipes
  console.log('👥 Criando equipes...');
  const equipes = await Promise.all([
    prisma.equipe.upsert({
      where: { nome: 'Desenvolvimento' },
      update: {},
      create: {
        nome: 'Desenvolvimento',
        descricao: 'Equipe de desenvolvimento de software'
      }
    }),
    prisma.equipe.upsert({
      where: { nome: 'Marketing' },
      update: {},
      create: {
        nome: 'Marketing',
        descricao: 'Equipe de marketing e comunicação'
      }
    }),
    prisma.equipe.upsert({
      where: { nome: 'Vendas' },
      update: {},
      create: {
        nome: 'Vendas',
        descricao: 'Equipe comercial e vendas'
      }
    }),
    prisma.equipe.upsert({
      where: { nome: 'RH' },
      update: {},
      create: {
        nome: 'RH',
        descricao: 'Recursos Humanos'
      }
    })
  ]);

  // Criar usuário administrador
  console.log('👤 Criando usuário administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@feedbackhub.com' },
    update: {},
    create: {
      nome: 'Administrador Sistema',
      email: 'admin@feedbackhub.com',
      senha: hashedPassword,
      cargo: 'ADMINISTRADOR',
      jobTitle: 'Administrador do Sistema',
      status: 'ATIVO',
      equipeId: equipes[3].id // RH
    }
  });

  // Criar usuários de exemplo
  console.log('👥 Criando usuários de exemplo...');
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'gestor.dev@feedbackhub.com' },
      update: {},
      create: {
        nome: 'João Silva',
        email: 'gestor.dev@feedbackhub.com',
        senha: await bcrypt.hash('gestor123', 10),
        cargo: 'GESTOR',
        jobTitle: 'Gerente de Desenvolvimento',
        status: 'ATIVO',
        equipeId: equipes[0].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'dev1@feedbackhub.com' },
      update: {},
      create: {
        nome: 'Maria Santos',
        email: 'dev1@feedbackhub.com',
        senha: await bcrypt.hash('user123', 10),
        cargo: 'COLABORADOR',
        jobTitle: 'Desenvolvedora Frontend',
        status: 'ATIVO',
        equipeId: equipes[0].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'dev2@feedbackhub.com' },
      update: {},
      create: {
        nome: 'Pedro Costa',
        email: 'dev2@feedbackhub.com',
        senha: await bcrypt.hash('user123', 10),
        cargo: 'COLABORADOR',
        jobTitle: 'Desenvolvedor Backend',
        status: 'ATIVO',
        equipeId: equipes[0].id
      }
    })
  ]);

  // Atualizar gestor da equipe de desenvolvimento
  await prisma.equipe.update({
    where: { id: equipes[0].id },
    data: { gestorId: users[0].id }
  });

  // Criar configurações do sistema
  console.log('⚙️ Criando configurações do sistema...');
  await prisma.systemSettings.upsert({
    where: { key: 'app_name' },
    update: {},
    create: {
      key: 'app_name',
      value: 'FeedbackHub'
    }
  });

  await prisma.systemSettings.upsert({
    where: { key: 'app_version' },
    update: {},
    create: {
      key: 'app_version',
      value: '1.0.0'
    }
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('📊 Dados criados:');
  console.log(`   - ${feedbackTypes.length} tipos de feedback`);
  console.log(`   - ${equipes.length} equipes`);
  console.log(`   - ${users.length + 1} usuários`);
  console.log('');
  console.log('🔑 Credenciais de acesso:');
  console.log('   Admin: admin@feedbackhub.com / admin123');
  console.log('   Gestor: gestor.dev@feedbackhub.com / gestor123');
  console.log('   Usuário: dev1@feedbackhub.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
