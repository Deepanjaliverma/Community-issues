const express     = require('express');
const cors        = require('cors');
const issueRoutes = require('./routes');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api/issues', issueRoutes);

app.get('/', function(req, res) {
  res.json({ message: 'FixMyStreet backend is running!' });
});

app.listen(PORT, function() {
  console.log('Server running at http://localhost:' + PORT);
});