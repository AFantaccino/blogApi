const userRouter = require("express").Router();
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
require("express-async-errors");

userRouter.get("/", async (req, res) => {
	const users = await User.find({}).populate("blogs", {
		title: 1
	});

	res.status(200).json({
		status: "success",
		users
	});
});

userRouter.get("/:id", async (req, res) => {
	const user = await User.findById(req.params.id).populate("blogs", {
		title: 1
	});

	res.status(200).json({
		user
	});
});

userRouter.post("/", async (req, res) => {
	const { username, name, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({
			error: "username or password missing"
		});
	}

	if (username.length < 3 || password.length < 3) {
		return res.status(400).json({
			error: "username or password need to be at least 4 character of length"
		});
	}

	const salt = 10;
	const passwordHash = await bcryptjs.hash(password, salt);

	const user = new User({
		name,
		username,
		passwordHash
	});

	const userCreated = await user.save();

	res.status(201).json({
		status: "success",
		userCreated
	});
});

module.exports = userRouter;
