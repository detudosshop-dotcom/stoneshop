const https = require('https');

const FLEVOPAY_API_KEY = 'flevopay_sk_4d2f2349cd060b2eb9d2346923037759f1c3b617645417359fc96c8a80ea2429';

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const data = req.body;
  
  if (!data) {
    res.status(400).json({ error: 'Missing request body' });
    return;
  }

  const flevopayPayload = JSON.stringify({
    amount: data.amount,
    description: data.description || "Pedido Fritadeira",
    reference: "PEDIDO-" + Date.now(),
    source: "api_externa",
    customer: {
      name: data.customer?.name || data.name,
      email: data.customer?.email || data.email || 'cliente@email.com',
      phone: data.customer?.phone || data.cellphone,
      document: data.customer?.document || data.taxId
    }
  });

  const options = {
    hostname: 'app.flevopay.com.br',
    port: 443,
    path: '/api/v1/transaction',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': FLEVOPAY_API_KEY,
      'Content-Length': Buffer.byteLength(flevopayPayload)
    }
  };

  const flevopayReq = https.request(options, (flevopayRes) => {
    let responseBody = '';
    flevopayRes.on('data', chunk => { responseBody += chunk; });
    flevopayRes.on('end', () => {
      try {
        const parsed = JSON.parse(responseBody);
        res.status(flevopayRes.statusCode).json({
          pix_code: parsed.qr_code,
          txid: parsed.transaction_id,
          qr_code: parsed.qr_code,
          qr_code_base64: parsed.qr_code_base64,
          transaction_id: parsed.transaction_id,
          message: parsed.message
        });
      } catch(e) {
        res.status(flevopayRes.statusCode).send(responseBody);
      }
    });
  });

  flevopayReq.on('error', (e) => {
    console.error(e);
    res.status(500).json({ error: "Erro interno no servidor" });
  });

  flevopayReq.write(flevopayPayload);
  flevopayReq.end();
};
