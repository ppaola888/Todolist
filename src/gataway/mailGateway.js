import nodemailer from 'nodemailer';
import config from '../../config/config.js';

const sendRegistrationMail = async (email, token) => {
  const confirmationLink = `http://localhost:8000/user/activate/${token}`;
  const subject = 'Registration Confirmation';
  const message = `Click on the link to confirm your registration: ${confirmationLink}`;
  const htmlMessage = `
    <div style="font-family: Poppins, sans-serif; text-align: center; padding: 20px;">
      <h2 style="color: #2c3e50;">Benvenuto su Todolist Service!</h2>
      <p>Grazie per esserti registrato. Clicca sul pulsante qui sotto per confermare la tua registrazione:</p>
      <a href="${confirmationLink}"
      style="display: inline-block; padding: 10px 20px; font-size: 16px; 
                color: #fff; background-color: #3498db; text-decoration: none; 
                border-radius: 5px; margin-top: 10px;">
        Conferma Registrazione
      </a>
      <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
      <p><a href="${confirmationLink}">${confirmationLink}</a></p>
    </div>
  `;

  try {
    return await nodemailer.createTransport(config.mailConfig).sendMail({
      from: `"Todolist Service" <${config.mailConfig.auth.user}>`,
      to: email,
      subject,
      text: message,
      html: htmlMessage,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default { sendRegistrationMail };
