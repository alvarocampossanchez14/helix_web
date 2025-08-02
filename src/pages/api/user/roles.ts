// src/pages/api/user/roles.ts
import type { APIRoute } from 'astro';

const STAFF_ROLE_ID = '1160147405740724224';
const DISCORD_SERVER_ID = '939873910202179615';
const SESSION_COOKIE_NAME = import.meta.env.SESSION_COOKIE_NAME;

// Caché en memoria para las respuestas de roles
const roleCache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutos de caché

export const GET: APIRoute = async ({ cookies, request }) => {
    console.log('--- Verificando roles de staff ---');

    const accessToken = cookies.get(SESSION_COOKIE_NAME)?.value;
    console.log('Access Token presente:', !!accessToken);

    if (!accessToken) {
        return new Response(JSON.stringify({ isStaff: false, roles: [] }), { status: 401 });
    }

    try {
        // Obtenemos el ID del usuario de la cookie (si existe)
        const userCookie = cookies.get('dsc_user_id')?.value;
        const cacheKey = userCookie || accessToken;

        // Intentamos obtener los roles de la caché
        if (roleCache.has(cacheKey)) {
            const { roles, timestamp } = roleCache.get(cacheKey);
            if (Date.now() - timestamp < CACHE_TTL) {
                console.log('Roles obtenidos de la caché');
                const isStaff = roles.includes(STAFF_ROLE_ID);
                return new Response(JSON.stringify({ isStaff, roles }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                // La caché ha expirado
                roleCache.delete(cacheKey);
            }
        }
        
        // Si no hay caché o ha expirado, hacemos la llamada a la API de Discord
        const guildMemberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_SERVER_ID}/member`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        console.log('Respuesta de Discord (status):', guildMemberResponse.status);

        if (!guildMemberResponse.ok) {
            return new Response(JSON.stringify({ isStaff: false, roles: [] }), { status: 403 });
        }

        const memberData = await guildMemberResponse.json();
        const userRoles = memberData.roles;
        
        console.log('Roles del usuario:', userRoles);
        console.log('ID de rol de staff a buscar:', STAFF_ROLE_ID);

        // Guardamos la respuesta en la caché
        roleCache.set(cacheKey, { roles: userRoles, timestamp: Date.now() });

        const isStaff = userRoles.includes(STAFF_ROLE_ID);
        console.log('¿Es staff?:', isStaff);

        return new Response(JSON.stringify({ isStaff, roles: userRoles }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error al verificar roles de Discord:', error);
        return new Response(JSON.stringify({ isStaff: false, roles: [] }), { status: 500 });
    }
};
