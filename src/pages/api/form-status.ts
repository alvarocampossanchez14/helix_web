import type { APIRoute } from 'astro';
import db from '../../db';


export const GET: APIRoute = async () => {
  try {
    const [rows] = await db.execute('SELECT form_name, is_enabled FROM configuracion');
    
    const formStatus = rows.reduce((acc, row) => {
        acc[row.form_name] = row.is_enabled === 1;
        return acc;
    }, {});

    return new Response(JSON.stringify(formStatus), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error al obtener el estado de los formularios:", error);
    return new Response(JSON.stringify({}), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
