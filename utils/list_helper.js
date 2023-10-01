const lodash = require("lodash");

const dummy = blogs => {
	return 1;
};

const totalLikes = blogs => {
	let total = 0;
	blogs.map(el => (total += el.likes));
	return total;
};

const favoriteBlog = blogs => {
	const mostLikes = blogs.sort((a, b) => b.likes - a.likes);
	const { author, likes, title } = mostLikes[0];
	return { author, likes, title };
};

const mostBlogs = blogs => {
	result = Object.values(
		blogs.reduce((count, { author }) => {
			count[author] ??= { author, blogs: 0 };
			count[author].blogs++;
			return count;
		}, {})
	).sort((a, b) => b.blogs - a.blogs);

	return result[0];
};

const mostLikes = blogs => {
	result = Object.values(
		blogs.reduce((count, { author, likes }) => {
			count[author] ??= { author, likes: 0 };
			if (count[author].likes < likes) count[author].likes = likes;
			return count;
		}, {})
	).sort((a, b) => b.likes - a.likes);

	return result[0];
};

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes
};
