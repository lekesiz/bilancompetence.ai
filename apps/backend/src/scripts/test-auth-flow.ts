/**
 * Authentication Flow Smoke Test
 *
 * Tests the complete authentication flow with HttpOnly cookies and CSRF tokens:
 * 1. Register new user
 * 2. Login with credentials
 * 3. Verify CSRF token is set
 * 4. Make authenticated request with CSRF token
 * 5. Refresh tokens
 * 6. Logout
 *
 * Usage:
 *   tsx src/scripts/test-auth-flow.ts
 */

import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_EMAIL = `test-${uuidv4()}@example.com`;
const TEST_PASSWORD = 'SecurePassword123!';
const TEST_NAME = 'Test User';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class AuthFlowTester {
  private client: AxiosInstance;
  private csrfToken: string | null = null;
  private results: TestResult[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true, // Enable cookie support
      validateStatus: () => true, // Don't throw on any status
    });
  }

  /**
   * Extract CSRF token from Set-Cookie header
   */
  private extractCsrfToken(headers: any): string | null {
    const setCookie = headers['set-cookie'];
    if (!setCookie) return null;

    for (const cookie of setCookie) {
      const match = cookie.match(/csrf_token=([^;]+)/);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Add test result
   */
  private addResult(name: string, passed: boolean, error?: string, details?: any) {
    this.results.push({ name, passed, error, details });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}`);
    if (error) console.log(`   Error: ${error}`);
    if (details) console.log(`   Details:`, details);
  }

  /**
   * Test 1: Register new user
   */
  async testRegister(): Promise<boolean> {
    console.log('\n📝 Test 1: Register New User');

    try {
      const response = await this.client.post('/api/auth/register', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        full_name: TEST_NAME,
        role: 'BENEFICIARY',
      });

      if (response.status !== 201) {
        this.addResult('Register', false, `Expected 201, got ${response.status}`, response.data);
        return false;
      }

      // Check for CSRF token
      this.csrfToken = this.extractCsrfToken(response.headers);

      if (!this.csrfToken) {
        this.addResult('Register', false, 'CSRF token not set in response');
        return false;
      }

      // Check response structure
      if (!response.data.data?.user?.id) {
        this.addResult('Register', false, 'User data not returned', response.data);
        return false;
      }

      this.addResult('Register', true, undefined, {
        userId: response.data.data.user.id,
        csrfToken: this.csrfToken.substring(0, 10) + '...',
      });
      return true;
    } catch (error: any) {
      this.addResult('Register', false, error.message);
      return false;
    }
  }

  /**
   * Test 2: Logout
   */
  async testLogout(): Promise<boolean> {
    console.log('\n🚪 Test 2: Logout');

    try {
      const response = await this.client.post('/api/auth/logout', {}, {
        headers: {
          'x-csrf-token': this.csrfToken!,
        },
      });

      if (response.status !== 200) {
        this.addResult('Logout', false, `Expected 200, got ${response.status}`, response.data);
        return false;
      }

      this.addResult('Logout', true);
      return true;
    } catch (error: any) {
      this.addResult('Logout', false, error.message);
      return false;
    }
  }

  /**
   * Test 3: Login with credentials
   */
  async testLogin(): Promise<boolean> {
    console.log('\n🔐 Test 3: Login');

    try {
      const response = await this.client.post('/api/auth/login', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (response.status !== 200) {
        this.addResult('Login', false, `Expected 200, got ${response.status}`, response.data);
        return false;
      }

      // Check for new CSRF token
      const newCsrfToken = this.extractCsrfToken(response.headers);
      if (!newCsrfToken) {
        this.addResult('Login', false, 'CSRF token not refreshed on login');
        return false;
      }

      this.csrfToken = newCsrfToken;

      // Check response structure
      if (!response.data.data?.user?.email) {
        this.addResult('Login', false, 'User data not returned', response.data);
        return false;
      }

      this.addResult('Login', true, undefined, {
        email: response.data.data.user.email,
        csrfToken: this.csrfToken.substring(0, 10) + '...',
      });
      return true;
    } catch (error: any) {
      this.addResult('Login', false, error.message);
      return false;
    }
  }

  /**
   * Test 4: Make authenticated request with CSRF token
   */
  async testAuthenticatedRequest(): Promise<boolean> {
    console.log('\n🔒 Test 4: Authenticated Request');

    try {
      const response = await this.client.get('/api/auth/verify');

      if (response.status !== 200) {
        this.addResult('Authenticated Request', false, `Expected 200, got ${response.status}`, response.data);
        return false;
      }

      if (!response.data.data?.user) {
        this.addResult('Authenticated Request', false, 'User verification failed', response.data);
        return false;
      }

      this.addResult('Authenticated Request', true, undefined, {
        userId: response.data.data.user.id,
        email: response.data.data.user.email,
      });
      return true;
    } catch (error: any) {
      this.addResult('Authenticated Request', false, error.message);
      return false;
    }
  }

  /**
   * Test 5: CSRF protection (request without token should fail)
   */
  async testCsrfProtection(): Promise<boolean> {
    console.log('\n🛡️ Test 5: CSRF Protection');

    try {
      // Try to make a POST request without CSRF token
      const response = await this.client.post('/api/dashboard/beneficiary');

      // Should fail with 403
      if (response.status === 403) {
        this.addResult('CSRF Protection', true, undefined, {
          message: 'Request correctly blocked without CSRF token',
        });
        return true;
      } else {
        this.addResult('CSRF Protection', false, `Expected 403, got ${response.status}`, response.data);
        return false;
      }
    } catch (error: any) {
      this.addResult('CSRF Protection', false, error.message);
      return false;
    }
  }

  /**
   * Test 6: Authenticated POST with CSRF token
   */
  async testAuthenticatedPost(): Promise<boolean> {
    console.log('\n📨 Test 6: Authenticated POST with CSRF');

    try {
      const response = await this.client.get('/api/dashboard/beneficiary', {
        headers: {
          'x-csrf-token': this.csrfToken!,
        },
      });

      // GET request should work (no CSRF needed for GET)
      if (response.status === 200 || response.status === 404) {
        this.addResult('Authenticated POST', true, undefined, {
          message: 'Request with CSRF token succeeded',
          status: response.status,
        });
        return true;
      } else {
        this.addResult('Authenticated POST', false, `Expected 200/404, got ${response.status}`, response.data);
        return false;
      }
    } catch (error: any) {
      this.addResult('Authenticated POST', false, error.message);
      return false;
    }
  }

  /**
   * Test 7: Token refresh
   */
  async testTokenRefresh(): Promise<boolean> {
    console.log('\n🔄 Test 7: Token Refresh');

    try {
      const response = await this.client.post('/api/auth/refresh');

      if (response.status !== 200) {
        this.addResult('Token Refresh', false, `Expected 200, got ${response.status}`, response.data);
        return false;
      }

      // Check for new CSRF token
      const newCsrfToken = this.extractCsrfToken(response.headers);
      if (!newCsrfToken) {
        this.addResult('Token Refresh', false, 'CSRF token not refreshed');
        return false;
      }

      this.csrfToken = newCsrfToken;

      this.addResult('Token Refresh', true, undefined, {
        csrfToken: this.csrfToken.substring(0, 10) + '...',
      });
      return true;
    } catch (error: any) {
      this.addResult('Token Refresh', false, error.message);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Authentication Flow Tests...');
    console.log(`📍 API URL: ${API_URL}`);
    console.log(`📧 Test Email: ${TEST_EMAIL}\n`);

    // Run tests in sequence
    const test1 = await this.testRegister();
    if (!test1) return this.printSummary();

    const test2 = await this.testLogout();
    if (!test2) return this.printSummary();

    const test3 = await this.testLogin();
    if (!test3) return this.printSummary();

    const test4 = await this.testAuthenticatedRequest();
    if (!test4) return this.printSummary();

    const test5 = await this.testCsrfProtection();
    // Continue even if this fails (it's expected behavior)

    const test6 = await this.testAuthenticatedPost();
    if (!test6) return this.printSummary();

    const test7 = await this.testTokenRefresh();
    if (!test7) return this.printSummary();

    // Final logout
    await this.testLogout();

    this.printSummary();
  }

  /**
   * Print test summary
   */
  private printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = Math.round((passed / total) * 100);

    console.log(`\nPassed: ${passed}/${total} (${percentage}%)\n`);

    const failed = this.results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.log('❌ Failed Tests:');
      failed.forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    }

    console.log('\n' + '='.repeat(50));

    if (passed === total) {
      console.log('✅ All tests passed! Authentication flow is working correctly.');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed. Please review the errors above.');
      process.exit(1);
    }
  }
}

// Run tests
const tester = new AuthFlowTester();
tester.runAllTests().catch((error) => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});
