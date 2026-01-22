ATLAS allows companies to manage, send, forward, and track digital documents across organizational areas securely, eliminating emails and manual processes.

### Tech Stack by Components

MOST IMPORTANT WE USE SUPABASE FOR ALL BACKEND NEEDS (AUTH, DB, STORAGE), AND ONLY /api `api/` USE WHEN I NEED TO DO SOMETHING CUSTOM THAT SUPABASE CANT HANDLE

### No negociables

- Todos los UI tiene que ser responsive
- Para los formularios tienen que siempre estar con sus validaciones estamos usando zod + reac hook form + Si esque es un form chico simplemente con los elementos normales si son form mas complejos usar los componentes de shadcn
- Si necesitas un componente siempre revisa que el componente si lo tiene shadcn usa el de shadcn si no implementalo tu mismo pero siempre verifica si shadcn ya lo tiene para que ya no crees tu mismo 
-Si tiene todo el sentido del mundo utiliza Tanstack Query para las peticiones si determinas quen no hace falta entonces no lo utilices. Aunque en la mayoria de los casos si se va a utilizar

### Features

Funcionalidades

**CRÍTICO - OPTIMIZACIÓN DE CARGA:**
- Dashboard debe cargar lo mas rapido posible
- Imágenes y documentos optimizados
- Queries de Supabase optimizados con índices apropiados

**CADA EMPRESA ES INDEPENDIENTE:**
- Si creo cuenta "Empresa A", NO puedo ver datos de "Empresa B"
- Las subcuentas solo ven documentos y usuarios de su propia empresa
- Implementar `company_id` en TODAS las tablas relevantes
- Row Level Security (RLS) debe filtrar POR EMPRESA automáticamente
- Buckets de Storage separados por empresa o rutas con `company_id/`
- Validar pertenencia a empresa en TODAS las operaciones

IMPORANTE: Super importante quiero que el dashboard tenga las mejores animaciones sutiles que eleven exponecialmente el dashboard usando motion, solo donde tenga sentido tenerlas 

┌─────────────────────────────────────────────────────────────────┐
│ REGISTRO DE CUENTA ADMINISTRADOR                             │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Primera cuenta creada siempre es administrador con control total de su empresa

**Flujo:**
- Formulario con: Nombre de empresa, Nombre completo, Email, Contraseña, Confirmar contraseña
- Validaciones:
  * Email único en el sistema
  * Contraseña mínimo 8 caracteres (letras, números, símbolo)
  * Contraseñas deben coincidir
- Al registrarse:
  * Crear usuario en Supabase Auth
  * Crear empresa nueva con `company_id` único
  * Crear registro en tabla `users` con rol "admin" y `company_id`

**Validaciones del plan de pruebas:**
- ✅ Permitir registro con datos válidos
- ❌ Rechazar email duplicado o formato inválido

┌─────────────────────────────────────────────────────────────────┐
│ INICIO DE SESIÓN                                             │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Autenticación segura con redirección según rol

**Flujo:**
- Formulario: Email, Contraseña
- Autenticación con Supabase Auth
- Al iniciar sesión:
  * Validar credenciales
  * Crear sesión persistente
  * Obtener `company_id` del usuario
  * Redirigir a dashboard según rol
- Proteger TODAS las rutas privadas
- SUPER IMPORATNTE SI NO TIENE UNA SESION ACTIVA REDIRIGIR A LA PAGINA DE LOGIN

**Validaciones:**
- ✅ Permitir acceso con credenciales correctas
- ❌ Bloquear con mensaje genérico si credenciales incorrectas

┌─────────────────────────────────────────────────────────────────┐
│ CREAR ÁREAS/DEPARTAMENTOS                                    │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Admin define estructura organizacional de su empresa

**Flujo:**
- Solo administradores pueden acceder
- Lista de áreas existentes de la empresa (filtrado por `company_id`)
- Botón "+ Nueva área"
- Modal con: Nombre del área, Descripción
- Validaciones:
  * Nombre único dentro de la empresa
  * Solo caracteres alfanuméricos y espacios
  * Longitud: 3-50 caracteres
- Al crear: Agregar con `company_id` del usuario actual

**Funcionalidad CRUD completa:**
- Crear área nueva
- Editar nombre/descripción
- Eliminar área (validar que no tenga documentos asignados)
- Ver lista de áreas

