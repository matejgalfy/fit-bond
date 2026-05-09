import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY ?? 're_dummy_test_key');

export const emailService = {
    async sendWelcomeEmail(recipientEmail: string, userName: string) {
        return resend.emails.send({
            from: 'onboarding@resend.dev',
            to: recipientEmail,
            subject: `Hi ${userName}, Welcome to FitBond!`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <h2>Welcome to our app! 👋</h2>
                <p>Thank you for registering. Your account has been successfully created and verified.</p>
                <p>You can now log in and start using all the features.</p>
                <br>
                <p>Best regards,<br><strong>Your FitBond Team</strong></p>
                </div>
                `,
        });
    },

    async eventCancelledEmail(recipientEmail: string, eventName: string) {
        return resend.emails.send({
            from: 'info@tvojadomena.sk',
            to: recipientEmail,
            subject: `${eventName} has been cancelled`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <p>We are sorry, but ${eventName} has been cancelled.</p>
                </div>
                `,
        });
    },
};
