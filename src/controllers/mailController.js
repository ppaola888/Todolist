import mailGateway from "../gataway/mailGateway.js";

const sendEmail = async (req, res) => {
  const { email, link } = req.body;

  try {
    await mailGateway.sendRegistrationMail(email, link);
    res.status(200).json({ message: "Email has been sent successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
};

export default sendEmail;
