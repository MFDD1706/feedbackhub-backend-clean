const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `"FeedbackHub" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Template para novo feedback
  async sendNewFeedbackNotification(feedback, recipient) {
    const subject = `Novo Feedback: ${feedback.titulo}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1>FeedbackHub</h1>
          <h2>Novo Feedback Recebido</h2>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h3>${feedback.titulo}</h3>
          <p><strong>Autor:</strong> ${feedback.autor?.nome}</p>
          <p><strong>Tipo:</strong> ${feedback.tipo?.nome}</p>
          <p><strong>Status:</strong> ${feedback.status}</p>
          <p><strong>Data:</strong> ${new Date(feedback.createdAt).toLocaleString('pt-BR')}</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4>Descrição:</h4>
            <p>${feedback.descricao}</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/feedbacks" 
               style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Ver Feedback
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
          <p>Este é um email automático do FeedbackHub. Não responda a este email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(recipient.email, subject, html);
  }

  // Template para atualização de status
  async sendStatusUpdateNotification(feedback, recipient) {
    const subject = `Feedback Atualizado: ${feedback.titulo}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2e7d32; color: white; padding: 20px; text-align: center;">
          <h1>FeedbackHub</h1>
          <h2>Status do Feedback Atualizado</h2>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h3>${feedback.titulo}</h3>
          <p><strong>Novo Status:</strong> <span style="color: #2e7d32; font-weight: bold;">${feedback.status}</span></p>
          <p><strong>Data da Atualização:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4>Descrição Original:</h4>
            <p>${feedback.descricao}</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/feedbacks" 
               style="background-color: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Ver Feedback
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
          <p>Este é um email automático do FeedbackHub. Não responda a este email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(recipient.email, subject, html);
  }

  // Template para novo usuário
  async sendWelcomeEmail(user, temporaryPassword = null) {
    const subject = 'Bem-vindo ao FeedbackHub!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #9c27b0; color: white; padding: 20px; text-align: center;">
          <h1>FeedbackHub</h1>
          <h2>Bem-vindo!</h2>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h3>Olá, ${user.nome}!</h3>
          <p>Sua conta foi criada com sucesso no FeedbackHub.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4>Informações da sua conta:</h4>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Papel:</strong> ${user.papel}</p>
            ${temporaryPassword ? `<p><strong>Senha temporária:</strong> ${temporaryPassword}</p>
            <p style="color: #d32f2f;"><strong>Importante:</strong> Altere sua senha no primeiro acesso.</p>` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
               style="background-color: #9c27b0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Acessar Sistema
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
          <p>Este é um email automático do FeedbackHub. Não responda a este email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Template para relatório semanal
  async sendWeeklyReport(recipient, stats) {
    const subject = 'Relatório Semanal - FeedbackHub';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ed6c02; color: white; padding: 20px; text-align: center;">
          <h1>FeedbackHub</h1>
          <h2>Relatório Semanal</h2>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h3>Resumo da Semana</h3>
          
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <div style="background-color: white; padding: 15px; border-radius: 5px; flex: 1; min-width: 200px;">
              <h4 style="color: #1976d2; margin: 0;">Novos Feedbacks</h4>
              <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stats.newFeedbacks || 0}</p>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; flex: 1; min-width: 200px;">
              <h4 style="color: #2e7d32; margin: 0;">Resolvidos</h4>
              <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stats.resolvedFeedbacks || 0}</p>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; flex: 1; min-width: 200px;">
              <h4 style="color: #ed6c02; margin: 0;">Pendentes</h4>
              <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stats.pendingFeedbacks || 0}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background-color: #ed6c02; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Ver Dashboard
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
          <p>Este é um email automático do FeedbackHub. Não responda a este email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(recipient.email, subject, html);
  }
}

module.exports = new EmailService();
