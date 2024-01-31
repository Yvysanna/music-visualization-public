// This is a Node.js Express server example
const express = require('express');
const app = express();
app.use(express.json());

app.post('/log', (req, res) => {
    console.log(req.body.message);
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Server listening on port 3000'));