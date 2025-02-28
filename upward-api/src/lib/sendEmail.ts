import nodemailer from "nodemailer";
export default async function sendEmail(
  credential: { user: string; pass: string },
  from: string,
  to: string,
  subject: string,
  messageHTML: string
) {
  // Importing nodemailer

  // Creating a transporter with your email service configuration
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: credential,
  });

  // Email content
  const mailOptions = {
    from,
    to,
    subject,
    html: messageHTML,
  };

  // Sending the email
  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

}
