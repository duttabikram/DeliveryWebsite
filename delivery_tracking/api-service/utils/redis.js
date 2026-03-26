const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: "https://flowing-buzzard-85322.upstash.io",
  token: "gQAAAAAAAU1KAAIncDEyNjJkNTkyNWE0YWQ0YjdkOTBkNWQxYzNhYTNkNTIzM3AxODUzMjI",
});

module.exports = redis;
