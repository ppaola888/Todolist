import nodemailer from "nodemailer";
import mailConfig from "../../config/config.js";

const sendRegistrationMail = async (email, link) => {
  const subject = "Registration Confirmation";
  const message = `Click on the link to confirm your registration: ${link}`;
  const htmlContent = `
    <div style="font-family: Poppins, sans-serif; text-align: center;">
      <h2 style="color: #2c3e50;">Benvenuto su Todolist Service!</h2>
      <p>Grazie per esserti registrato. Clicca sul pulsante qui sotto per confermare la tua registrazione:</p>
      <a href="${link}" 
      style="display: inline-block; padding: 10px 20px; font-size: 16px; 
                color: #fff; background-color: #3498db; text-decoration: none; 
                border-radius: 5px; margin-top: 10px;">
        Conferma Registrazione
      </a>
      <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
      <p><a href="${link}">${link}</a></p>
    </div>
  `;
  return await nodemailer.createTransport(mailConfig.mailConfig).sendMail({
    from: `"Todolist Service" <${mailConfig.mailConfig.auth.user}>`,
    to: email,
    subject,
    text: message,
    html: htmlContent,
  });
};

export default { sendRegistrationMail };
