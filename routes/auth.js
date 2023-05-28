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
    const accessToken = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '15m'});
    const refreshToken = jwt.sign({userId: user.id}, process.env.REFRESH_TOKEN_SECRET);
    user.refreshToken = refreshToken;
    await user.save();
    res.send({accessToken, refreshToken});
  } catch (err) {
    res.status(401).send(err.message);
  }
});

router.post('/refresh', async (req, res) => {
  const {refreshToken} = req.body;
  if(!refreshToken) {
    return res.sendStatus(401);
  }
  const user = await User.findOne({refreshToken});
  if(!user) {
    return res.sendStatus(403);
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if(err) {
      return res.sendStatus(403);
    }
    const accessToken = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '15m'});
    res.send({accessToken});
  });
});

module.exports = router;