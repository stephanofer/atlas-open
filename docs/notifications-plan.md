# Plan: Sistema de Notificaciones In-App

## Objetivo

Notificar a un usuario cuando se le asigna un documento, ya sea por:
1. **Subida directa** - Alguien sube un documento y lo asigna a un usuario
2. **Derivación** - Alguien deriva un documento hacia un usuario

Nada más. Sin emails, sin push notifications, sin complejidad innecesaria.

---

## Arquitectura

```
[Upload/Derive] 
    → INSERT en tabla `notifications` (desde el frontend, igual que document_history)
    → Supabase Realtime detecta el INSERT
    → El usuario receptor ve la notificación en tiempo real (campana en sidebar)
```

**Por qué este enfoque:**
- Ya tenemos el patrón de INSERT directo desde el frontend (lo usamos para `document_history`)
- Supabase Realtime ya está incluido, solo hay que suscribirse
- Cero infraestructura adicional, cero API endpoints nuevos
- RLS protege que solo veas notificaciones de tu empresa

---

## 1. Base de Datos

### Nueva tabla: `notifications`

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    triggered_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('assigned', 'derived')),
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_company ON notifications(company_id);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Solo puedes ver tus propias notificaciones
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (recipient_id = auth.uid() AND company_id = get_user_company_id());

-- Usuarios activos pueden crear notificaciones en su empresa
CREATE POLICY "Active users can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        company_id = get_user_company_id()
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND status = 'active'
        )
    );

-- Solo puedes actualizar tus propias notificaciones (marcar como leída)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- Solo puedes eliminar tus propias notificaciones
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (recipient_id = auth.uid());
```

### Habilitar Realtime

En el dashboard de Supabase > Database > Replication:
- Agregar la tabla `notifications` a la publicación de Realtime
- O ejecutar: `ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`

---

## 2. Frontend - Archivos a crear/modificar

### Archivos nuevos

| Archivo | Propósito |
|---------|-----------|
| `ui/hooks/use-notifications.ts` | Hook con TanStack Query + Realtime subscription |
| `ui/features/notifications/components/notification-bell.tsx` | Campana con badge de contador en el sidebar |
| `ui/features/notifications/components/notification-list.tsx` | Lista desplegable de notificaciones |
| `ui/features/notifications/index.ts` | Re-exports |
| `ui/types/database.ts` | Agregar tipos de la tabla `notifications` |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `ui/hooks/use-documents.ts` | En `useUploadDocument` y `useDeriveDocument`, agregar INSERT a `notifications` cuando hay `current_user_id` |
| `ui/components/dashboard/app-sidebar.tsx` | Agregar `NotificationBell` al header del sidebar |

---

## 3. Flujo detallado

### 3.1 Crear notificación (al subir/derivar)

En `useUploadDocument` y `useDeriveDocument`, después de crear el document_history, si hay un `current_user_id` (usuario destinatario) Y ese usuario no es el mismo que está realizando la acción:

```typescript
// Solo notificar si hay destinatario y no es uno mismo
if (targetUserId && targetUserId !== currentUserId) {
    await supabase.from("notifications").insert({
        company_id: companyId,
        recipient_id: targetUserId,
        document_id: documentId,
        triggered_by: currentUserId,
        type: "assigned", // o "derived"
        title: documentTitle,
        message: `Te han asignado el documento "${documentTitle}"`,
    });
}
```

### 3.2 Hook `useNotifications`

```
- useQuery para cargar notificaciones iniciales (las últimas 50, no leídas primero)
- useEffect con Supabase Realtime para escuchar INSERTs nuevos
  → Al recibir INSERT, invalidar query + mostrar toast
- useMutation para marcar como leída (UPDATE is_read = true)
- useMutation para marcar todas como leídas
- Computed: unreadCount
```

### 3.3 UI - NotificationBell

Ubicación: Header del sidebar (junto al nombre del usuario)

```
[Campana con badge rojo si hay no-leídas]
  → Click abre Popover/DropdownMenu
    → Lista de notificaciones recientes
    → Cada item: avatar de quien envió, título del doc, tiempo relativo
    → Click en notificación → navega al documento + marca como leída
    → Botón "Marcar todas como leídas"
```

Diseño simple, usando componentes de shadcn existentes:
- `Popover` o `DropdownMenu` para el desplegable
- `Badge` para el contador
- `ScrollArea` para la lista
- `Button` para acciones
- Animaciones sutiles con `motion` (entrada de items, badge pulse)

---

## 4. Consideraciones

### Performance
- Index compuesto en `(recipient_id, is_read, created_at DESC)` para queries rápidas
- Limitar a últimas 50 notificaciones en la query inicial
- Realtime solo escucha INSERTs filtrados por `recipient_id = user.id`

### Seguridad
- RLS asegura que solo veas tus notificaciones
- RLS asegura que solo usuarios activos de la misma empresa puedan crear
- No se puede marcar como leída la notificación de otro usuario

### Limpieza futura (no en esta iteración)
- Cron job para limpiar notificaciones >30 días
- Paginación si el usuario acumula muchas

---

## 5. Orden de implementación

1. Crear tabla + RLS + Realtime en Supabase (SQL manual en dashboard)
2. Actualizar tipos en `database.ts`
3. Crear `use-notifications.ts` hook
4. Crear componentes `NotificationBell` + `NotificationList`
5. Modificar `app-sidebar.tsx` para incluir la campana
6. Modificar `useUploadDocument` para crear notificación
7. Modificar `useDeriveDocument` para crear notificación
8. Probar flujo completo
