const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");

beforeEach(async () => {
	await User.deleteMany({});

	for (let user of helper.initialUsers) {
		let userObject = new User(user);
		await userObject.save();
	}
});

describe("test relative to the get method", () => {
	test("the database is populated", async () => {
		const response = await api.get("/api/users");
		expect(response.body.users).toHaveLength(helper.initialUsers.length);
	});

	test("a user is created correctly", async () => {
		const newUser = {
			name: "steve",
			username: "steve123",
			password: "12345678"
		};
		await api.post("/api/users").send(newUser).expect(201);
	});

	test("throw an error is user doesn't have a password or username", async () => {
		const newUser = {
			name: "bob2",
			password: "12345"
		};
		await api.post("/api/users").send(newUser).expect(400);
	});

	test("a username should be unique", async () => {
		const newUser = {
			name: "steve",
			username: "steve123",
			password: "12345678"
		};
		const newUser2 = {
			name: "bob2",
			username: "steve123",
			password: "12345"
		};
		await api.post("/api/users").send(newUser).expect(201);
		await api.post("/api/users").send(newUser2).expect(400);
	});
});

afterAll(async () => {
	await mongoose.connection.close();
});
