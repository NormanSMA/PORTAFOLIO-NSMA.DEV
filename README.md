# Portfolio — nsma.dev

Este repositorio contiene el portfolio personal (sitio estático) desarrollado con React + TypeScript + Vite y TailwindCSS.

Este README documenta cómo ejecutar, compilar y desplegar el proyecto, y resume la auditoría básica realizada sobre estructura, seguridad, dependencias y buenas prácticas.

## Estado actual (resumen de la auditoría)

- Build: OK — `npm run build` completa sin errores (Vite + TypeScript).
- Lint: advertencia menor sobre migración de `.eslintignore` (ESLint) pero sin errores críticos; `npm run lint` termina correctamente.
- Vulnerabilidades: `npm audit` no reporta vulnerabilidades conocidas en las dependencias instaladas.
- Accesibilidad básica: el proyecto usa atributos `alt`, `aria-*`, `aria-current` y `aria-label` en componentes principales. Buenas prácticas aplicadas en la mayoría de componentes.
- Performance: images usan `loading="lazy"` en el héroe; Tailwind está correctamente configurado.

Conclusión: no se han detectado fallos críticos automáticos. A continuación hay recomendaciones y pasos sugeridos para fortalecer calidad, seguridad y mantenimiento.

## Tech stack

- Vite
- React 19
- TypeScript
- TailwindCSS
- Framer Motion
- i18next (i18n)
- ESLint

## Scripts principales

- `npm run dev` — arranca el servidor de desarrollo (Vite).
- `npm run build` — compila TypeScript y crea el bundle de producción.
- `npm run preview` — sirve el build en modo preview.
- `npm run lint` — corre ESLint sobre el proyecto.

## Instrucciones de desarrollo (rápidas)

1. Instalar dependencias:

```powershell
npm install
```

2. Servir en desarrollo:

```powershell
npm run dev
```

3. Compilar producción y probar preview:

```powershell
npm run build
npm run preview
```

4. Ejecutar ESLint:

```powershell
npm run lint
```

## Recomendaciones de auditoría (priorizadas)

1. Seguridad en producción (alta prioridad)
  - Configurar cabeceras HTTP en el hosting (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy). El archivo `public/_headers` es útil en hosts como Netlify, pero en otros hosts hay que configurar la plataforma.
  - CSP: aplicar políticas estrictas en cabeceras en vez de confiar en meta tags; evitar `unsafe-inline` y `unsafe-eval` si es posible.
  - Protecciones de imágenes: las mitigaciones en cliente (`public/protect-images.js`) sólo aumentan la fricción; para verdadera protección usar signed URLs, autenticación o servir imágenes desde un backend seguro.

2. Calidad del código y lint (media)
  - Migrar reglas ESLint a checks con type-aware rules (usar `tsconfig.app.json`/`tsconfig.node.json` en `eslint.config.js`) para capturar errores TS en lint.
  - Eliminar o migrar `.eslintignore` hacia la propiedad `ignores` en `eslint.config.js` (mensaje de advertencia actual).
  - Considerar añadir Prettier o reglas de formateo automáticas en pre-commit (husky + lint-staged).

3. Tests (alta/funcional)
  - Añadir tests unitarios/integ. Recomiendo Vitest (ligero y compatible con Vite) y unas pocas pruebas para componentes críticos (Hero, Navbar, Footer).

4. CI / CD (media)
  - Añadir un flujo de CI (GitHub Actions) que ejecute `npm ci`, `npm run lint`, `npm run build` y `npm test` en pushes y PRs.

5. Performance (baja/optimizaciones)
  - Optimizar imágenes: usar WebP/AVIF, generar tamaños responsive, y servir desde CDN.
  - Analizar bundle con `vite build --report` o using `rollup-plugin-visualizer` para encontrar módulos pesados.

6. Dependencias y mantenimiento
  - Mantener dependencias actualizadas periódicamente y revisar `npm audit` en la CI.

## Cambios aplicados en esta auditoría

- He comprobado localmente: `npm run build` (OK), `npm run lint` (salida con advertencia sobre `.eslintignore`), `npm audit` (sin vulnerabilidades).

No he aplicado cambios de código riesgosos en el árbol de producción en esta pasada. Si quieres, puedo aplicar mejoras automáticas de bajo riesgo (por ejemplo: migrar `.eslintignore` a `eslint.config.js`, añadir un workflow de GitHub Actions básico, o implementar Prettier + lint-staged). Dime qué prefieres y lo hago.

## Estructura del proyecto (resumen)

- `public/` — archivos estáticos (index.html, headers, scripts de protección de imágenes).
- `src/` — código fuente React (componentes atómicos, moléculas, organismos), contextos, hooks, i18n.
- `src/main.tsx` — entrypoint.
- `vite.config.ts` — configuración del dev server y build (sourcemap disabled, minify: esbuild).

## Checklist de buenas prácticas sugeridas (quick wins)

- [x] Build reproducible con TypeScript y Vite.
- [x] Uso de atributos `alt` y `aria-*` en componentes principales.
- [x] `loading="lazy"` en imágenes críticas (Hero).
- [ ] Añadir tests con Vitest (recomendado).
- [ ] Añadir CI (GitHub Actions) para lint/build/test.
- [ ] Considerar Prettier y hooks pre-commit.

## Siguientes pasos que puedo hacer ahora mismo

1. Crear un `README.md` más completo (hecho).
2. Añadir un workflow de GitHub Actions para CI que ejecute `npm ci`, `npm run lint` y `npm run build` (opcional, lo implemento si me das OK).
3. Migrar la configuración de `.eslintignore` a `eslint.config.js` si quieres que la advertencia desaparezca.
4. Implementar Vitest y un test básico para `App`.

Indica cuál de los pasos (2-4) quieres que ejecute y lo hago ahora.

---

Licencia: ver archivo `LICENSE`.

Contacto: Norman Martínez — información pública en el portafolio.

