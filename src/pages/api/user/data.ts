import type { APIRoute } from 'astro';

export const prerender = false;

const SESSION_COOKIE_NAME = import.meta.env.SESSION_COOKIE_NAME;

export const GET: APIRoute = async ({ cookies }) => {
    const accessToken = cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!accessToken) {
        return new Response(JSON.stringify({ error: 'No authenticated' }), {
            status: 401,
        });
    }

    try {
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), {
                status: userResponse.status,
            });
        }

        const userData = await userResponse.json();
        return new Response(JSON.stringify(userData), { status: 200 });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
};