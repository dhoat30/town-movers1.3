import { NextResponse } from "next/server";

const DOMAIN = process.env.MAILGUN_DOMAIN;
const API_KEY = process.env.MAILGUN_API_KEY;
const RECIPIENT_EMAIL = process.env.EMAIL_ADDRESS;
const FROM_EMAIL =
  process.env.MAILGUN_FROM_EMAIL || `postmaster@${process.env.MAILGUN_DOMAIN}`;

const isValidEmail = (value) =>
  typeof value === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
  !/[\r\n]/.test(value);

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeLabel = (label = "") =>
  label
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatFieldValue = (label, value) => {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) return "";
  if (label.toLowerCase() !== "move date") return trimmedValue;

  const timestamp = Number(trimmedValue);
  if (!Number.isFinite(timestamp)) return trimmedValue;

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "full",
    timeZone: "Pacific/Auckland",
  }).format(new Date(timestamp));
};

const parseMessageFields = (message) =>
  message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return null;
      }

      const label = normalizeLabel(line.slice(0, separatorIndex));
      const value = formatFieldValue(label, line.slice(separatorIndex + 1));

      return value ? { label, value } : null;
    })
    .filter(Boolean);

const getFieldValue = (fields, label) =>
  fields.find((field) => field.label.toLowerCase() === label.toLowerCase())
    ?.value || "";

const buildEmailHtml = ({ fields, formName, replyToEmail }) => {
  const customerName = getFieldValue(fields, "First Name") || "Website lead";
  const phone = getFieldValue(fields, "Phone Number");
  const message = getFieldValue(fields, "Message");
  const detailFields = fields.filter(
    (field) => field.label.toLowerCase() !== "message",
  );

  const rows = detailFields
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; width: 34%;">${escapeHtml(label)}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 15px; line-height: 1.5;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const callButton = phone
    ? `<a href="tel:${escapeHtml(phone.replace(/\s+/g, ""))}" style="display: inline-block; margin: 0 8px 8px 0; padding: 11px 16px; background: #111827; color: #ffffff; border-radius: 6px; font-size: 14px; font-weight: 700; text-decoration: none;">Call customer</a>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, Helvetica, sans-serif; color: #111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f3f4f6; padding: 28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
            <tr>
              <td style="background: #0f172a; padding: 24px 28px;">
                <p style="margin: 0 0 8px; color: #93c5fd; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;">Whangarei Movers</p>
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; line-height: 1.25;">New ${escapeHtml(formName)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 28px 8px;">
                <p style="margin: 0 0 18px; color: #374151; font-size: 16px; line-height: 1.55;">
                  ${escapeHtml(customerName)} submitted a form on the website. Replying to this email will go directly to ${escapeHtml(replyToEmail)}.
                </p>
                <a href="mailto:${escapeHtml(replyToEmail)}" style="display: inline-block; margin: 0 8px 8px 0; padding: 11px 16px; background: #2563eb; color: #ffffff; border-radius: 6px; font-size: 14px; font-weight: 700; text-decoration: none;">Reply by email</a>
                ${callButton}
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 28px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                  ${rows}
                </table>
              </td>
            </tr>
            ${
              message
                ? `<tr>
                    <td style="padding: 0 28px 28px;">
                      <h2 style="margin: 0 0 10px; color: #111827; font-size: 16px;">Customer message</h2>
                      <div style="padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; color: #111827; font-size: 15px; line-height: 1.6;">${escapeHtml(message).replace(/\n/g, "<br>")}</div>
                    </td>
                  </tr>`
                : ""
            }
            <tr>
              <td style="padding: 18px 28px; background: #f9fafb; color: #6b7280; font-size: 12px; line-height: 1.5;">
                Sent from the Whangarei Movers website form.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export async function POST(req) {
  try {
    const { email, message, formName } = await req.json();

    if (!DOMAIN || !API_KEY || !RECIPIENT_EMAIL) {
      console.error("Mailgun configuration is incomplete");
      return NextResponse.json(
        { message: "Email service is not configured", success: false },
        { status: 500 },
      );
    }

    const invalidFields = [];

    if (!isValidEmail(email)) invalidFields.push("email");
    if (typeof message !== "string" || !message.trim()) {
      invalidFields.push("message");
    }
    if (typeof formName !== "string" || !formName.trim()) {
      invalidFields.push("formName");
    }

    if (invalidFields.length > 0) {
      console.warn("Invalid sendmail submission", { invalidFields });
      return NextResponse.json(
        {
          message: "Invalid form submission",
          success: false,
          invalidFields,
        },
        { status: 400 },
      );
    }

    const formData = new URLSearchParams();
    const fields = parseMessageFields(message);
    formData.append("from", `Whangarei Movers Website <${FROM_EMAIL}>`);
    formData.append("h:Reply-To", email);
    formData.append("to", RECIPIENT_EMAIL);
    formData.append("subject", formName.replace(/[\r\n]/g, " ").trim());
    formData.append("text", message);
    formData.append(
      "html",
      buildEmailHtml({
        fields,
        formName: formName.replace(/[\r\n]/g, " ").trim(),
        replyToEmail: email,
      }),
    );

    const response = await fetch(
      `https://api.mailgun.net/v3/${DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`api:${API_KEY}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      },
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("Mailgun rejected the message", data);
      return NextResponse.json(
        { message: "Failed to send email", success: false },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { message: "Email sent", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unable to send form email", error);
    return NextResponse.json(
      { message: "Unable to send email", success: false },
      { status: 500 },
    );
  }
}
