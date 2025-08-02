import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies }) => {
  cookies.delete(import.meta.env.SESSION_COOKIE_NAME, { path: '/' });

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
    },
  });
};
