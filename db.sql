-- =====================================================
-- ATLAS - Sistema de Gestión Documental
-- Base de Datos Completa para Supabase
-- Versión: 2.0 - Incluye Storage Policies y Avatares
-- =====================================================

-- =====================================================
-- 1. TIPOS ENUM
-- =====================================================
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'user');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE document_status AS ENUM ('pending', 'in_progress', 'derived', 'completed', 'archived');
CREATE TYPE history_action_type AS ENUM ('uploaded', 'viewed', 'downloaded', 'derived', 'status_changed');

-- =====================================================
-- 2. TABLA: companies (Empresas)
-- =====================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name);

-- =====================================================
-- 3. TABLA: profiles (Perfiles de usuarios)
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,  -- URL del avatar en Storage
    role user_role NOT NULL DEFAULT 'user',
    position VARCHAR(100),
    area_id UUID,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_area_id ON profiles(area_id);

-- =====================================================
-- 4. TABLA: areas (Departamentos)
-- =====================================================
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_area_name_per_company UNIQUE (company_id, name)
);

CREATE INDEX idx_areas_company_id ON areas(company_id);

-- Agregar FK de profiles.area_id después de crear areas
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_area 
FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL;

-- =====================================================
-- 5. TABLA: categories (Categorías de documentos)
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_category_name_per_company UNIQUE (company_id, name)
);

CREATE INDEX idx_categories_company_id ON categories(company_id);

