require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true});
app.use(express.json());
app.use('/auth', authRoutes);

app.listen(3000, () => console.log('Server started on port 3000'));