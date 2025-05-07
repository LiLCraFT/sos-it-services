import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  if (process.env.SKIP_EMAIL_VERIFICATION === 'true') {
    console.log(`[DEBUG] Email de vérification ignoré pour ${email} (SKIP_EMAIL_VERIFICATION=true)`);
    return;
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Vérification de votre adresse email',
    html: `
      <h1>Bienvenue sur SOS IT Services</h1>
      <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
      <a href="${verificationUrl}">Vérifier mon adresse email</a>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de vérification');
  }
};

export const sendAdminVerificationEmail = async (email: string, token: string) => {
  if (process.env.SKIP_EMAIL_VERIFICATION === 'true') {
    console.log(`[DEBUG] Email de vérification admin ignoré pour ${email} (SKIP_EMAIL_VERIFICATION=true)`);
    return;
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Vérification de votre compte Freelancer',
    html: `
      <h1>Bienvenue sur SOS IT Services</h1>
      <p>Merci de vous être inscrit en tant que Freelancer. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
      <a href="${verificationUrl}">Vérifier mon adresse email</a>
      <p>Une fois votre email vérifié, un administrateur examinera votre demande et activera votre compte.</p>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending admin verification email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de vérification');
  }
}; 