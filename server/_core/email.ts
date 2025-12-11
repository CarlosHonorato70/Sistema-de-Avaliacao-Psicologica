/**
 * Email service for sending assessment links to patients
 * This is a placeholder implementation that logs emails instead of actually sending them.
 * 
 * To enable real email sending, integrate with a service like:
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 * - Resend
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface AssessmentLinkEmailData {
  patientName: string;
  patientEmail: string;
  assessmentUrl: string;
  expiresAt: Date;
  psychologistName?: string;
}

/**
 * Generate HTML template for assessment link email
 */
export function generateAssessmentLinkEmailTemplate(data: AssessmentLinkEmailData): string {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avaliação Psicológica</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      color: #4b5563;
      margin-bottom: 30px;
      font-size: 15px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .cta-container {
      text-align: center;
    }
    .info-box {
      background: #f3f4f6;
      border-left: 4px solid #3b82f6;
      padding: 15px 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 5px 0;
      font-size: 14px;
      color: #4b5563;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .link-text {
      word-break: break-all;
      background: #f3f4f6;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      color: #4b5563;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧠 Avaliação Psicológica</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Olá, <strong>${data.patientName}</strong>!
      </div>
      
      <div class="message">
        <p>Você foi convidado(a) a responder um questionário de avaliação psicológica sobre sobre-excitabilidades.</p>
        <p>Este questionário contém 68 questões e leva aproximadamente 15-20 minutos para ser concluído.</p>
      </div>
      
      <div class="cta-container">
        <a href="${data.assessmentUrl}" class="cta-button">
          Responder Questionário
        </a>
      </div>
      
      <div class="info-box">
        <p><strong>⏰ Prazo:</strong> Este link é válido até ${expiryDate}</p>
        <p><strong>📝 Questões:</strong> 68 questões distribuídas em 5 domínios</p>
        <p><strong>⏱️ Tempo estimado:</strong> 15-20 minutos</p>
      </div>
      
      <div class="message">
        <p><strong>Importante:</strong></p>
        <ul style="color: #4b5563; font-size: 14px;">
          <li>Não há respostas certas ou erradas</li>
          <li>Responda com sinceridade o que melhor representa você</li>
          <li>O link só pode ser usado uma vez</li>
          <li>Você pode pausar e voltar mais tarde usando o mesmo link</li>
        </ul>
      </div>
      
      <p style="color: #6b7280; font-size: 13px; margin-top: 30px;">
        Se o botão acima não funcionar, copie e cole este link no seu navegador:
      </p>
      <div class="link-text">
        ${data.assessmentUrl}
      </div>
    </div>
    
    <div class="footer">
      <p>Este é um email automático. Por favor, não responda.</p>
      ${data.psychologistName ? `<p>Enviado por: ${data.psychologistName}</p>` : ''}
      <p style="margin-top: 10px;">Sistema de Avaliação Psicológica</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of assessment link email
 */
export function generateAssessmentLinkEmailText(data: AssessmentLinkEmailData): string {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
Olá, ${data.patientName}!

Você foi convidado(a) a responder um questionário de avaliação psicológica sobre sobre-excitabilidades.

Este questionário contém 68 questões e leva aproximadamente 15-20 minutos para ser concluído.

Acesse o questionário através deste link:
${data.assessmentUrl}

INFORMAÇÕES IMPORTANTES:

⏰ Prazo: Este link é válido até ${expiryDate}
📝 Questões: 68 questões distribuídas em 5 domínios
⏱️ Tempo estimado: 15-20 minutos

LEMBRE-SE:
- Não há respostas certas ou erradas
- Responda com sinceridade o que melhor representa você
- O link só pode ser usado uma vez
- Você pode pausar e voltar mais tarde usando o mesmo link

---
Este é um email automático. Por favor, não responda.
${data.psychologistName ? `Enviado por: ${data.psychologistName}` : ''}
Sistema de Avaliação Psicológica
  `.trim();
}

/**
 * Send email (placeholder implementation)
 * Replace this with actual email service integration
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
  console.log("[Email Service] Would send email:");
  console.log("  To:", options.to);
  console.log("  Subject:", options.subject);
  console.log("  Text preview:", options.text?.substring(0, 100) + "...");
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // For now, just log and return success
  // In production, this would call the actual email service
  return true;
}

/**
 * Send assessment link email to patient
 */
export async function sendAssessmentLinkEmail(data: AssessmentLinkEmailData): Promise<boolean> {
  const html = generateAssessmentLinkEmailTemplate(data);
  const text = generateAssessmentLinkEmailText(data);
  
  return sendEmail({
    to: data.patientEmail,
    subject: "Convite: Responda seu Questionário de Avaliação Psicológica",
    html,
    text,
  });
}

/**
 * Generate WhatsApp message text for assessment link
 */
export function generateWhatsAppMessage(data: AssessmentLinkEmailData): string {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `Olá, ${data.patientName}! 👋

Você foi convidado(a) a responder um questionário de avaliação psicológica. 🧠

📋 *Informações:*
• 68 questões distribuídas em 5 domínios
• Tempo estimado: 15-20 minutos
• Válido até: ${expiryDate}

🔗 *Acesse aqui:*
${data.assessmentUrl}

⚠️ *Importante:*
• Não há respostas certas ou erradas
• Responda com sinceridade
• O link só pode ser usado uma vez

Qualquer dúvida, estou à disposição! 😊`;
}
