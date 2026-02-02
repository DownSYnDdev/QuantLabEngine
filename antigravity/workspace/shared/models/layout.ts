/**
 * Layout Model
 * Schema and operations for saved workspace layouts
 */

/**
 * Chart configuration within a layout
 */
export interface ChartConfig {
    symbol: string;
    timeframe: string;
    chartType: 'candlestick' | 'line' | 'bar' | 'area';
    indicators: IndicatorConfig[];
    drawings: Drawing[];
    showVolume: boolean;
    theme?: string;
}

/**
 * Indicator configuration
 */
export interface IndicatorConfig {
    id: string;
    name: string;
    type: string;
    params: Record<string, unknown>;
    color?: string;
    visible: boolean;
}

/**
 * Drawing on chart
 */
export interface Drawing {
    id: string;
    type: 'line' | 'horizontal' | 'vertical' | 'rectangle' | 'fibonacci' | 'text';
    points: { x: number; y: number }[];
    style: Record<string, unknown>;
}

/**
 * Panel configuration
 */
export interface PanelConfig {
    id: string;
    type: 'chart' | 'code' | 'watchlist' | 'portfolio' | 'orders';
    position: { x: number; y: number };
    size: { width: number; height: number };
    config?: ChartConfig | Record<string, unknown>;
}

/**
 * Layout entity
 */
export interface Layout {
    id: string;
    userId: string;
    tenantId: string;
    name: string;
    description?: string;
    panels: PanelConfig[];
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Layout creation request
 */
export interface CreateLayoutRequest {
    name: string;
    description?: string;
    panels: PanelConfig[];
    isDefault?: boolean;
}

/**
 * Layout update request
 */
export interface UpdateLayoutRequest {
    name?: string;
    description?: string;
    panels?: PanelConfig[];
    isDefault?: boolean;
}

// In-memory storage (replace with database)
const layouts = new Map<string, Layout>();
const layoutsByUser = new Map<string, Set<string>>();

/**
 * Generate unique ID
 */
function generateId(): string {
    return `layout-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Create a new layout
 */
export function createLayout(
    userId: string,
    tenantId: string,
    request: CreateLayoutRequest
): Layout {
    const now = new Date().toISOString();
    const layout: Layout = {
        id: generateId(),
        userId,
        tenantId,
        name: request.name,
        description: request.description,
        panels: request.panels,
        isDefault: request.isDefault || false,
        createdAt: now,
        updatedAt: now,
    };

    // If this is default, unset other defaults
    if (layout.isDefault) {
        const userLayoutIds = layoutsByUser.get(userId);
        if (userLayoutIds) {
            for (const id of userLayoutIds) {
                const existing = layouts.get(id);
                if (existing) existing.isDefault = false;
            }
        }
    }

    layouts.set(layout.id, layout);

    if (!layoutsByUser.has(userId)) {
        layoutsByUser.set(userId, new Set());
    }
    layoutsByUser.get(userId)!.add(layout.id);

    return layout;
}

/**
 * Get layout by ID
 */
export function getLayout(id: string, userId: string): Layout | null {
    const layout = layouts.get(id);
    if (!layout || layout.userId !== userId) return null;
    return layout;
}

/**
 * List layouts for a user
 */
export function listLayouts(userId: string): Layout[] {
    const ids = layoutsByUser.get(userId);
    if (!ids) return [];

    const result: Layout[] = [];
    for (const id of ids) {
        const layout = layouts.get(id);
        if (layout) result.push(layout);
    }
    return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/**
 * Update a layout
 */
export function updateLayout(
    id: string,
    userId: string,
    request: UpdateLayoutRequest
): Layout | null {
    const layout = layouts.get(id);
    if (!layout || layout.userId !== userId) return null;

    if (request.name !== undefined) layout.name = request.name;
    if (request.description !== undefined) layout.description = request.description;
    if (request.panels !== undefined) layout.panels = request.panels;
    if (request.isDefault !== undefined) {
        if (request.isDefault) {
            // Unset other defaults
            const userLayoutIds = layoutsByUser.get(userId);
            if (userLayoutIds) {
                for (const layoutId of userLayoutIds) {
                    const existing = layouts.get(layoutId);
                    if (existing && existing.id !== id) existing.isDefault = false;
                }
            }
        }
        layout.isDefault = request.isDefault;
    }
    layout.updatedAt = new Date().toISOString();

    return layout;
}

/**
 * Delete a layout
 */
export function deleteLayout(id: string, userId: string): boolean {
    const layout = layouts.get(id);
    if (!layout || layout.userId !== userId) return false;

    layouts.delete(id);
    layoutsByUser.get(userId)?.delete(id);
    return true;
}

/**
 * Get default layout for user
 */
export function getDefaultLayout(userId: string): Layout | null {
    const ids = layoutsByUser.get(userId);
    if (!ids) return null;

    for (const id of ids) {
        const layout = layouts.get(id);
        if (layout?.isDefault) return layout;
    }
    return null;
}

/**
 * Clear all layouts (for testing)
 */
export function clearLayouts(): void {
    layouts.clear();
    layoutsByUser.clear();
}
