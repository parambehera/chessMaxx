// redis.js
const Redis = require("ioredis");

const redis = new Redis({
  host: "public-valkey-27c09f9a-paramjyotibehera2005-03f8.c.aivencloud.com",
  port: 28715,
  username: "default",
  password: "AVNS_IN--XDeukOuROdwdC31",
  tls: {},
});

redis.on("connect", () => console.log("✅ Connected to Aiven Redis!"));
redis.on("error", (err) => console.error("❌ Redis connection error:", err));

module.exports = redis;
