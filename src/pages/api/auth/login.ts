import type { APIRoute } from 'astro';

const DISCORD_CLIENT_ID = import.meta.env.DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = import.meta.env.DISCORD_REDIRECT_URI;
const SESSION_COOKIE_NAME = import.meta.env.SESSION_COOKIE_NAME; 
const PERSONAL_AREA_URL = '/area-personal';

const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20guilds.members.read`;

export const GET: APIRoute = ({ cookies }) => {
    const sessionCookie = cookies.get(SESSION_COOKIE_NAME);

    if (sessionCookie && sessionCookie.value) {
        return new Response(null, {
            status: 302,
            headers: {
                'Location': PERSONAL_AREA_URL,
            },
        });
    }

    return new Response(null, {
        status: 302,
        headers: {
            'Location': DISCORD_OAUTH_URL,
        },
    });
};
