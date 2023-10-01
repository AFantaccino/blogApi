const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");

beforeEach(async () => {
	await Blog.deleteMany({});
	await User.deleteMany({});

	for (let blog of helper.initialBlogs) {
		let blogObject = new Blog(blog);
		await blogObject.save();
	}
	const newUser = new User(helper.initialUsers[0]);
	await newUser.save();
}, 20000);

describe("test related to the get method", () => {
	test("blogs are returned as json", async () => {
		await api
			.get("/api/blogs")
			.expect(200)
			.expect("Content-Type", /application\/json/);
	});

	test("all blogs are returned", async () => {
		const response = await api.get("/api/blogs");

		expect(response.body.blogs).toHaveLength(helper.initialBlogs.length);
	});

	test("the id propety is not called _id", async () => {
		const response = await api.get("/api/blogs");

		expect(response.body.blogs[0].id).toBeDefined();
	});
});

describe("test related to the post method", () => {
	test("creating a new blog post", async () => {
		const token = await helper.getToken();
		const newBlogPost = {
			_id: "5a422a851b54a676234d17fl",
			title: "React",
			author: "Michael Birthday",
			url: "https://reactpatterns.eu/",
			likes: 69,
			__v: 0
		};

		await api
			.post("/api/blogs")
			.set("Authorization", `Bearer ${token}`)
			.send(newBlogPost)
			.expect(201);

		const blogsInDb = await helper.blogsInDb();
		expect(blogsInDb).toHaveLength(helper.initialBlogs.length + 1);

		const content = blogsInDb.map(blog => blog.title);
		expect(content).toContain("React");
	});

	test("default likes to 0 if missing", async () => {
		const token = await helper.getToken();
		const newBlogPost = {
			_id: "5a422a851b54a676234d17fl",
			title: "React",
			author: "Michael Birthday",
			url: "https://reactpatterns.eu/",
			__v: 0
		};
		await api
			.post("/api/blogs")
			.set("Authorization", `Bearer ${token}`)
			.send(newBlogPost)
			.expect(201);

		const blogsInDb = await helper.blogsInDb();

		expect(blogsInDb[blogsInDb.length - 1].likes).toEqual(0);
	});

	test("missing title or url sends back an error", async () => {
		const token = await helper.getToken();
		const newBlogPost = {
			_id: "5a422a851b54a676234d17fl",
			title: "React",
			author: "Michael Birthday",
			__v: 0
		};
		await api
			.post("/api/blogs")
			.set("Authorization", `Bearer ${token}`)
			.send(newBlogPost)
			.expect(400);
	});
});

test("a blog is successfully deleted", async () => {
	const token = await helper.getToken();
	const validId = "64ea301da535bbf6e1d97e11";

	await api
		.delete(`/api/blogs/${validId}`)
		.set("Authorization", `Bearer ${token} 1`)
		.expect(401);


	await api
		.delete(`/api/blogs/${validId}`)
		.set("Authorization", `Bearer ${token}`)
		.expect(204);

	const blogsInDb = await helper.blogsInDb();
	expect(blogsInDb).toHaveLength(helper.initialBlogs.length - 1);
});

afterAll(async () => {
	await mongoose.connection.close();
});
