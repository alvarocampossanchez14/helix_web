// src/utils/auth.js

/**
 * Valida la sesión de Discord y obtiene los datos del usuario y sus roles.
 * @param {import('astro').AstroCookies} cookies El objeto de cookies de Astro.
 * @param {string} sessionCookieName El nombre de la cookie de sesión.
 * @param {string} staffRoleId El ID del rol de staff de Discord.
 * @param {string} requestUrl La URL de la solicitud para construir el origen.
 * @returns {Promise<{user: object | null, hasStaffRole: boolean, roles: string[]}>}
 */
export async function getUserAndRoles(cookies, sessionCookieName, staffRoleId, requestUrl) {
    const sessionCookie = cookies.get(sessionCookieName);
    let user = null;
    let hasStaffRole = false;
    let roles = [];

    if (sessionCookie) {
        try {
            const origin = new URL(requestUrl).origin;
            const cookieHeader = `${sessionCookieName}=${sessionCookie.value}`;
            
            // Fetch user data
            const userDataResponse = await fetch(`${origin}/api/user/data`, {
                headers: { 'Cookie': cookieHeader }
            });
            
            if (userDataResponse.ok) {
                user = await userDataResponse.json();
                
                // Fetch user roles
                const rolesDataResponse = await fetch(`${origin}/api/user/roles`, {
                    headers: { 'Cookie': cookieHeader }
                });

                if (rolesDataResponse.ok) {
                    const rolesData = await rolesDataResponse.json();
                    if (rolesData && Array.isArray(rolesData.roles)) {
                        roles = rolesData.roles;
                        hasStaffRole = roles.includes(staffRoleId);
                    } else {
                        console.error("La respuesta de la API de roles no contiene un array de roles.");
                    }
                } else {
                    console.error(`Error al obtener roles: ${rolesDataResponse.status} ${rolesDataResponse.statusText}`);
                    cookies.delete(sessionCookieName);
                }
            } else {
                console.error(`Error al obtener datos del usuario: ${userDataResponse.status} ${userDataResponse.statusText}`);
                cookies.delete(sessionCookieName);
            }
        } catch (e) {
            console.error("Error en la validación de la sesión:", e);
            cookies.delete(sessionCookieName);
        }
    }

    return { user, hasStaffRole, roles };
}


export async function getUserIdFromSession(cookies, sessionCookieName, requestUrl) {
    const sessionCookie = cookies.get(sessionCookieName);

    if (!sessionCookie) {
        return null;
    }

    try {
        const origin = new URL(requestUrl).origin;
        const cookieHeader = `${sessionCookieName}=${sessionCookie.value}`;
        
        // Llama a la API interna para obtener los datos del usuario usando su token.
        const userDataResponse = await fetch(`${origin}/api/user/data`, {
            headers: { 'Cookie': cookieHeader }
        });

        if (userDataResponse.ok) {
            const userData = await userDataResponse.json();
            return userData.id;
        } else {
            console.error(`Error al obtener datos del usuario desde la API: ${userDataResponse.status}`);
            return null;
        }
    } catch (e) {
        console.error('Error al obtener el ID del usuario desde la sesión:', e);
        return null;
    }
}