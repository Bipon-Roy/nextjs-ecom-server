import nodemailer from "nodemailer";

type profile = { name: string; email: string };

interface EmailOptions {
    profile: profile;
    subject: "verification" | "forget-password" | "password-changed";
    linkUrl?: string;
}

const generateMailTransporter = () => {
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "d5684974437f37",
            pass: "281ab103473c82",
        },
    });
    return transport;
};

const sendEmailVerification = async (profile: profile, linkUrl: string) => {
    const transport = generateMailTransporter();
    await transport.sendMail({
        from: "verification@nextjsecom.com",
        to: profile.email,
        html: `<h1>Please verify your email by clicking on <a href="${linkUrl}">this link</a></h1>`,
    });
};

const sendForgetPassLink = async (profile: profile, linkUrl: string) => {
    const transport = generateMailTransporter();
    await transport.sendMail({
        from: "verification@nextjsecom.com",
        to: profile.email,
        html: `<h1>Please click on the link to reset your password <a href="${linkUrl}">this link</a></h1>`,
    });
};

const sendUpdatePassConfirmation = async (profile: profile) => {
    const transport = generateMailTransporter();
    await transport.sendMail({
        from: "verification@nextjsecom.com",
        to: profile.email,
        html: `<h1>Your password is successfully changed. <a href="${process.env.SIGN_IN_URL}">SignIn Here</a> </h1>`,
    });
};

export const sendEmail = (options: EmailOptions) => {
    const { profile, subject, linkUrl } = options;

    switch (subject) {
        case "verification": {
            sendEmailVerification(profile, linkUrl!);
        }
        case "forget-password": {
            sendForgetPassLink(profile, linkUrl!);
        }
        case "password-changed": {
            sendUpdatePassConfirmation(profile);
        }
    }
};