**Validaciones:**
- ✅ Crear área con nombre único y válido
- ❌ Rechazar nombres duplicados o con caracteres especiales

┌─────────────────────────────────────────────────────────────────┐
│ CREAR CATEGORIAS                                  │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Admin define que tipo de categorias quiero organizar, tambien se crear por defecto para las nuevas cuentas como puede ser 
Factura, Orden de compra, Contrato, Reporte, OTRO
**Flujo:**
- Solo administradores pueden acceder
- Lista de categorias existentes de la empresa (filtrado por `company_id`)
- Botón "+ Nueva Categoria"
- Modal con: Nombre de la categoria, Descripción
- Validaciones:
  * Nombre único dentro de la empresa
  * Solo caracteres alfanuméricos y espacios
  * Longitud: 3-50 caracteres
- Al crear: Agregar con `company_id` del usuario actual

**Funcionalidad CRUD completa:**
- Crear área categoria
- Editar nombre/descripción
- Eliminar categoria (validar que no tenga documentos asignados)
- Ver lista de áreas

**Validaciones:**
- ✅ Crear categoria con nombre único y válido
- ❌ Rechazar nombres duplicados o con caracteres especiales

┌─────────────────────────────────────────────────────────────────┐
│ CREAR SUBCUENTA DE PERSONAL                                  │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Admin crea cuentas para empleados de su empresa

**Flujo:**
- Solo administradores pueden acceder
- Tabla de usuarios existentes (filtrado por `company_id`)
- Botón "+ Nuevo usuario"
- Formulario: Nombre completo, Email, Cargo, Área (dropdown), Rol (dropdown), y tambien le permita poner una contraseña
- Roles disponibles: Administrador, Supervisor, Usuario
- Super impornate no cometas el error que cuando se crea la subcuenta, se active su token para la sesion que tiene activa por ejemplo yo tengo mi cuenta admin y registro una subcuenta para nada quiero que me actives la session de esa nueva cuenta que cree simplemente cree la cuenta
- Ademas que verifica correctamente que yo puedo eliminar esas cuentas de forma correcta y que siempre tiene que aver 1 cuenta administrador y solo esa no se puede borrar
- Al crear:
  * Crear registro en tabla `users` con `company_id` del admin
  * Estado inicial: "Activo"
  * Agregar a lista visible

**Validaciones:**
- ✅ Crear usuario con datos válidos y asignaciones correctas
- ❌ Rechazar email duplicado o área no seleccionada

┌─────────────────────────────────────────────────────────────────┐
│ ASIGNAR/MODIFICAR ROLES                                      │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Admin gestiona permisos de usuarios de su empresa, recuerda implementar roles y permisos de forma eficiente y cohernete sobre todo facil de implementar no queremos nada complejo quremos algo que funcione bien y sea eficente

**Flujo:**
- Desde tabla de usuarios, click en usuario específico
- Panel lateral con información actual
- Campos editables: Rol, Área, Estado (Activo/Inactivo)
- Validación crítica: Debe existir al menos 1 admin activo en la empresa
- Al guardar:
  * Actualizar registro en tabla `users`
  * Ajustar permisos automáticamente según nuevo rol
  * Mostrar confirmación

**Validaciones:**
- ✅ Actualizar rol y permisos correctamente
- ❌ Bloquear eliminación del único admin activo

┌─────────────────────────────────────────────────────────────────┐
│ SUBIR DOCUMENTO                                              │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Cargar archivos a Supabase Storage con metadatos

**Flujo:**
- Área de drag & drop + botón "Seleccionar archivo"
- Validaciones ANTES de subir:
  * Formatos permitidos: PDF, DOCX, XLSX, JPG, PNG
  * Formatos BLOQUEADOS: .exe, .bat, .sh, .cmd, .msi, .app
  * Tamaño máximo: 50MB
  * Validar MIME type además de extensión
- Formulario: Título, Categoría (dropdown: Factura, Orden de compra, Contrato, Reporte, viene de la tabla de categorias tienes que crear categorias por defecto para todos las nuevas cuentas como las que menciono ahi )
- Estado seleccionar en que estado esta el documento actual
- Selector: Área destino, Usuario destino (opcional)
- Al subir:
  * Subir a Supabase Storage en ruta: `company_id/documents/filename`
  * Guardar metadatos en tabla `documents` con `company_id`
  * Asignar a área/usuario destino
  * Crear registro en `document_history`: "Documento subido"
  * Mostrar confirmación
  * Por defecto el estado del documento es pendiente si no se indica en la subida del arhcivo

