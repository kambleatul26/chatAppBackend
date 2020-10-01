const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const data = require("../data");

router.post('/register', async (req, res) => {

    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).json({ msg: 'Email already exists'})

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        isManager: req.body.isManager
    });

    try {
        const savedUser = await user.save();
        res.send({ user: savedUser._id});
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/login', async (req, res) => {
    
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).json({ message: `Email doesn't exist`});

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).json({ message: `Invalid Password`});

    const token = jwt.sign({
        _id: user._id, 
        email: user.email, 
        isManager: user.isManager, 
        name: user.name
    }, data.JWT_SECRET, { expiresIn: '6h' });

    res.status(200).json({ id:user._id, email: user.email, name: user.name, token: token, isManager: user.isManager });
});

module.exports = router;