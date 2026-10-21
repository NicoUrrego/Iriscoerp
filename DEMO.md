# APK de prueba con SQLite

`releases/Iris-ERP-SQLite-Demo.apk` se instala como **Iris ERP Demo**, identificador `co.iris.erp.sqlite.demo`. Puede coexistir con Iris ERP SQLite y tiene almacenamiento privado independiente. Funciona sin servidor ni conexión después de instalarlo.

## Acceso

| Usuario | Rol | Contraseña |
|---|---|---|
| admin.demo | Todos los módulos | IrisDemo2026! |
| ventas.demo | Pedidos y consulta de productos | IrisDemo2026! |
| inventario.demo | Productos y materiales | IrisDemo2026! |

Las credenciales también aparecen en la pantalla de acceso de esta compilación. Todos los nombres y contactos son ficticios; los correos usan example.com.

## Datos iniciales

- 6 productos con precios, descuentos y existencias.
- 8 materiales; 3 por debajo del mínimo.
- 24 pedidos con dos líneas cada uno: 22 completados, 1 pendiente y 1 en proceso.
- Movimientos distribuidos en los últimos seis meses respecto al primer inicio, incluido el mes actual.
- 18 gastos, 4 costos fijos, 4 empleados y 3 máquinas en distintos estados.
- Reservas de inventario y eventos coherentes con las existencias.

La carga se hace dentro de una transacción en el primer inicio, sin duplicarse en aperturas posteriores. Las modificaciones y eliminaciones de prueba persisten; no se repone el ejemplo automáticamente. Para comenzar de nuevo, borrar **solo los datos de Iris ERP Demo** desde los ajustes de Android. Si la base ya tiene usuarios pero carece del marcador demo, no se agregan ejemplos para evitar mezclar datos.

## Reconstruir

```sh
npm ci
npm run typecheck
npm test
npm run android:demo
```

El último comando compila Vite en modo demo, sincroniza Capacitor con `IRIS_DEMO=true`, ejecuta Gradle con `-PirisDemo=true` y copia el APK a releases. En Windows aprovecha el JDK de Android Studio si existe; en otros entornos configurar JDK 21 y el SDK. Es un APK debug para pruebas, no una versión firmada para tienda.

Para probar la misma variante en navegador: `npm run dev:demo`. Usa una base web separada: `iris-sqlite-demo-web-v1`. Android y navegador no comparten los datos.

Para volver a compilar la versión normal: `npm run android:sync` y luego `assembleDebug` sin `-PirisDemo=true`. La versión normal no importa ni ejecuta la carga demo en su paquete final. El build demo y el normal reutilizan las carpetas dist y assets; sincronizar siempre la variante correcta antes de compilar.
