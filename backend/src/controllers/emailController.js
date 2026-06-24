const nodemailer = require('nodemailer');
const db = require('../config/db');

exports.sendTripEmail = async (req, res) => {
  const { id: tripId } = req.params;
  const userId = req.user.id;

  try {
    const [trips] = await db.query(
      `SELECT trips.*, destinations.name as destination_name 
             FROM trips 
             LEFT JOIN destinations ON trips.destination_id = destinations.id 
             WHERE trips.id = ? AND trips.user_id = ?`,
      [tripId, userId]
    );

    if (trips.length === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const trip = trips[0];

    const [users] = await db.query(
      'SELECT email, username FROM users WHERE id = ?',
      [userId]
    );
    const userEmail = users[0].email;
    const username = users[0].username;

    const [activities] = await db.query(
      'SELECT * FROM activities WHERE trip_id = ? ORDER BY day_number, start_time',
      [tripId]
    );

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    };

    const categoryLabels = {
      hotel: 'Hotel', museum: 'Museum', restaurant: 'Dining',
      park: 'Park', beach: 'Beach', transport: 'Transport', other: 'Other'
    };

    const days = {};
    activities.forEach(activity => {
      if (!days[activity.day_number]) days[activity.day_number] = [];
      days[activity.day_number].push(activity);
    });

    let daysHTML = '';
    Object.keys(days).sort((a, b) => a - b).forEach(day => {
      let activitiesRows = '';
      days[day].forEach((activity, index) => {
        const time = activity.start_time ? activity.start_time.substring(0, 5) : '';
        const price = activity.price > 0
          ? `${parseFloat(activity.price).toFixed(2)} ${trip.currency}`
          : 'Free';
        const isLast = index === days[day].length - 1;

        activitiesRows += `
                <tr>
                    <td style="padding: 14px 16px; vertical-align: top; border-bottom: ${isLast ? 'none' : '1px solid #EDE8DE'}; width: 52px;">
                        <span style="font-family: Arial, sans-serif; font-size: 12px; color: #AEAAA3; white-space: nowrap;">${time}</span>
                    </td>
                    <td style="padding: 14px 16px; vertical-align: top; border-bottom: ${isLast ? 'none' : '1px solid #EDE8DE'};">
                        <div style="font-family: Georgia, serif; font-size: 15px; font-weight: bold; color: #1C1C1A; margin-bottom: ${activity.notes ? '6px' : '0'};">${activity.name}</div>
                        ${activity.notes ? `<div style="font-family: Arial, sans-serif; font-size: 12px; color: #6E6B65; line-height: 1.5; padding-left: 8px; border-left: 2px solid #C9983A;">${activity.notes}</div>` : ''}
                    </td>
                    <td style="padding: 14px 16px; vertical-align: top; border-bottom: ${isLast ? 'none' : '1px solid #EDE8DE'}; width: 80px; display: none;" class="hide-mobile">
                        <span style="font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; color: #AEAAA3;">${categoryLabels[activity.category] || 'Other'}</span>
                    </td>
                    <td style="padding: 14px 16px; vertical-align: top; border-bottom: ${isLast ? 'none' : '1px solid #EDE8DE'}; width: 90px; text-align: right; white-space: nowrap;">
                        <span style="font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: ${activity.price > 0 ? '#1A6B47' : '#AEAAA3'};">${price}</span>
                    </td>
                </tr>`;
      });

      daysHTML += `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                    <td style="padding-bottom: 10px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="background: #1E3D2B; padding: 4px 12px;">
                                    <span style="font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #F7F4EE;">Day ${day}</span>
                                </td>
                                <td style="padding-left: 12px; vertical-align: middle;">
                                    <div style="height: 1px; background: #E2DCCE; width: 100%; min-width: 200px;"></div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="background: #FFFFFF; border: 1px solid #E2DCCE;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            ${activitiesRows}
                        </table>
                    </td>
                </tr>
            </table>`;
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `Travel Planner <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Your itinerary — ${trip.title}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${trip.title}</title>
<style>
  body { margin: 0; padding: 0; background: #F7F4EE; }
  @media only screen and (max-width: 600px) {
    .email-wrapper { width: 100% !important; }
    .meta-cell { display: block !important; width: 100% !important; padding: 10px 16px !important; border-right: none !important; border-bottom: 1px solid #E2DCCE !important; }
    .meta-table { display: block !important; }
    .hide-mobile { display: none !important; }
  }
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F7F4EE; padding: 32px 0;">
  <tr>
    <td align="center">
      <table class="email-wrapper" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">

        <!-- Header -->
        <tr>
          <td style="background: #1E3D2B; padding: 36px 40px 32px;">
            <div style="font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #C9983A; margin-bottom: 10px;">Travel Planner</div>
            <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #F7F4EE; margin: 0 0 6px 0; line-height: 1.3;">${trip.title}</h1>
            <div style="font-family: Arial, sans-serif; font-size: 13px; color: rgba(247,244,238,0.5);">Itinerary for ${username}</div>
          </td>
        </tr>

        <!-- Meta info -->
        <tr>
          <td style="background: #FFFFFF; border-left: 1px solid #E2DCCE; border-right: 1px solid #E2DCCE;">
            <table class="meta-table" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="meta-cell" style="padding: 16px 20px; border-right: 1px solid #E2DCCE; width: 33%;">
                  <div style="font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #AEAAA3; margin-bottom: 5px;">Destination</div>
                  <div style="font-family: Georgia, serif; font-size: 15px; font-weight: bold; color: #1C1C1A;">${trip.destination_name}</div>
                </td>
                <td class="meta-cell" style="padding: 16px 20px; border-right: 1px solid #E2DCCE; width: 44%;">
                  <div style="font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #AEAAA3; margin-bottom: 5px;">Dates</div>
                  <div style="font-family: Georgia, serif; font-size: 15px; font-weight: bold; color: #1C1C1A;">${formatDate(trip.start_date)} — ${formatDate(trip.end_date)}</div>
                </td>
                <td class="meta-cell" style="padding: 16px 20px; width: 23%;">
                  <div style="font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #AEAAA3; margin-bottom: 5px;">Currency</div>
                  <div style="font-family: Georgia, serif; font-size: 15px; font-weight: bold; color: #1C1C1A;">${trip.currency}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${trip.description ? `
        <!-- Description -->
        <tr>
          <td style="background: #FFFFFF; border-left: 1px solid #E2DCCE; border-right: 1px solid #E2DCCE; border-top: 1px solid #E2DCCE;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width: 3px; background: #C9983A;"></td>
                <td style="padding: 16px 20px;">
                  <p style="font-family: Arial, sans-serif; font-size: 13px; color: #6E6B65; line-height: 1.7; margin: 0; font-style: italic;">${trip.description}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- Activities -->
        <tr>
          <td style="padding: 28px 0 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-bottom: 20px;">
                  <span style="font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #1A6B47;">Activities</span>
                </td>
              </tr>
              <tr>
                <td>
                  ${daysHTML || '<p style="font-family: Arial, sans-serif; font-size: 13px; color: #AEAAA3;">No activities added yet.</p>'}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 28px 0 0 0; border-top: 1px solid #E2DCCE;">
            <p style="font-family: Arial, sans-serif; font-size: 11px; color: #AEAAA3; margin: 0; line-height: 1.6;">
              This itinerary was exported from Travel Planner.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};