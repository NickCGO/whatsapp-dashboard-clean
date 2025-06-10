const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth()
});

let messages = []; // We’ll store messages here for now

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp is ready!');
});

client.on('message', msg => {
  console.log('Message received:', msg.body);
  messages.push({
    id: msg.id._serialized,
    from: msg.from,
    body: msg.body,
    timestamp: new Date()
  });
});

app.get('/messages', (req, res) => {
  res.json(messages);
});

app.post('/send-message', async (req, res) => {
  const { to, body } = req.body;
  const chatId = to.includes('@c.us') ? to : `${to}@c.us`;

  client.sendMessage(chatId, body)
    .then(() => res.sendStatus(200))
    .catch(err => res.status(500).send(err));
});

client.initialize();
app.listen(3000, () => {
  console.log('API server running on port 3000');
});