-- =====================================================
-- 6. TABLA: documents (Documentos)
-- =====================================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status document_status NOT NULL DEFAULT 'pending',
    current_area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    current_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_category_id ON documents(category_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_current_area_id ON documents(current_area_id);
CREATE INDEX idx_documents_current_user_id ON documents(current_user_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- =====================================================
-- 7. TABLA: document_history (Historial de documentos)
-- =====================================================
CREATE TABLE document_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    action_type history_action_type NOT NULL,
    performed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    from_area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    to_area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_history_document_id ON document_history(document_id);
CREATE INDEX idx_document_history_company_id ON document_history(company_id);
CREATE INDEX idx_document_history_performed_by ON document_history(performed_by);
CREATE INDEX idx_document_history_action_type ON document_history(action_type);
CREATE INDEX idx_document_history_created_at ON document_history(created_at DESC);

-- =====================================================
-- 8. FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at
    BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. FUNCIÓN: Obtener company_id del usuario actual
-- NOTA: Usa SECURITY DEFINER para bypassear RLS y evitar dependencia circular
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
BEGIN
    SELECT company_id INTO v_company_id
    FROM profiles 
    WHERE id = auth.uid();
    
    RETURN v_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 10. FUNCIÓN: Verificar si el usuario es admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    SELECT (role = 'admin') INTO v_is_admin
    FROM profiles 
    WHERE id = auth.uid() AND status = 'active';
    
    RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 11. FUNCIÓN: Crear categorías por defecto
-- =====================================================
CREATE OR REPLACE FUNCTION create_default_categories(p_company_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO categories (company_id, name, description, is_default)
    VALUES 
        (p_company_id, 'Factura', 'Facturas y comprobantes de pago', TRUE),
        (p_company_id, 'Orden de compra', 'Órdenes de compra y pedidos', TRUE),
        (p_company_id, 'Contrato', 'Contratos y acuerdos legales', TRUE),
        (p_company_id, 'Reporte', 'Reportes e informes', TRUE),
        (p_company_id, 'Otro', 'Otros documentos', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 12. FUNCIÓN: Registrar nueva cuenta (company + profile + categories)
-- NOTA: Esta función bypasea RLS para permitir el registro inicial
-- =====================================================
CREATE OR REPLACE FUNCTION register_new_account(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT,
    p_company_name TEXT
)
RETURNS JSON AS $$
DECLARE
    v_company_id UUID;
    v_result JSON;
BEGIN
    -- 1. Crear la empresa
    INSERT INTO companies (name)
    VALUES (p_company_name)
    RETURNING id INTO v_company_id;

    -- 2. Crear el perfil del admin
    INSERT INTO profiles (id, company_id, email, full_name, role, status)
    VALUES (p_user_id, v_company_id, p_email, p_full_name, 'admin', 'active');

    -- 3. Crear categorías por defecto
    PERFORM create_default_categories(v_company_id);

    -- 4. Retornar el resultado
    SELECT json_build_object(
        'company_id', v_company_id,
        'success', true
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_history ENABLE ROW LEVEL SECURITY;

-- ----- COMPANIES -----
CREATE POLICY "Users can view own company"
    ON companies FOR SELECT
    USING (id = get_user_company_id());

CREATE POLICY "Anyone can insert companies"
    ON companies FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Admins can update own company"
    ON companies FOR UPDATE
    USING (id = get_user_company_id() AND is_user_admin());

-- ----- PROFILES -----
-- IMPORTANTE: id = auth.uid() va PRIMERO para evitar dependencia circular
CREATE POLICY "Users can view own profile and profiles in company"
    ON profiles FOR SELECT
    USING (
        id = auth.uid()
        OR company_id = get_user_company_id()
    );

CREATE POLICY "Anyone can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (TRUE);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- Admins pueden actualizar cualquier perfil de su empresa
CREATE POLICY "Admins can update profiles in own company"
    ON profiles FOR UPDATE
    USING (company_id = get_user_company_id() AND is_user_admin());

CREATE POLICY "Admins can delete profiles in own company"
    ON profiles FOR DELETE
    USING (
        company_id = get_user_company_id() 
        AND is_user_admin()
        AND id != auth.uid()
    );

-- ----- AREAS -----
CREATE POLICY "Users can view areas in own company"
    ON areas FOR SELECT
    USING (company_id = get_user_company_id());

CREATE POLICY "Admins can insert areas"
    ON areas FOR INSERT
    WITH CHECK (company_id = get_user_company_id() AND is_user_admin());

CREATE POLICY "Admins can update areas in own company"
    ON areas FOR UPDATE
    USING (company_id = get_user_company_id() AND is_user_admin());

CREATE POLICY "Admins can delete areas in own company"
    ON areas FOR DELETE
    USING (company_id = get_user_company_id() AND is_user_admin());

-- ----- CATEGORIES -----
CREATE POLICY "Users can view categories in own company"
    ON categories FOR SELECT
    USING (company_id = get_user_company_id());

CREATE POLICY "Admins can insert categories"
    ON categories FOR INSERT
    WITH CHECK (company_id = get_user_company_id() AND is_user_admin());

CREATE POLICY "Admins can update categories in own company"
    ON categories FOR UPDATE
    USING (company_id = get_user_company_id() AND is_user_admin());

CREATE POLICY "Admins can delete categories in own company"
    ON categories FOR DELETE
    USING (company_id = get_user_company_id() AND is_user_admin());

-- ----- DOCUMENTS -----
CREATE POLICY "Users can view documents based on role"
    ON documents FOR SELECT
    USING (
        company_id = get_user_company_id()
        AND (
            -- Admins and supervisors see all documents in their company
            is_user_admin()
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'supervisor'
            )
            -- Regular users see documents in their area, assigned to them, or uploaded by them
            OR current_area_id = (SELECT area_id FROM profiles WHERE id = auth.uid())
            OR current_user_id = auth.uid()
            OR uploaded_by = auth.uid()
        )
    );

CREATE POLICY "Active users can insert documents"
    ON documents FOR INSERT
    WITH CHECK (
        company_id = get_user_company_id()
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND status = 'active'
        )
    );

CREATE POLICY "Users can update assigned documents"
    ON documents FOR UPDATE
    USING (
        company_id = get_user_company_id()
        AND (
            current_user_id = auth.uid()
            OR uploaded_by = auth.uid()
            OR is_user_admin()
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'supervisor'
            )
        )
    );

CREATE POLICY "Admins and uploaders can delete documents"
    ON documents FOR DELETE
    USING (
        company_id = get_user_company_id()
        AND (
            is_user_admin()
            OR uploaded_by = auth.uid()
        )
    );

-- ----- DOCUMENT_HISTORY -----
CREATE POLICY "Users can view document history in own company"
    ON document_history FOR SELECT
    USING (company_id = get_user_company_id());

CREATE POLICY "Active users can insert document history"
    ON document_history FOR INSERT
    WITH CHECK (
        company_id = get_user_company_id()
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND status = 'active'
        )
    );

-- =====================================================
-- 13. STORAGE BUCKETS
-- =====================================================

-- Crear bucket para documentos (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    FALSE,
    52428800, -- 50MB
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/webp']
);

-- Crear bucket para avatares (público para fácil acceso)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    TRUE,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- =====================================================
-- 14. STORAGE POLICIES - DOCUMENTS BUCKET
-- =====================================================

-- SELECT: usuarios pueden ver archivos de su empresa
CREATE POLICY "Users can view own company documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = get_user_company_id()::text
);

-- INSERT: usuarios activos pueden subir a su carpeta de empresa
CREATE POLICY "Active users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = get_user_company_id()::text
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND status = 'active'
    )
);

-- UPDATE: usuarios pueden actualizar sus propios archivos
CREATE POLICY "Users can update own company documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = get_user_company_id()::text
);

-- DELETE: solo admins pueden eliminar archivos
CREATE POLICY "Admins can delete company documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = get_user_company_id()::text
    AND is_user_admin()
);

-- =====================================================
-- 15. STORAGE POLICIES - AVATARS BUCKET
-- Ruta esperada: avatars/{user_id}/avatar.{ext}
-- =====================================================

-- SELECT: cualquiera puede ver avatares (bucket público)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- INSERT: usuarios autenticados pueden subir su propio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: usuarios pueden actualizar su propio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: usuarios pueden eliminar su propio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
