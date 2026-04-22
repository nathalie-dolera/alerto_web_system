type SendPasswordResetEmailArgs = {
  email: string;
  name?: string | null;
  webResetUrl: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function sendPasswordResetEmail({
  email,
  name,
  webResetUrl,
}: SendPasswordResetEmailArgs) {
  const apiKey = getRequiredEnv("SENDGRID_API_KEY");
  const fromEmail = getRequiredEnv("SENDGRID_FROM_EMAIL");
  const fromName = process.env.SENDGRID_FROM_NAME || "Alerto";
  const recipientName = name?.trim() || "there";

  const primaryResetUrl = webResetUrl;

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email }],
          subject: "Reset your Alerto password",
        },
      ],
      from: {
        email: fromEmail,
        name: fromName,
      },
      content: [
        {
          type: "text/plain",
          value: `Hi ${recipientName},

Use this link to choose a new password:
${primaryResetUrl}

This link will expire in 30 minutes. If you did not request a password reset, you can ignore this email.`,
        },
        {
          type: "text/html",
          value: `<p>Hi ${recipientName},</p>
<p>We received a request to reset your Alerto password.</p>
<p><a href="${primaryResetUrl}">Reset your password in the app</a></p>
<p>This link will expire in 30 minutes. If you did not request a password reset, you can ignore this email.</p>`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid request failed: ${response.status} ${errorText}`);
  }
}
