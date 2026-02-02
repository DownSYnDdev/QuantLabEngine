/**
 * Strategy Model
 * Schema and operations for saved indicators and strategies
 */

/**
 * Strategy type
 */
export type StrategyType = 'indicator' | 'strategy';

/**
 * Strategy metadata
 */
export interface StrategyMetadata {
    description?: string;
    author?: string;
    version: number;
    lastBacktested?: string;
    performance?: {
        winRate?: number;
        sharpeRatio?: number;
        totalReturn?: number;
    };
}

/**
 * Strategy entity
 */
export interface Strategy {
    id: string;
    userId: string;
    tenantId: string;
    name: string;
    type: StrategyType;
    code: string;
    metadata: StrategyMetadata;
    tags: string[];
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Strategy creation request
 */
export interface CreateStrategyRequest {
    name: string;
    type: StrategyType;
    code: string;
    metadata?: Partial<StrategyMetadata>;
    tags?: string[];
    isPublic?: boolean;
}

/**
 * Strategy update request
 */
export interface UpdateStrategyRequest {
    name?: string;
    code?: string;
    metadata?: Partial<StrategyMetadata>;
    tags?: string[];
    isPublic?: boolean;
}

// In-memory storage
const strategies = new Map<string, Strategy>();
const strategiesByUser = new Map<string, Set<string>>();

/**
 * Generate unique ID
 */
function generateId(): string {
    return `strategy-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Sanitize DSL code (basic validation)
 */
export function sanitizeDSLCode(code: string): { valid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = [];
    let sanitized = code;

    // Check for dangerous patterns
    const dangerousPatterns = [
        /eval\s*\(/gi,
        /new\s+Function\s*\(/gi,
        /import\s*\(/gi,
        /require\s*\(/gi,
        /__proto__/gi,
        /constructor\s*\[/gi,
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
            errors.push(`Potentially unsafe code pattern detected: ${pattern.source}`);
        }
    }

    // Check code length
    if (code.length > 50000) {
        errors.push('Code exceeds maximum length of 50,000 characters');
    }

    // Basic sanitization
    sanitized = sanitized.trim();

    return {
        valid: errors.length === 0,
        sanitized,
        errors,
    };
}

/**
 * Create a new strategy
 */
export function createStrategy(
    userId: string,
    tenantId: string,
    request: CreateStrategyRequest
): Strategy | { error: string } {
    // Sanitize code
    const sanitizeResult = sanitizeDSLCode(request.code);
    if (!sanitizeResult.valid) {
        return { error: sanitizeResult.errors.join('; ') };
    }

    const now = new Date().toISOString();
    const strategy: Strategy = {
        id: generateId(),
        userId,
        tenantId,
        name: request.name,
        type: request.type,
        code: sanitizeResult.sanitized,
        metadata: {
            version: 1,
            ...request.metadata,
        },
        tags: request.tags || [],
        isPublic: request.isPublic || false,
        createdAt: now,
        updatedAt: now,
    };

    strategies.set(strategy.id, strategy);

    if (!strategiesByUser.has(userId)) {
        strategiesByUser.set(userId, new Set());
    }
    strategiesByUser.get(userId)!.add(strategy.id);

    return strategy;
}

/**
 * Get strategy by ID
 */
export function getStrategy(id: string, userId: string): Strategy | null {
    const strategy = strategies.get(id);
    if (!strategy) return null;
    // Allow access if owner or public
    if (strategy.userId !== userId && !strategy.isPublic) return null;
    return strategy;
}

/**
 * List strategies for a user
 */
export function listStrategies(
    userId: string,
    type?: StrategyType,
    tags?: string[]
): Strategy[] {
    const ids = strategiesByUser.get(userId);
    if (!ids) return [];

    let result: Strategy[] = [];
    for (const id of ids) {
        const strategy = strategies.get(id);
        if (strategy) result.push(strategy);
    }

    // Filter by type
    if (type) {
        result = result.filter(s => s.type === type);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
        result = result.filter(s =>
            tags.some(tag => s.tags.includes(tag))
        );
    }

    return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/**
 * Update a strategy
 */
export function updateStrategy(
    id: string,
    userId: string,
    request: UpdateStrategyRequest
): Strategy | { error: string } | null {
    const strategy = strategies.get(id);
    if (!strategy || strategy.userId !== userId) return null;

    if (request.code !== undefined) {
        const sanitizeResult = sanitizeDSLCode(request.code);
        if (!sanitizeResult.valid) {
            return { error: sanitizeResult.errors.join('; ') };
        }
        strategy.code = sanitizeResult.sanitized;
        strategy.metadata.version = (strategy.metadata.version || 0) + 1;
    }

    if (request.name !== undefined) strategy.name = request.name;
    if (request.metadata !== undefined) {
        strategy.metadata = { ...strategy.metadata, ...request.metadata };
    }
    if (request.tags !== undefined) strategy.tags = request.tags;
    if (request.isPublic !== undefined) strategy.isPublic = request.isPublic;

    strategy.updatedAt = new Date().toISOString();

    return strategy;
}

/**
 * Delete a strategy
 */
export function deleteStrategy(id: string, userId: string): boolean {
    const strategy = strategies.get(id);
    if (!strategy || strategy.userId !== userId) return false;

    strategies.delete(id);
    strategiesByUser.get(userId)?.delete(id);
    return true;
}

/**
 * Search public strategies
 */
export function searchPublicStrategies(
    query: string,
    type?: StrategyType
): Strategy[] {
    const results: Strategy[] = [];
    const lowerQuery = query.toLowerCase();

    for (const strategy of strategies.values()) {
        if (!strategy.isPublic) continue;

        const matchesQuery =
            strategy.name.toLowerCase().includes(lowerQuery) ||
            strategy.metadata.description?.toLowerCase().includes(lowerQuery) ||
            strategy.tags.some(t => t.toLowerCase().includes(lowerQuery));

        const matchesType = !type || strategy.type === type;

        if (matchesQuery && matchesType) {
            results.push(strategy);
        }
    }

    return results.slice(0, 50); // Limit results
}

/**
 * Clear all strategies (for testing)
 */
export function clearStrategies(): void {
    strategies.clear();
    strategiesByUser.clear();
}
