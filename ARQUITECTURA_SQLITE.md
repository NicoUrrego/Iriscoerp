# Iris ERP con SQLite integrado

Esta versión parte del proyecto React y Vite adjunto y conecta sus pantallas con servicios TypeScript y una base SQLite relacional. No ejecuta un servidor Node en el teléfono y no requiere una API externa. Node se utiliza para instalar dependencias, compilar y probar.

## Estructura

```text
src/
  backend/
    domain/
      types.ts                       Entidades y permisos
      validation.ts                  Validadores y errores de dominio
    database/
      contracts.ts                   Contratos de consultas y drivers
      database.ts                    Cola, transacciones y migraciones
      drivers/
        native.ts                    SQLite nativo de Capacitor
        sqljs.ts                     Adaptador SQL común a pruebas y navegador
        browser.ts                   Persistencia del archivo SQLite y Web Locks
        browser-runtime.ts           Carga local del motor WebAssembly
    repositories/
      catalog.repository.ts          Consultas de productos, materiales y catálogos
      orders.repository.ts           Pedidos, líneas y eventos de stock
    services/
      auth.service.ts                Cuentas, sesiones e intentos de acceso
      crypto.ts                      PBKDF2, tokens y hashes
      catalog.service.ts             Validación y CRUD de catálogos
      orders.service.ts              Pedidos y reservas transaccionales
      analytics.service.ts           Consultas SQL de finanzas y reportes
      erp.service.ts                 Despacho y autorización de operaciones
    index.ts                         Selección del driver y composición
  database/
    schema.sql                       Esquema activo de la migración 1
    seed.sql                         Categorías iniciales sin datos comerciales falsos
  app/
    api.ts                           Llamadas locales al servicio y sesión
    hooks/useRecords.ts              Carga y mutaciones de las pantallas
    hooks/useAnalytics.ts            Consulta de métricas
    utils/export.ts                  Descarga web y compartir archivo Android
    components/                      Pantallas originales conectadas y módulos nuevos
tests/backend.test.ts                Pruebas de integración SQL
android/                             Proyecto nativo generado con los plugins
```

## Ejecución

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
```

Abrir la dirección que muestre Vite. En el primer inicio se crea una cuenta ADMIN con usuario, correo y contraseña de 8 a 256 caracteres. No se instala una cuenta de demostración. Desde Usuarios, ADMIN puede crear otras cuentas.

```sh
npm run typecheck
npm test
npm run build
npm run android:sync
npm run android:open
```

La carpeta Android ya está generada. Para regenerarla desde cero, si no existe, ejecutar `npx cap add android`. Para compilar en Android Studio se necesita JDK 21 y el SDK de Android que solicita el proyecto. `android/local.properties` contiene únicamente la ruta del SDK de esta máquina y está excluido de Git; en otro equipo debe adaptarse o usar las variables de entorno del SDK. Después de cambiar el código web, ejecutar build y sync antes de compilar de nuevo el APK.

`npm run dev` sirve para probar en navegador. El APK carga los archivos de `dist` copiados a sus assets; no necesita Vite ni una conexión con el computador una vez instalado. No hay `server.url` en la configuración de Capacitor.

## Motor y persistencia

En Android se usa `@capacitor-community/sqlite` sobre la base nativa privada de la aplicación. El nombre lógico es `iris_erp`. Todas las operaciones se ejecutan mediante consultas SQL, claves foráneas y transacciones SQLite.

En el navegador se utiliza `sql.js`, que ejecuta SQLite compilado a WebAssembly. El archivo WASM se incluye como asset local mediante Vite; no se obtiene de un CDN. La base SQLite binaria se guarda en IndexedDB, en la base `iris-sqlite-web-v1`, almacén `files`, clave `iris.sqlite`. IndexedDB funciona como almacenamiento del archivo; los usuarios, pedidos y productos no se guardan como un único documento JSON: están en tablas SQL dentro de ese archivo.

El navegador requiere Web Locks y un contexto seguro, como localhost o HTTPS. Bajo un bloqueo por nombre de base, cada operación vuelve a leer la última imagen SQLite, ejecuta una transacción y guarda el resultado. Así dos pestañas no sobrescriben silenciosamente los cambios de la otra. Cambiar de puerto u origen crea otro ámbito de almacenamiento. Android y el navegador no comparten datos entre sí.

Se solicita almacenamiento persistente cuando está disponible. Borrar los datos de la aplicación o del navegador, o desinstalar la aplicación, puede eliminar la base. No hay sincronización ni copia remota automática.

## Esquema relacional

Las tablas de negocio son `usuarios`, `sesiones`, `login_intentos`, `categorias`, `productos`, `materiales`, `clientes`, `pedidos`, `detalle_pedido`, `costos_fijos`, `gastos`, `empleados`, `maquinaria`, `mantenimientos_maquinaria`, `eventos_stock` y `eventos_pedidos`. `schema_migrations` registra las versiones aplicadas.

- Cada pedido referencia un cliente y contiene varias filas en `detalle_pedido`. En esta versión se crea una ficha de cliente por pedido para conservar sus datos de contacto; no se deduplican clientes de pedidos distintos.
- Cada línea referencia el producto y conserva nombre, precio, descuento y costo de producción históricos. El subtotal se almacena en centavos.
- Las categorías se relacionan por identificador y ámbito. Los servicios crean nuevas categorías válidas cuando se registra un catálogo.
- `ON DELETE CASCADE` elimina las líneas al borrar un pedido y los datos de mantenimiento al borrar una máquina. Los productos referenciados en pedidos no pueden borrarse.
- Los eventos conservan deltas de stock y cantidad de pedidos activos para reconstruir indicadores por fecha.
- `v_pedidos_total` agrega cantidad y total con `SUM` y `GROUP BY`. `v_materiales_bajo_stock` identifica cantidades inferiores al mínimo.

La migración inicial ejecuta `schema.sql` y `seed.sql` dentro de una transacción y registra versión 1. Para futuras versiones se deben añadir migraciones con números mayores en la composición. No se debe editar una migración aplicada esperando que cambie instalaciones existentes. No hay importación automática de los datos de la versión anterior con IndexedDB o del esquema SQLite anterior.

Los nombres de tablas y columnas dinámicos proceden de constantes internas. Los valores de usuario se pasan como parámetros `?`, incluso en las búsquedas. No se concatenan esos valores dentro del SQL.

## Recorrido de una operación

```text
Pantalla React -> api.ts -> ErpService.request
  -> sesión y permisos
  -> servicio de negocio
  -> repositorio SQL
  -> SqlDatabase.transaction
  -> driver Android o navegador
  -> COMMIT y persistencia confirmados -> actualización de pantalla
