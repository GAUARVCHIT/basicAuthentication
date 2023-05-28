const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = new User({email, password});
    await user.save();
    res.sendStatus(201);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid email or password');
    }
    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET);
    res.send({token});
  } catch (err) {
    res.status(401).send(err.message);
  }
});

module.exports = router;
