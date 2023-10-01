const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (req, res) => {
	if (req.user) {
		const { username } = req.user;
		const user = await User.findOne({ username });
		return res.status(200).json({
			name: user.name,
			username: user.username,
			id: user._id
		});
	}

	const { username, password } = req.body;

	const user = await User.findOne({ username });

	const passwordCorrect =
		user === null
			? false
			: await bcryptjs.compare(password, user.passwordHash);

	if (!(user && passwordCorrect)) {
		return res.status(400).json({ error: "wrong username or password" });
	}

	const userForToken = {
		username: user.username,
		id: user._id
	};

	const token = jwt.sign(userForToken, process.env.SECRET, {
		expiresIn: 60 * 60
	});

	res.status(200).json({
		token,
		name: user.name,
		username: user.username,
		id: user._id
	});
});

module.exports = loginRouter;