```

Los nombres GET, POST, PUT, PATCH y DELETE son convenciones del contrato de funciones; no representan una conexión HTTP. `https://iris.local/` es solo la base para analizar rutas con `URL`, no un servidor al que se envíen datos.

`SqlDatabase` serializa cada caso de uso. Los drivers desactivan las transacciones automáticas por sentencia para que todo el caso comparta una única transacción explícita. Si una validación o una consulta falla, se ejecuta rollback. En el navegador se espera también la persistencia de los bytes antes de devolver éxito; una falla de almacenamiento provoca error y la siguiente operación recupera la última imagen guardada.

## Pedidos e inventario

- Un pedido reserva productos desde Pendiente, no solo al completarlo. Se exige entre 1 y 100 líneas, sin productos duplicados y con cantidades enteras positivas.
- El servicio obtiene los precios de la base. Calcula descuentos y total; ignora cualquier total manipulado desde la pantalla.
- La reducción de unidades usa `UPDATE productos SET stock=stock-? WHERE id=? AND stock>=?`. Debe modificar exactamente una fila.
- Editar devuelve temporalmente la reserva anterior y aplica la nueva, dentro de la misma transacción. Eliminar devuelve las unidades. Una falla intermedia revierte todos los pasos.
- El precio, costo y descuento de líneas existentes se mantienen al editar, aunque el catálogo haya cambiado.
- Los materiales admiten cantidades decimales. Sus compras y consumos no se deducen automáticamente de pedidos ni gastos; el inventario de materias primas se ajusta desde su módulo.

## Usuarios y permisos

ADMIN accede a todos los módulos y crea cuentas. VENTAS gestiona pedidos y consulta productos. INVENTARIO gestiona productos y materiales. El menú muestra solo sus módulos y el servicio verifica nuevamente el permiso. VENTAS no puede mutar productos. La política actual permite consultar precio y costo del producto; no hay filtrado de campos por rol.

Las contraseñas se derivan con PBKDF2-SHA256, 600000 iteraciones, sal aleatoria de 16 bytes y salida de 256 bits. Se respetan los espacios de la contraseña. Los tokens son identificadores aleatorios de 32 bytes, no JWT. La base almacena su SHA256 y un vencimiento de ocho horas; el cliente conserva el token en sessionStorage.

Los intentos de login se registran en SQL y se limitan a diez por minuto en esta instalación. No es una autenticación central ni impide manipulación por alguien con depuración o acceso al almacenamiento del dispositivo. La base se abre sin cifrado y los datos comerciales no se cifran. No existe recuperación por correo.

## Finanzas y reportes

Los ingresos proceden exclusivamente de pedidos Completados, con `fecha_venta` asignada al completar. Reabrirlos retira el ingreso calculado; completarlos otra vez asigna una nueva fecha. Eliminar un pedido también modifica los reportes históricos.

