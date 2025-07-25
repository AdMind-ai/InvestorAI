// src/api/restrictedRoutes.ts
import { api } from './api';
import { ALL_APP_ROUTES } from "../routes";

export async function fetchRestrictedRoutes(): Promise<string[]> {
    try {
        await api.post("/master-route-list/", { routes: ALL_APP_ROUTES });
    } catch (e) {
        console.error("Error posting master route list:", e);
    }

    try {
        const res = await api.get('/company-route-restriction/');
        if (Array.isArray(res.data.restricted_routes) &&
                res.data.restricted_routes.length === 1 &&
                res.data.restricted_routes[0] === "all") {
            return ALL_APP_ROUTES;
        }
        return res.data.restricted_routes || [];
    } catch {
        return ALL_APP_ROUTES; // Fallback to all routes if the API call fails
    }
}