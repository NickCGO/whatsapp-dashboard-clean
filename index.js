const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://acesirbkqiwhgzqzcffo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZXNpcmJrcWl3aGd6cXpjZmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODc2NzIsImV4cCI6MjA2NTE2MzY3Mn0.t0CfGeygJWu-4SUwJro4R5x4aKZcfC1vLGbKLnN3EQU';

const supabase = createClient(supabaseUrl, supabaseKey);


const client = new Client({
  authStrategy: new LocalAuth()
});

let messages = []; // We’ll store messages here for now

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('message', async (message) => {
  console.log(`📩 Message from ${message.from}: ${message.body}`);

  // Save inbound message to Supabase
  const { error } = await supabase
    .from('messages')
    .insert([
      {
        from: message.from,
        body: message.body,
        direction: 'inbound'
      }
    ]);

  if (error) {
    console.error('❌ Failed to save inbound message:', error);
  } else {
    console.log('✅ Inbound message saved');
  }
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
await supabase.from('messages').insert([
  {
    from: chatId,
    body: body,
    direction: 'outbound'
  }
]);

});

client.initialize();
app.listen(3000, () => {
  console.log('API server running on port 3000');
});