Los gastos incluyen registros explícitos de materias primas, mano de obra y otros, más los vencimientos de costos fijos calculados con una CTE recursiva SQL. La frecuencia se ancla al mes de `inicio`; el día 31 se ajusta al último día de meses cortos. Son obligaciones calculadas, no verificación bancaria del pago. Editar o eliminar un costo fijo recalcula su historia. No lo registres de nuevo como gasto manual si ya está contabilizado por recurrencia.

Ganancia neta = ingresos - gastos. Margen = ganancia neta / ingresos por 100, o cero si no hay ingresos. El costo histórico de producción vendido se presenta separado: utilidad bruta = ingresos - costo de producción; productividad = ingresos / costo de producción, o sin base si es cero. No se descuenta otra vez ese costo de la ganancia neta para evitar duplicar materiales y mano de obra ya registrados como gastos.

El crecimiento compara ingresos del periodo actual hasta la fecha seleccionada con el periodo calendario anterior completo. Mes, trimestre y año son calendarios; comparar un periodo incompleto con uno completo debe interpretarse con esa diferencia. Con base anterior cero se informa sin base cuando el valor actual es distinto de cero.

El dashboard compara ventas del último mes cerrado con el anterior, y stock/pedidos activos contra el inicio del mes. Las series cubren seis meses. Las fechas de negocio utilizan America/Bogota. El ranking usa el identificador del producto para agregar sus ventas. Las consultas emplean JOIN, SUM, CASE, GROUP BY y consultas parametrizadas.

Empleados y maquinaria son registros administrativos. Los salarios y costos de mantenimiento no se convierten automáticamente en gastos: si se pagaron, se registran en Gastos con el concepto correspondiente. Esta versión no incluye fabricación mediante recetas de materiales, nómina automática, pagos parciales ni un libro contable inmutable.

## Exportación

Reportes exporta las métricas como JSON. Respaldo exporta las tablas y versión del esquema, sin sesiones ni contador de intentos. Incluye datos personales y verificadores de contraseñas: proteger el archivo. En Android se escribe en caché con Filesystem y se abre el diálogo del sistema con Share. En navegador se descarga como archivo. No se comparte nada automáticamente con un tercero.

La versión actual exporta y no incorpora restauración automática. No se debe desinstalar confiando en una restauración inexistente. El archivo de respaldo JSON es independiente del archivo SQLite interno.

## Pruebas y alcance de validación

Las pruebas ejecutan el motor SQLite real de sql.js. Cubren migraciones, formato de archivo y reapertura, claves foráneas, restricciones, descuento e históricos, reversión completa, concurrencia, roles, expiración/revocación, límite de login persistido, texto con SQL, catálogos, empleados, maquinaria, cascadas, fechas financieras, recurrencias, eventos y respaldos.

Resultados de esta entrega: catorce pruebas aprobadas; comprobación TypeScript y compilación de producción aprobadas; apertura inicial en navegador comprobada; proyecto Android sincronizado y `assembleDebug` completado con Java 21. El APK de prueba se genera en `android/app/build/outputs/apk/debug/app-debug.apk`. No se ha ejecutado en un móvil físico.

También prueban el adaptador del navegador con almacenamiento IndexedDB simulado, reapertura desde otra instancia, bloqueo entre instancias y recuperación de una falla al persistir. No son pruebas instrumentadas del plugin Android. La carga inicial del navegador y la compilación web se verifican por separado. Una compilación APK, si está disponible, no sustituye la prueba en un móvil físico en modo avión.

Antes de distribuir, comprobar creación de datos, cierre forzado/reapertura, permisos, exportación, instalación de una actualización sin borrar datos y comportamiento con almacenamiento lleno. La generación del APK debug es para pruebas, no una firma de publicación en Play Store.

## Dependencias y referencias

El proyecto conserva las bibliotecas visuales de la plantilla. Las pantallas principales sí están conectadas; `components/ui` continúa disponible como biblioteca reutilizable. El backend no depende de Express, un ORM ni del servidor Node anterior.

Se aplicaron correcciones compatibles de dependencias. La auditoría de esta construcción mantiene tres avisos moderados en herramientas de desarrollo, en la cadena `@capacitor/cli -> xcode -> uuid`; no se forzó la versión de Capacitor para resolverlos. Revisar `npm audit` antes de distribuir.

- [Plugin SQLite de Capacitor](https://github.com/capacitor-community/sqlite)
- [Documentación de sql.js](https://sql.js.org/documentation/)
- [Flujo de compilación de Capacitor](https://capacitorjs.com/docs/basics/workflow)
- [Filesystem](https://capacitorjs.com/docs/apis/filesystem)
- [Share](https://capacitorjs.com/docs/apis/share)
