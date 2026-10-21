# Iris ERP SQLite

Aplicación React y TypeScript con backend de negocio integrado y base SQLite relacional. Funciona en Android sin servidor externo y permite probar el mismo negocio en navegador con SQLite WebAssembly.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
```

La primera apertura solicita crear ADMIN. No hay credenciales de demostración ni datos comerciales precargados.

```sh
npm run typecheck
npm test
npm run android:sync
npm run android:open
```

El esquema SQL activo está en `src/database/schema.sql`; los servicios están en `src/backend`. El proyecto Android ya está generado. Android Studio debe utilizar JDK 21 y disponer del SDK solicitado por Gradle.

Consulta [ARQUITECTURA_SQLITE.md](ARQUITECTURA_SQLITE.md) para estructura, tablas, reglas, roles, persistencia, exportación y límites.

APK de prueba: `android/app/build/outputs/apk/debug/app-debug.apk`. Está firmado para depuración, no para publicar en Play Store. La compilación incluye los plugins nativos SQLite, Filesystem y Share. Aún debe probarse en un móvil físico.

Esta es una copia independiente de la carpeta original del Escritorio. No migra automáticamente datos de la versión anterior.
