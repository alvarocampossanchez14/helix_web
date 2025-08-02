import type { APIRoute } from 'astro';

export const prerender = false;

const DISCORD_CLIENT_ID = import.meta.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = import.meta.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = import.meta.env.DISCORD_REDIRECT_URI;
const ACCESS_TOKEN_COOKIE_NAME = import.meta.env.SESSION_COOKIE_NAME;
const PERSONAL_AREA_URL = '/area-personal';
const ACCESS_DENIED_URL = '/acceso-denegado';

export const GET: APIRoute = async ({ request, cookies }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
        console.error('El callback fue llamado sin un código de autorización.');
        return new Response(null, {
            status: 302,
            headers: {
                'Location': ACCESS_DENIED_URL,
            },
        });
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
            return new Response(null, {
                status: 302,
                headers: {
                    'Location': ACCESS_DENIED_URL,
                },
            });
        }

        const tokenData = await tokenResponse.json();

        cookies.set(ACCESS_TOKEN_COOKIE_NAME, tokenData.access_token, {
            httpOnly: true,
            secure: true, 
            path: '/',
            maxAge: tokenData.expires_in,
        });
        
        return new Response(null, {
            status: 302,
            headers: {
                'Location': PERSONAL_AREA_URL,
            },
        });
    } catch (error) {
        console.error('Error en el callback de Discord:', error);
        return new Response(null, {
            status: 302,
            headers: {
                'Location': ACCESS_DENIED_URL,
            },
        });
    }
};
