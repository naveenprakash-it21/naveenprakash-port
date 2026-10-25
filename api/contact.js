const nodemailer = require('nodemailer');

const recipient = 'snaveenprakash06@gmail.com';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[character]
  );
}

function sendJson(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function logMailFailure(action, error) {
  const details = {
    code: error && typeof error.code === 'string' ? error.code : 'UNKNOWN',
    command: error && typeof error.command === 'string' ? error.command : 'UNKNOWN'
  };
  console.error(`Contact ${action} email failed:`, details);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  const { name, email, message, company } = req.body || {};

  if (typeof company === 'string' && company.trim()) {
    return sendJson(res, 200, { ok: true, autoReplySent: true });
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return sendJson(res, 400, { error: 'Please complete all fields and try again.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();

  if (
    !cleanName ||
    cleanName.length > 100 ||
    /[\r\n]/.test(cleanName) ||
    !emailPattern.test(cleanEmail) ||
    cleanEmail.length > 254 ||
    /[\r\n]/.test(cleanEmail) ||
    !cleanMessage ||
    cleanMessage.length > 5000
  ) {
    return sendJson(res, 400, { error: 'Please check your details and try again.' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailAppPassword) {
    console.error('Contact email is not configured: missing Gmail environment variables.');
    return sendJson(res, 503, {
      error: 'The contact form is temporarily unavailable. Please try again later.'
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword.replace(/\s/g, '')
    }
  });

  const safeName = escapeHtml(cleanName);
  const safeEmail = escapeHtml(cleanEmail);
  const safeMessage = escapeHtml(cleanMessage).replace(/\r?\n/g, '<br>');

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${gmailUser}>`,
      to: recipient,
      replyTo: cleanEmail,
      subject: 'New portfolio contact inquiry',
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
      html: `<h2>New portfolio inquiry</h2><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Message:</strong><br>${safeMessage}</p>`
    });
  } catch (error) {
    logMailFailure('notification', error);
    return sendJson(res, 502, {
      error: 'Your message could not be delivered. Please try again later.'
    });
  }

  try {
    await transporter.sendMail({
      from: `"Naveen Prakash" <${gmailUser}>`,
      to: cleanEmail,
      replyTo: recipient,
      subject: 'Thanks for contacting me',
      text: 'Thanks for contacting me! You will get a response soon.',
      html: '<p>Thanks for contacting me! You will get a response soon.</p>'
    });
    return sendJson(res, 200, { ok: true, autoReplySent: true });
  } catch (error) {
    logMailFailure('confirmation', error);
    return sendJson(res, 200, { ok: true, autoReplySent: false });
  }
};
