// src/pages/api/admin/toggle-form-status.ts
import type { APIRoute } from 'astro';
import db from '../../db'; // Importa la conexión a la base de datos

export const POST: APIRoute = async ({ request }) => {
  try {
    const { form_name, is_enabled } = await request.json();

    if (!form_name || typeof is_enabled !== 'boolean') {
      return new Response(JSON.stringify({ message: 'Parámetros inválidos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Usamos INSERT ... ON DUPLICATE KEY UPDATE para asegurarnos de que la entrada exista
    // Si form_name ya existe, actualiza is_enabled. Si no, inserta una nueva fila.
    await db.execute(
      'INSERT INTO configuracion (form_name, is_enabled) VALUES (?, ?) ON DUPLICATE KEY UPDATE is_enabled = VALUES(is_enabled)',
      [form_name, is_enabled ? 1 : 0]
    );

    console.log(`Estado del formulario '${form_name}' actualizado a: ${is_enabled}`);

    return new Response(JSON.stringify({ message: 'Estado del formulario actualizado con éxito.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error("Error al alternar el estado del formulario:", e);
    return new Response(JSON.stringify({ message: 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
