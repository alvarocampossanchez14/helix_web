import type { APIRoute } from 'astro';

export const prerender = false;

const DISCORD_CLIENT_ID = import.meta.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = import.meta.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = import.meta.env.DISCORD_REDIRECT_URI;
const ACCESS_TOKEN_COOKIE_NAME = import.meta.env.SESSION_COOKIE_NAME;
const PERSONAL_AREA_URL = '/area-personal';

export const GET: APIRoute = async ({ request, redirect, cookies }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
        console.error('El callback fue llamado sin un código de autorización.');
        return redirect('/acceso-denegado');
    }

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_REDIRECT_URI,
            }),
        });

        if (!tokenResponse.ok) {
            console.error('Error al obtener el token:', await tokenResponse.text());
            return redirect('/acceso-denegado');
        }

        const tokenData = await tokenResponse.json();

        cookies.set(ACCESS_TOKEN_COOKIE_NAME, tokenData.access_token, {
            httpOnly: true,
            secure: false, // Cambia a true en producción
            path: '/',
            maxAge: tokenData.expires_in,
        });
        
        return redirect(PERSONAL_AREA_URL);
    } catch (error) {
        console.error('Error en el callback de Discord:', error);
        return redirect('/acceso-denegado');
    }
};
