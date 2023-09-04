import nodemailer from 'nodemailer';
import config from 'config';

const transporter = nodemailer.createTransport(config.get('nodemailer'));

const sendEmail = async (mailOptions) => {
	return await transporter.sendMail(mailOptions);
};

const sendVerificationCode = async (to, subject, text, html) => {
	const mailOptions = {
		from: 'mohammad.bisher.shihab@zohomail.com',
		to,
		subject,
		text,
		html,
	};
	return await sendEmail(mailOptions);
};

export default { sendEmail, sendVerificationCode };
