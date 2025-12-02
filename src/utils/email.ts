interface EmailTemplateParams {
  fullName: string;
  email: string;
  message: string;
  reasons: string;
}

export const generateEmailTemplate = ({ fullName, email, message, reasons }: EmailTemplateParams) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2 style="color:#0ea5a4;">Nuevo mensaje desde el portafolio</h2>
      <p><strong>Nombre:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Motivos:</strong> ${reasons}</p>
      <hr />
      <h3 style="margin-bottom:6px;">Mensaje:</h3>
      <div style="background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e6eef0;">
        <p style="margin:0;white-space:pre-wrap;">${message}</p>
      </div>
      <p style="font-size:12px;color:#6b7280;margin-top:12px;">Recibido: ${new Date().toLocaleString()}</p>
    </div>
  `;
};
