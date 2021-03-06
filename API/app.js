
var express = require('express');
const AerolineaApi = require('./routes');
const cors = require('cors');

var app = express();
app.use(express.json());
app.use(cors());
AerolineaApi(app);

app.listen(3000, () => {
  console.log(`Listening http://localhost:3000`);
});

module.exports = app;
