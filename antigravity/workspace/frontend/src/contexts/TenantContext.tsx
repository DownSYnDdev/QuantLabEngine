'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Tenant configuration from URL parameters or API
 */
export interface TenantConfig {
    tenantId: string;
    name: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
}

/**
 * Default tenant config (QuantLab branding)
 */
const defaultTenant: TenantConfig = {
    tenantId: 'quantlab',
    name: 'QuantLab',
    primaryColor: '#0F172A',
    secondaryColor: '#1E293B',
    accentColor: '#22C55E',
};

interface TenantContextValue {
    tenant: TenantConfig;
    isLoading: boolean;
    setTenant: (tenant: TenantConfig) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

/**
 * Hook to access tenant configuration
 */
export function useTenant() {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    return context;
}

interface TenantProviderProps {
    children: ReactNode;
}

/**
 * Tenant context provider
 * Loads tenant config from URL params or falls back to default
 */
export function TenantProvider({ children }: TenantProviderProps) {
    const [tenant, setTenant] = useState<TenantConfig>(defaultTenant);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load tenant from URL params
        const params = new URLSearchParams(window.location.search);
        const tenantId = params.get('tenantId');
        const configId = params.get('configId');

        if (tenantId) {
            // In production, fetch from API: /api/v1/tenants/{tenantId}
            // For now, simulate based on tenantId
            const tenantConfigs: Record<string, TenantConfig> = {
                tenantA: {
                    tenantId: 'tenantA',
                    name: 'Alpha Capital',
                    logoUrl: 'https://assets.alphacapital.com/logo.png',
                    primaryColor: '#1A73E8',
                    secondaryColor: '#1E293B',
                    accentColor: '#22C55E',
                },
                tenantB: {
                    tenantId: 'tenantB',
                    name: 'Beta Trading',
                    logoUrl: 'https://assets.betatrading.io/logo-dark.svg',
                    primaryColor: '#FF5500',
                    secondaryColor: '#1E293B',
                    accentColor: '#22C55E',
                },
            };

            if (tenantConfigs[tenantId]) {
                setTenant(tenantConfigs[tenantId]);
            }

            console.log(`Loaded tenant: ${tenantId}, config: ${configId}`);
        }

        setIsLoading(false);
    }, []);

    return (
        <TenantContext.Provider value={{ tenant, isLoading, setTenant }}>
            {children}
        </TenantContext.Provider>
    );
}
