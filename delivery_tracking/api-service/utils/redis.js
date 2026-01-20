const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: "https://deciding-seasnail-20791.upstash.io",
  token: "AVE3AAIncDI3NmIzODI2MjEwYzc0ZjI3YWU2YzJhNDhkYTQ4N2U2ZHAyMjA3OTE",
});

module.exports = redis;