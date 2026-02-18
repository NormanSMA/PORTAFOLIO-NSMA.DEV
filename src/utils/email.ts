interface EmailTemplateParams {
  fullName: string;
  email: string;
  message: string;
  reasons: string;
}

export const generateEmailTemplate = ({ fullName, email, message, reasons }: EmailTemplateParams) => {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo Mensaje de Contacto</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); padding: 24px; text-align: center; color: white; }
        .content { padding: 32px 24px; color: #1f2937; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .data-table td { padding: 12px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        .label { font-weight: 600; color: #6b7280; width: 120px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { color: #111827; font-size: 16px; }
        .message-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 8px; }
        .message-text { white-space: pre-wrap; line-height: 1.6; color: #374151; margin: 0; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .highlight { color: #4F46E5; font-weight: 600; }
      </style>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
      
      <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; font-family: sans-serif;">
        
        <!-- Header -->
        <div class="header" style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">Nuevo Contacto</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Desde el Portafolio Web</p>
        </div>

        <!-- Content -->
        <div class="content" style="padding: 32px 24px;">
          
          <table class="data-table" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td class="label" style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; width: 120px; font-size: 14px; text-transform: uppercase;">Nombre</td>
              <td class="value" style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 16px; font-weight: 500;">${fullName}</td>
            </tr>
            <tr>
              <td class="label" style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; width: 120px; font-size: 14px; text-transform: uppercase;">Email</td>
              <td class="value" style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 16px;">
                <a href="mailto:${email}" style="color: #4F46E5; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td class="label" style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; width: 120px; font-size: 14px; text-transform: uppercase;">Motivos</td>
              <td class="value" style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 16px;">${reasons}</td>
            </tr>
          </table>

          <div style="margin-top: 24px;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Mensaje</p>
            <div class="message-card" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <p class="message-text" style="white-space: pre-wrap; line-height: 1.6; color: #374151; margin: 0;">${message}</p>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="footer" style="background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">Recibido el ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
          <p style="margin: 8px 0 0;">© ${currentYear} Portafolio Norman Martínez</p>
        </div>

      </div>
    </body>
    </html>
  `;
};
