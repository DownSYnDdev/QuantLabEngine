/**
 * Watchlist Model
 * Schema and operations for user watchlists
 */

/**
 * Watchlist item (symbol with metadata)
 */
export interface WatchlistItem {
    symbol: string;
    addedAt: string;
    notes?: string;
    alertPrice?: number;
}

/**
 * Watchlist entity
 */
export interface Watchlist {
    id: string;
    userId: string;
    tenantId: string;
    name: string;
    symbols: WatchlistItem[];
    sortOrder: string[]; // Symbol order for display
    createdAt: string;
    updatedAt: string;
}

/**
 * Watchlist creation request
 */
export interface CreateWatchlistRequest {
    name: string;
    symbols?: string[];
}

/**
 * Watchlist update request
 */
export interface UpdateWatchlistRequest {
    name?: string;
    sortOrder?: string[];
}

// In-memory storage
const watchlists = new Map<string, Watchlist>();
const watchlistsByUser = new Map<string, Set<string>>();

/**
 * Generate unique ID
 */
function generateId(): string {
    return `watchlist-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Create a new watchlist
 */
export function createWatchlist(
    userId: string,
    tenantId: string,
    request: CreateWatchlistRequest
): Watchlist {
    const now = new Date().toISOString();
    const symbols: WatchlistItem[] = (request.symbols || []).map(symbol => ({
        symbol: symbol.toUpperCase(),
        addedAt: now,
    }));

    const watchlist: Watchlist = {
        id: generateId(),
        userId,
        tenantId,
        name: request.name,
        symbols,
        sortOrder: symbols.map(s => s.symbol),
        createdAt: now,
        updatedAt: now,
    };

    watchlists.set(watchlist.id, watchlist);

    if (!watchlistsByUser.has(userId)) {
        watchlistsByUser.set(userId, new Set());
    }
    watchlistsByUser.get(userId)!.add(watchlist.id);

    return watchlist;
}

/**
 * Get watchlist by ID
 */
export function getWatchlist(id: string, userId: string): Watchlist | null {
    const watchlist = watchlists.get(id);
    if (!watchlist || watchlist.userId !== userId) return null;
    return watchlist;
}

/**
 * List watchlists for a user
 */
export function listWatchlists(userId: string): Watchlist[] {
    const ids = watchlistsByUser.get(userId);
    if (!ids) return [];

    const result: Watchlist[] = [];
    for (const id of ids) {
        const watchlist = watchlists.get(id);
        if (watchlist) result.push(watchlist);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Update a watchlist
 */
export function updateWatchlist(
    id: string,
    userId: string,
    request: UpdateWatchlistRequest
): Watchlist | null {
    const watchlist = watchlists.get(id);
    if (!watchlist || watchlist.userId !== userId) return null;

    if (request.name !== undefined) watchlist.name = request.name;
    if (request.sortOrder !== undefined) watchlist.sortOrder = request.sortOrder;

    watchlist.updatedAt = new Date().toISOString();
    return watchlist;
}

/**
 * Add symbol to watchlist
 */
export function addSymbolToWatchlist(
    id: string,
    userId: string,
    symbol: string,
    notes?: string
): Watchlist | null {
    const watchlist = watchlists.get(id);
    if (!watchlist || watchlist.userId !== userId) return null;

    const normalizedSymbol = symbol.toUpperCase();

    // Check if already exists
    if (watchlist.symbols.some(s => s.symbol === normalizedSymbol)) {
        return watchlist;
    }

    watchlist.symbols.push({
        symbol: normalizedSymbol,
        addedAt: new Date().toISOString(),
        notes,
    });
    watchlist.sortOrder.push(normalizedSymbol);
    watchlist.updatedAt = new Date().toISOString();

    return watchlist;
}

/**
 * Remove symbol from watchlist
 */
export function removeSymbolFromWatchlist(
    id: string,
    userId: string,
    symbol: string
): Watchlist | null {
    const watchlist = watchlists.get(id);
    if (!watchlist || watchlist.userId !== userId) return null;

    const normalizedSymbol = symbol.toUpperCase();

    watchlist.symbols = watchlist.symbols.filter(s => s.symbol !== normalizedSymbol);
    watchlist.sortOrder = watchlist.sortOrder.filter(s => s !== normalizedSymbol);
    watchlist.updatedAt = new Date().toISOString();

    return watchlist;
}

/**
 * Update symbol notes or alert
 */
export function updateWatchlistSymbol(
    id: string,
    userId: string,
    symbol: string,
    updates: { notes?: string; alertPrice?: number }
): Watchlist | null {
    const watchlist = watchlists.get(id);
    if (!watchlist || watchlist.userId !== userId) return null;

    const normalizedSymbol = symbol.toUpperCase();
    const item = watchlist.symbols.find(s => s.symbol === normalizedSymbol);

    if (!item) return null;

    if (updates.notes !== undefined) item.notes = updates.notes;
    if (updates.alertPrice !== undefined) item.alertPrice = updates.alertPrice;

    watchlist.updatedAt = new Date().toISOString();
    return watchlist;
}

/**
 * Delete a watchlist
 */
export function deleteWatchlist(id: string, userId: string): boolean {
    const watchlist = watchlists.get(id);
    if (!watchlist || watchlist.userId !== userId) return false;

    watchlists.delete(id);
    watchlistsByUser.get(userId)?.delete(id);
    return true;
}

/**
 * Clear all watchlists (for testing)
 */
export function clearWatchlists(): void {
    watchlists.clear();
    watchlistsByUser.clear();
}
