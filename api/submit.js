export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const assessmentData = req.body;
    
    // Forward to Make.com webhook
    const makeWebhookURL = process.env.MAKE_WEBHOOK_URL;
    
    if (!makeWebhookURL) {
      console.error('MAKE_WEBHOOK_URL not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }
    
    const response = await fetch(makeWebhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    });
    
    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Assessment submitted' });
    } else {
      const errorText = await response.text();
      console.error('Make.com error:', errorText);
      return res.status(500).json({ error: 'Failed to process assessment' });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
