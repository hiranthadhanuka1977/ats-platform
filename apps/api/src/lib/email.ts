import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = (process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER ?? "no-reply@talenthub.local";

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.");
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return cachedTransporter;
}

export async function sendCandidateOtpEmail(email: string, otp: string) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: "TalentHub verification code",
    text: `Your TalentHub verification code is ${otp}. This code expires in 10 minutes.`,
    html: `
      <p>Your TalentHub verification code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:2px;">${otp}</p>
      <p>This code expires in 10 minutes.</p>
    `,
  });
}
