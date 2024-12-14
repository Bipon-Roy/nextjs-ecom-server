import nodemailer from "nodemailer";

type profile = { name: string; email: string };

interface EmailOptions {
    profile: profile;
    subject: "verification" | "forget-password" | "password-changed";
    linkUrl?: string;
}

const generateMailTransporter = () => {
    const transport = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
            user: `${process.env.SMTP_USER}`,
            pass: `${process.env.SMTP_PASS}`,
        },
    });
    return transport;
};

const sendEmailVerification = async (profile: profile, linkUrl: string) => {
    const transport = generateMailTransporter();
    await transport.sendMail({
        from: `${process.env.SENDER_EMAIL}`,
        to: profile.email,
        subject: "Verify Your Email Address",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${profile.name || "User"},</h2>
                <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
                <a href="${linkUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>Next E-COM</p>
            </div>
        `,
    });
};

const sendForgetPassLink = async (profile: profile, linkUrl: string) => {
    const transport = generateMailTransporter();
    await transport.sendMail({
        from: `${process.env.SENDER_EMAIL}`,
        to: profile.email,
        subject: "Reset Your Password",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${profile.name || "User"},</h2>
                <p>We received a request to reset your password. Please click the link below to set a new password:</p>
                <a href="${linkUrl}" style="background-color: #FF5722; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
                <p>Best regards,</p>
                <p>Next E-COM</p>
            </div>
        `,
    });
};

const sendUpdatePassConfirmation = async (profile: profile) => {
    const transport = generateMailTransporter();
    await transport.sendMail({
        from: `${process.env.SENDER_EMAIL}`,
        to: profile.email,
        subject: "Password Successfully Updated",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${profile.name || "User"},</h2>
                <p>Your password has been successfully updated. You can now sign in using your new password:</p>
                <a href="${process.env.SIGN_IN_URL}" style="background-color: #2196F3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Sign In</a>
                <p>If you did not make this change, please contact support immediately.</p>
                <p>Best regards,</p>
                <p>Next E-COM</p>
            </div>
        `,
    });
};

export const sendEmail = (options: EmailOptions) => {
    const { profile, subject, linkUrl } = options;

    switch (subject) {
        case "verification": {
            sendEmailVerification(profile, linkUrl!);
            break;
        }
        case "forget-password": {
            sendForgetPassLink(profile, linkUrl!);
            break;
        }
        case "password-changed": {
            sendUpdatePassConfirmation(profile);
            break;
        }
    }
};
