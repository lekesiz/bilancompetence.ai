# Performance Tests

This directory contains performance testing scenarios using Artillery.

## Prerequisites

- Node.js 20.x or higher
- Artillery installed (`npm install --save-dev artillery`)
- Backend server running on `http://localhost:3001`

## Test Scenarios

### 1. Load Test (`load-test.yml`)

Simulates normal to peak load conditions:

- **Warm up**: 5 requests/second for 60 seconds
- **Sustained load**: 10 requests/second for 120 seconds
- **Peak load**: 20 requests/second for 60 seconds

**Total duration**: ~4 minutes

### 2. Stress Test (`stress-test.yml`)

Tests system behavior under extreme load:

- **Ramp up**: 10 requests/second for 30 seconds
- **High load**: 50 requests/second for 60 seconds
- **Stress load**: 100 requests/second for 60 seconds
- **Breaking point**: 200 requests/second for 60 seconds
- **Recovery**: 10 requests/second for 30 seconds

**Total duration**: ~4 minutes

## Running Tests

### Load Test

```bash
npm run test:load
```

### Stress Test

```bash
npm run test:stress
```

### Generate HTML Report

```bash
npm run test:load -- --output report.json
artillery report report.json
```

## Metrics

Artillery tracks the following metrics:

- **Response time**: p50, p95, p99
- **Request rate**: requests per second
- **Error rate**: percentage of failed requests
- **Throughput**: bytes per second
- **Concurrent users**: virtual users at any given time

## Interpreting Results

### Good Performance

- p95 response time < 500ms
- p99 response time < 1000ms
- Error rate < 1%
- No timeout errors

### Warning Signs

- p95 response time > 1000ms
- p99 response time > 2000ms
- Error rate > 5%
- Increasing response times under load

### Critical Issues

- p95 response time > 2000ms
- Error rate > 10%
- Timeout errors
- Server crashes or restarts

## Optimization Tips

1. **Database**: Add indexes, optimize queries, use connection pooling
2. **Caching**: Implement Redis for frequently accessed data
3. **Rate Limiting**: Protect endpoints from abuse
4. **Load Balancing**: Distribute traffic across multiple instances
5. **CDN**: Serve static assets from CDN
6. **Monitoring**: Use APM tools (New Relic, Datadog, etc.)

## CI/CD Integration

Performance tests can be integrated into CI/CD pipeline:

```yaml
- name: Run performance tests
  run: npm run test:load
  continue-on-error: true
```

## Notes

- Performance tests should be run in a staging environment
- Avoid running stress tests in production
- Monitor server resources (CPU, memory, disk) during tests
- Use realistic data and scenarios
- Run tests multiple times for consistent results

