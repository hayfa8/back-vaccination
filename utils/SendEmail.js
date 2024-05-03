import nodemailer from "nodemailer";


// Function to generate a random verification code
export function generateVerificationCode() {
    const length = 9; 
    let result = '';
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }


// email confirmation acc
export const sendEmailConfirmation = async (email, verificationCode, firstName) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587, 
        secure: false, 
        auth: {
          user: "mansourhayfa4@gmail.com", 
          pass: "cuve inpv jhjl cdjs", 
        },
      });
    

      const emailContent = `
      Hi ${firstName},
  
      Thank you for registering on our platform!
  
      Please verify your email address by entering the following code: ${verificationCode}
  
      This code is valid for 24 hours.
  
      Best regards,
  
      The Team
    `;

  // envoyer verification email
  const mailOptions = {
    from: 'Tfa9adni <mansourhayfa4@gmail.com>',
    to: email,
    subject: 'Email Verification',
    text: emailContent,
  };


  await transporter.sendMail(mailOptions);
};


// email reset password
export const SendEmailResetPassword = async (email, verificationCode, firstName) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "mansourhayfa4@gmail.com", 
      pass: "cuve inpv jhjl cdjs", 
    },
  });

  const emailContent = `
    Hi ${firstName},

    You have requested to reset your password.

    Please use the following code to reset your password within 1 hour: ${verificationCode}

    If you did not request a password reset, please ignore this email.

    Best regards,

    The Team
  `;

  const mailOptions = {
    from: 'Tfa9adni <mansourhayfa4@gmail.com>',
    to: email,
    subject: 'Password Reset Request',
    text: emailContent,
  };

  await transporter.sendMail(mailOptions);
};