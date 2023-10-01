const blogsRouter = require("express").Router();
const jwt = require("jsonwebtoken");
require("express-async-errors");
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (req, res) => {
	const blogs = await Blog.find({}).populate("user", {
		username: 1,
		name: 1
	});

	res.status(200).json({
		status: "success",
		blogs
	});
});

blogsRouter.get("/:id", async (req, res) => {
	const oneBlog = await Blog.findById(req.params.id);

	res.status(200).json({
		status: "success",
		oneBlog
	});
});

blogsRouter.post("/", async (req, res) => {
	let { title, author, url, likes } = req.body;
	const { name, username, id } = req.user;

	if (!req.token) {
		return res.status(401).json({ error: "token invalid" });
	}
	if (!title || !url) {
		return res.status(400).json({
			status: "failed",
			message: "missing title or url"
		});
	}
	if (!likes) {
		likes = 0;
	}

	let blog = new Blog({
		title,
		author,
		url,
		likes,
		user: id,
		comments: []
	});

	const blogCreated = await blog.save();
	req.user.blogs = req.user.blogs.concat(blogCreated._id);
	await req.user.save();

	res.status(201).json({
		status: "success",
		blog: {
			id: blogCreated._id,
			title,
			author,
			url,
			likes,
			user: [{ name, username, id }],
			comments: []
		}
	});
});

blogsRouter.put("/:id", async (req, res) => {
	const { title, author, url, likes } = req.body;

	const blog = {
		title,
		author,
		url,
		likes: +likes,
		user: req.user.id
	};

	const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		status: "success",
		updatedBlog
	});
});

blogsRouter.post("/:id/comments", async (req, res) => {
	const blog = await Blog.findById(req.params.id);
	blog.comments.push(req.body.comment);
	const updatedBlog = await blog.save();

	res.status(201).json({
		status: "success",
		updatedBlog
	});
});

blogsRouter.delete("/:id", async (req, res) => {
	const blogToDelete = await Blog.findById(req.params.id);

	if (!blogToDelete) {
		return res.status(400).json({
			status: "failed",
			error: `a blog with id ${req.params.id} is not in our database`
		});
	}

	if (!(blogToDelete.user.toString() === req.user.id.toString())) {
		return res.status(401).json({
			status: "failed",
			error: "only the creator of this blog post can delete it"
		});
	}

	const indexBlogToRemove = req.user.blogs.findIndex(
		blog => blog.toString() === blogToDelete._id.toString()
	);

	req.user.blogs.splice(indexBlogToRemove, 1);
	await req.user.save();
	await Blog.deleteOne(blogToDelete);

	res.status(204).json({
		test: "yep"
	});
});

module.exports = blogsRouter;
