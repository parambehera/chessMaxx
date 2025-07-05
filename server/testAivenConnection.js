const redis = require('./redisClient');

// Try a simple set/get to test connection
(async () => {
  try {
    await redis.set('test-key', 'hello-aiven');
    const value = await redis.get('test-key');
    console.log('Test value from Aiven:', value);
    process.exit(0);
  } catch (err) {
    console.error('❌ Redis test failed:', err);
    process.exit(1);
  }
})();