**Validaciones:**
- ✅ Subir archivo válido con metadatos completos
- ❌ Rechazar formatos peligrosos y archivos >10MB
- ✅ Asignar a área/usuario correctamente
- ❌ Bloquear si no se selecciona destino

┌─────────────────────────────────────────────────────────────────┐
│ VISUALIZAR DOCUMENTO                                         │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Ver archivos con control de permisos estricto

**Flujo:**
- Bandeja de documentos (filtrado por `company_id` y permisos del usuario)
- Lista/grid de documentos con: Título, Remitente, Fecha, poder cambiar el Estado
- Click en documento abre visor
- Control de acceso:
  * Validar que usuario pertenece a la misma empresa
  * Validar que tiene permisos según su área/rol
  * Proteger acceso directo por URL
- Visor muestra:
  * Contenido del archivo (PDF viewer, imagen, etc)
  * Metadatos: Título, Categoría, Fecha, Remitente, Estado
  * Opciones: Descargar, Derivar, Ver historial
- **CRÍTICO:** Registrar visualización en `document_history`

**Validaciones:**
- ✅ Mostrar visor con contenido y registrar en historial
- ❌ Bloquear acceso por URL directa sin permisos

┌─────────────────────────────────────────────────────────────────┐
│ DESCARGAR DOCUMENTO                                          │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Descargar archivos desde Storage

**Flujo:**
- Botón "Descargar" visible en visor
- Validar permisos de usuario
- Descargar desde Supabase Storage
- Nombre de archivo: original o título del documento
- Registrar descarga en `document_history` con timestamp

**Validaciones:**
- ✅ Permitir descarga y registrar en historial
- ❌ Manejar error si archivo fue eliminado

┌─────────────────────────────────────────────────────────────────┐
│ 9. DERIVAR DOCUMENTO                                            │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Enviar documento a siguiente responsable en flujo

**Flujo:**
- Botón "Derivar" desde documento abierto
- Modal con:
  * Selector de área destino (solo áreas de la empresa)
  * Selector de usuario destino (usuarios activos del área)
  * Campo opcional para comentarios
- Al derivar:
  * Actualizar `current_area_id` y `current_user_id` en tabla `documents`
  * Cambiar estado a "Derivado"
  * Crear registro en `document_history` con: from_area, to_area, to_user, comentario
  * Enviar notificación al receptor (email o in-app)
  * Mover de bandeja del usuario actual a bandeja del destinatario

**Validaciones:**
- ✅ Derivar exitosamente con registro completo
- ❌ Rechazar si área inexistente o usuario inactivo

┌─────────────────────────────────────────────────────────────────┐
│ 10. VER HISTORIAL COMPLETO                                      │
└─────────────────────────────────────────────────────────────────┘

**Descripción:** Timeline de trazabilidad completa del documento

**Flujo:**
- Opción "Ver historial" visible en documento
- Panel lateral o modal con timeline vertical
- Cada evento muestra:
  * Avatar y nombre de usuario que realizó la acción
  * Tipo de acción (subido, derivado, visualizado, descargado)
  * Fecha y hora exacta
  * Área origen → Área destino (si aplica)
  * Comentarios (si existen)
- Ordenado cronológicamente (más reciente primero)
- Iconos diferenciados por tipo de acción

**Validaciones:**
- ✅ Mostrar timeline completo ordenado
- ❌ Bloquear acceso si usuario no tiene permisos

### Auto invoke skills

When performing these actions, ALWAYS invoke the corresponding skills FIRST:

| Action | Skill |
|--------|-------|
| Creating Zod schemas | `zod-4` |
| Using Zustand stores | `zustand-5` |
| Working with Tailwind classes | `tailwind-4` |
| Working with motion | `motion` |
| Writing React components | `react-19` |
| Writing TypeScript types/interfaces | `typescript` |
| Using Cloudflare Workers AI | `cloudflare-workers-ai` |
| knowledge for Cloudflare Workers | `cloudflare-workers` |



