const {promisify} = require('util');
const Mustache = require('mustache');
const fs = require('fs');

const approvalEmailTemplate = fs.readFileSync("./src/email-templates/submission-approval-email.html").toString();

function getMailgunValue() {
	if(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN && process.env.ADMIN_EMAIL_ADDRESS) {
		console.log('Mailgun API key detected, enabling emails!');
		return require('mailgun-js')({
			apiKey: process.env.MAILGUN_API_KEY,
			domain: process.env.MAILGUN_DOMAIN
		});
	}

	return false;
}

const mailgun = getMailgunValue();

async function sendSubmissionApprovalLink(submissionData) {
	const MailComposer = require('nodemailer/lib/mail-composer');

	const htmlContents = Mustache.render(
		approvalEmailTemplate,
		{
			...submissionData,
			...{
				api_origin: process.env.API_ORIGIN
			}
		}
	);

	const mailOptions = {
		from: `no-reply@${process.env.MAILGUN_DOMAIN}`,
		to: process.env.ADMIN_EMAIL_ADDRESS,
		subject: `A new Lambda layer has been submitted for approval into the database.`,
		text: `Please enable HTML emails.`,
		html: htmlContents
	};

	const mail = new MailComposer(mailOptions);
	const emailData = await mail.compile().build();

	const dataToSend = {
        to: process.env.ADMIN_EMAIL_ADDRESS,
        message: emailData.toString('ascii')
    };

	const sentMailResult = await mailgun.messages().sendMime(
		dataToSend
	);
}

module.exports = {
	mailgun,
	sendSubmissionApprovalLink
};
