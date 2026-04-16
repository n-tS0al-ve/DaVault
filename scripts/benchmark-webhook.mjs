import http from 'http';

async function benchmark() {
  const NUM_REQUESTS = 1000;
  const CONCURRENCY = 50;

  const payload = JSON.stringify({
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        customer: 'cus_123',
        metadata: { userId: 'user_123', tier: 'PRO' }
      }
    }
  });

  // We are bypassing actual Stripe signature verification in the script since we can't easily sign it here
  // The goal is to measure the performance difference of instantiating the Stripe client vs using the cached one
  // If it fails with 400 Webhook Error, that's fine, the Stripe client was still instantiated/used.
  // Wait, if it fails early, it still runs the Stripe instantiation which is what we want to measure.

  let completed = 0;
  const start = performance.now();

  const makeRequest = () => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/stripe/webhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'Stripe-Signature': 't=123,v1=abc' // Dummy signature
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          completed++;
          resolve(res.statusCode);
        });
      });

      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        completed++;
        resolve(500);
      });

      req.write(payload);
      req.end();
    });
  };

  console.log(`Starting benchmark: ${NUM_REQUESTS} requests with concurrency ${CONCURRENCY}...`);

  for (let i = 0; i < NUM_REQUESTS; i += CONCURRENCY) {
    const promises = [];
    for (let j = 0; j < CONCURRENCY && i + j < NUM_REQUESTS; j++) {
      promises.push(makeRequest());
    }
    await Promise.all(promises);
    process.stdout.write(`\rProgress: ${completed}/${NUM_REQUESTS}`);
  }

  const end = performance.now();
  const totalTime = (end - start) / 1000; // in seconds
  const rps = NUM_REQUESTS / totalTime;

  console.log('\n\n--- Results ---');
  console.log(`Total time: ${totalTime.toFixed(2)}s`);
  console.log(`Requests per second: ${rps.toFixed(2)}`);
  console.log(`Avg latency: ${((end - start) / NUM_REQUESTS).toFixed(2)}ms`);
}

benchmark().catch(console.error);
