const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const port = 8080;
const directoryToServe = path.join(__dirname);

const FLEVOPAY_API_KEY = 'flevopay_sk_4d2f2349cd060b2eb9d2346923037759f1c3b617645417359fc96c8a80ea2429';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/gerar-pix') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // FlevoPay request payload
        const flevopayPayload = JSON.stringify({
          amount: data.amount,
          description: "Pedido Fritadeira",
          reference: "PEDIDO-" + Date.now(),
          source: "api_externa",
          customer: {
            name: data.name,
            email: data.email || 'cliente@email.com',
            phone: data.cellphone,
            document: data.taxId
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
               res.writeHead(flevopayRes.statusCode, { 'Content-Type': 'application/json' });
               res.end(JSON.stringify({
                 pix_code: parsed.qr_code,
                 txid: parsed.transaction_id,
                 message: parsed.message
               }));
            } catch(e) {
               res.writeHead(flevopayRes.statusCode, { 'Content-Type': 'application/json' });
               res.end(responseBody);
            }
          });
        });

        flevopayReq.on('error', (e) => {
          console.error(e);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Erro interno no servidor" }));
        });

        flevopayReq.write(flevopayPayload);
        flevopayReq.end();
      } catch (err) {
        console.error(err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  if (req.url === '/') {
    res.writeHead(302, { 'Location': '/telinha/pages/produto-104.html' });
    res.end();
    return;
  }

  let filePath = path.join(directoryToServe, req.url);
  
  // Clean up URL parameters (e.g. ?v=123)
  filePath = filePath.split('?')[0];

  const extname = path.extname(filePath).toLowerCase();
  let contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found: ' + req.url);
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
