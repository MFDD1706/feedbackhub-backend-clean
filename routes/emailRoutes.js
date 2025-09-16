const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const emailService = require('../services/emailService');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /email/test:
 *   post:
 *     summary: Testar envio de email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email enviado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 */
router.post('/test', authenticateToken, requireRole(['ADMINISTRADOR']), async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const result = await emailService.sendEmail(to, subject, `<p>${message}</p>`);
    
    if (result.success) {
      res.json({ message: 'Email enviado com sucesso', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Erro ao enviar email', details: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /email/weekly-report:
 *   post:
 *     summary: Enviar relatório semanal para gestores
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatórios enviados com sucesso
 *       403:
 *         description: Acesso negado
 */
router.post('/weekly-report', authenticateToken, requireRole(['ADMINISTRADOR']), async (req, res) => {
  try {
    // Buscar gestores e administradores
    const managers = await prisma.user.findMany({
      where: {
        papel: { in: ['GESTOR', 'ADMINISTRADOR'] },
        status: 'ATIVO'
      }
    });

    // Calcular estatísticas da semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const stats = {
      newFeedbacks: await prisma.feedback.count({
        where: { createdAt: { gte: oneWeekAgo } }
      }),
      resolvedFeedbacks: await prisma.feedback.count({
        where: { 
          status: 'RESOLVIDO',
          updatedAt: { gte: oneWeekAgo }
        }
      }),
      pendingFeedbacks: await prisma.feedback.count({
        where: { status: 'PENDENTE' }
      })
    };

    // Enviar relatório para cada gestor
    const emailPromises = managers.map(manager => 
      emailService.sendWeeklyReport(manager, stats)
    );

    await Promise.all(emailPromises);

    res.json({ 
      message: 'Relatórios semanais enviados com sucesso',
      recipients: managers.length,
      stats
    });
  } catch (error) {
    console.error('Erro ao enviar relatórios semanais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
