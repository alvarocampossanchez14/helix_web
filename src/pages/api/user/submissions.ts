import type { APIRoute } from 'astro';
import db from '../../../db';
import { getUserIdFromSession } from '../../../utils/auth.js';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const userId = await getUserIdFromSession(cookies, import.meta.env.SESSION_COOKIE_NAME, request.url);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'No autenticado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Consulta la base de datos para encontrar las aplicaciones enviadas por este usuario.
    const [submissions] = await db.execute(
      'SELECT DISTINCT tipo_formulario FROM aplicaciones WHERE discord_id = ?',
      [userId]
    );

    // Mapea los resultados a un array simple de nombres de formularios.
    const submittedForms = submissions.map((item: any) => item.tipo_formulario);

    return new Response(JSON.stringify({ submittedForms }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en la API de submissions:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
