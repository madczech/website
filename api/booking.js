const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, phone, email, arrival, departure, guests, trip_type, message } = req.body;

    if (!name || !email || !arrival || !departure) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const auth = new google.auth.JWT(CLIENT_EMAIL, null, PRIVATE_KEY, [
      'https://www.googleapis.com/auth/spreadsheets',
    ]);

    const sheets = google.sheets({ version: 'v4', auth });

    const timestamp = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, name, phone || '', email, arrival, departure, guests || '2', trip_type || '', message || '']],
      },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Sheets API error:', err);
    return res.status(500).json({ error: 'Failed to save booking' });
  }
};