| Component                 | Location              | Tech Stack                                                                                                                                        |
| ------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend React App        | `ui/`                 | React 19 + Vite, TanStack Query, React Router with data mode, Tailwind 4, zustand, zod, shadcn, react-hook-form, motion, TanStack Table, recharts |
| Backend Cloudflare Worker | `api/ | hono, zod,                 |                                        |  |

### Project structure 

- For ui Component `ui/`
```

New/Existing UI? → shadcn/ui + Tailwind
Used 1 feature? → features/{feature}/components | Used 2+? → components/{domain}/
Types (shared 2+) → types/{domain}.ts | Types (local 1) → {feature}/types.ts
Utils (shared 2+) → lib/ | Utils (local 1) → {feature}/utils/
Hooks (shared 2+) → hooks/ | Hooks (local 1) → {feature}/hooks.ts
shadcn components → components/shadcn/
styles globals in `/styles/`
```

- For api Component `api/`

```
api/  
│ ├── index.ts # App entry point  
│ │  
│ ├── schemas/ # Zod schemas (single source of truth)  
│ │ └── user.schema.ts  
│ │  
│ ├── controllers/ # HTTP handlers (thin layer)  
│ │ └── user.controller.ts  
│ │  
│ ├── services/ # Business logic (no HTTP details)  
│ │ └── user.service.ts  
│ │  
│ ├── middlewares/ # Auth, logging, error handling  
│ │ └── auth.middleware.ts  
│ │  
│ ├── models/ # Database models/DTOs  
│ │ └── user.model.ts  
│ │  
│ ├── core/ # Utilities and helpers  
│ │ ├── logger.ts  
│ │ ├── mailer.ts  
│ │ └── auth.ts  
│ │  
│ ├── exceptions/ # Custom error classes  
│ │ └── http-exceptions.ts  
│ │  
│ ├── crons/ # Background jobs  
│ │ └── cleanup.cron.ts  
│ │  
│ └── db/ # Database setup  
│ └── index.ts  
│  
└── tests/ # Mirrors api/ structure  
├── controllers/  
├── services/  
└── core/
```

### Project Alias

For references imports use `@/ui` for componente `ui` and use `@/api` for component `api` 

---

## ⚠️ Common Pitfalls & Known Issues

### 1. **Auth State Management - Cache & Listeners**

**CRITICAL:** When working with authentication:

- **ALWAYS clear TanStack Query cache on logout** - Use `queryClient.clear()` in signOut
- **NEVER register listeners without cleanup** - Store Supabase auth subscription and unsubscribe
- **PREVENT double initialization** - Check `isInitialized` before running initialize() (React Strict Mode)

```typescript
// ✅ CORRECT
signOut: async () => {
  await supabase.auth.signOut();
  queryClient.clear(); // Prevents stale cached data
  set({ user: null, session: null, profile: null });
}

// ❌ WRONG - leaves cached queries
signOut: async () => {
  await supabase.auth.signOut();
  set({ user: null, session: null, profile: null });
}
```

### 2. **Motion AnimatePresence - Route Transitions**

**DO NOT use `mode="wait"`** with route transitions - it causes pages to get stuck in loading if animations fail.

```typescript
// ✅ CORRECT - Robust for routing
<AnimatePresence mode="popLayout" initial={false}>
  <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <Outlet />
  </motion.div>
</AnimatePresence>

// ❌ WRONG - Can cause infinite loading
<AnimatePresence mode="wait">
  <motion.div key={location.pathname}>
    <Outlet />
  </motion.div>
</AnimatePresence>
```

### 3. **Protected Routes - Loading States**

**NEVER return `null`** during loading - it confuses AnimatePresence and causes layout shift.

```typescript
// ✅ CORRECT - Consistent UI
if (isLoading) {
  return <div className="min-h-[50vh] flex items-center justify-center">
    <Loader2 className="animate-spin" />
  </div>;
}

// ❌ WRONG - Causes AnimatePresence issues
if (isLoading) {
  return null;
}
```

### 4. **QueryClient Instance**

**ALWAYS export queryClient from a centralized file** (`ui/lib/query-client.ts`) so it can be accessed by stores, hooks, and main.tsx.

```typescript
// ✅ CORRECT - Centralized in ui/lib/query-client.ts
export const queryClient = new QueryClient({ ... });

// Then import in auth.store.ts, main.tsx, etc.
import { queryClient } from "@/ui/lib/query-client";
```

