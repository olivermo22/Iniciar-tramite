# Gestoría Virtual - Solicitud

Aplicación full-stack con Next.js + TypeScript + Prisma + PostgreSQL para captura de solicitudes y panel interno de operadores.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth Credentials
- React Hook Form + Zod
- Leaflet + OpenStreetMap

## Ejecutar local
1. `cp .env.example .env`
2. Configura `DATABASE_URL`, `NEXTAUTH_SECRET` y variables restantes.
3. `npm install`
4. `npx prisma migrate dev --name init`
5. `npx prisma db seed`
6. `npm run dev`

## Acceso demo operadores
- Usuario: `ADMIN`
- Contraseña: `3971`
- Si tu DB aún no está lista, el acceso provisional funciona con `OPERATOR_DEMO_USERNAME` y `OPERATOR_DEMO_PASSWORD`.

## DHL (mapa/sucursales)
- Para pruebas rápidas usa `DHL_USE_MOCK=true`.
- Para API real: `DHL_USE_MOCK=false`, define `DHL_API_BASE_URL` y `DHL_API_TOKEN`.
- Si la API real falla, por defecto hay fallback a mock (`DHL_FALLBACK_TO_MOCK=true`).

## Módulos
- `/` formulario público con validación completa, fotos, firma, mapa DHL y envío a WhatsApp.
- `/operators/login` acceso de operadores.
- `/operators/dashboard` listado, búsqueda, filtros, detalle y reenvío de mensaje.

## Despliegue
Preparado para Railway o VPS. En producción:
- ejecutar migraciones con Prisma
- configurar almacenamiento (actualmente local en `/public/uploads`)
- configurar `DHL_USE_MOCK=false` y credenciales de DHL
