/**
 * Authentication Module Verification Script
 * Tests registration, login, token refresh, and logout
 */

import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logout,
    getUserFromToken,
    clearAuthStorage,
    hashPassword,
    verifyPassword,
    validatePasswordStrength,
    generateAccessToken,
    verifyAccessToken,
} from '../../shared/auth';

console.log('='.repeat(60));
console.log('Authentication Module Verification');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<boolean>): Promise<void> {
    try {
        if (await fn()) {
            console.log(`✅ ${name}`);
            passed++;
        } else {
            console.log(`❌ ${name}`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ ${name} - Error: ${err}`);
        failed++;
    }
}

async function runTests() {
    // Clear storage before tests
    clearAuthStorage();

    // Test 1: Password hashing
    await test('Password hashing works', async () => {
        const password = 'TestPassword123';
        const hash = await hashPassword(password);
        return hash.includes(':') && hash.length > 50;
    });

    // Test 2: Password verification
    await test('Password verification works', async () => {
        const password = 'TestPassword123';
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(password, hash);
        const isInvalid = await verifyPassword('WrongPassword', hash);
        return isValid && !isInvalid;
    });

    // Test 3: Password strength validation
    await test('Password strength validation', async () => {
        const weak = validatePasswordStrength('weak');
        const strong = validatePasswordStrength('StrongPass123');
        return !weak.valid && strong.valid;
    });

    // Test 4: JWT generation
    await test('JWT token generation', async () => {
        const token = generateAccessToken({
            sub: 'user-123',
            tenantId: 'tenant-1',
            username: 'testuser',
            email: 'test@example.com',
        });
        return token.split('.').length === 3;
    });

    // Test 5: JWT verification
    await test('JWT token verification', async () => {
        const token = generateAccessToken({
            sub: 'user-123',
            tenantId: 'tenant-1',
            username: 'testuser',
            email: 'test@example.com',
        });
        const result = verifyAccessToken(token);
        return result.valid && result.payload.sub === 'user-123';
    });

    // Test 6: User registration
    await test('User registration', async () => {
        const result = await registerUser({
            username: 'testuser',
            email: 'test@example.com',
            password: 'SecurePass123',
        });
        return result.success && result.data.user.email === 'test@example.com';
    });

    // Test 7: Duplicate registration fails
    await test('Duplicate registration fails', async () => {
        const result = await registerUser({
            username: 'testuser2',
            email: 'test@example.com',
            password: 'SecurePass123',
        });
        return !result.success && result.error.code === 'USER_EXISTS';
    });

    // Test 8: User login
    await test('User login', async () => {
        const result = await loginUser({
            email: 'test@example.com',
            password: 'SecurePass123',
        });
        return result.success && result.data.tokens.accessToken.length > 0;
    });

    // Test 9: Invalid login fails
    await test('Invalid login fails', async () => {
        const result = await loginUser({
            email: 'test@example.com',
            password: 'WrongPassword',
        });
        return !result.success && result.error.code === 'INVALID_CREDENTIALS';
    });

    // Test 10: Token refresh
    await test('Token refresh', async () => {
        const loginResult = await loginUser({
            email: 'test@example.com',
            password: 'SecurePass123',
        });
        if (!loginResult.success) return false;

        const refreshResult = await refreshAccessToken(loginResult.data.tokens.refreshToken);
        return refreshResult.success && refreshResult.data.accessToken.length > 0;
    });

    // Test 11: Get user from token
    await test('Get user from token', async () => {
        const loginResult = await loginUser({
            email: 'test@example.com',
            password: 'SecurePass123',
        });
        if (!loginResult.success) return false;

        const userResult = getUserFromToken(loginResult.data.tokens.accessToken);
        return userResult.success && userResult.data.email === 'test@example.com';
    });

    // Test 12: Logout
    await test('Logout invalidates refresh token', async () => {
        const loginResult = await loginUser({
            email: 'test@example.com',
            password: 'SecurePass123',
        });
        if (!loginResult.success) return false;

        const loggedOut = await logout(loginResult.data.tokens.refreshToken);
        if (!loggedOut) return false;

        const refreshResult = await refreshAccessToken(loginResult.data.tokens.refreshToken);
        return !refreshResult.success;
    });

    // Summary
    console.log('='.repeat(60));
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60));

    if (failed === 0) {
        console.log('✅ All Authentication tests passed!');
    } else {
        console.log('❌ Some tests failed');
        process.exit(1);
    }
}

runTests().catch(console.error);
