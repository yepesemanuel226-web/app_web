-- ============================================
-- SCHEMA DE BASE DE DATOS SUPABASE - SGB
-- Sistema de Gestión Bibliotecaria
-- ============================================

-- Eliminar tablas si existen (solo para desarrollo)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS mora_config CASCADE;

-- ============================================
-- TABLA: users (Usuarios del sistema)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    is_blocked BOOLEAN DEFAULT FALSE,
    registration_date TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- TABLA: books (Catálogo de libros)
-- ============================================
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    publisher VARCHAR(255),
    publication_year INTEGER,
    pages INTEGER,
    language VARCHAR(50) DEFAULT 'Español',

    -- Inventario
    stock_loan INTEGER DEFAULT 0, -- Stock disponible para préstamo
    stock_sale INTEGER DEFAULT 0, -- Stock disponible para venta

    -- Precios
    sale_price DECIMAL(10, 2), -- Precio de venta (puede ser NULL si no está en venta)

    -- URL de la imagen de portada
    cover_image_url TEXT, -- 🖼️ AQUÍ VA LA URL DE LA IMAGEN DE PORTADA DEL LIBRO

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_active ON books(is_active);

-- ============================================
-- TABLA: loans (Préstamos de libros)
-- ============================================
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Tipo de préstamo
    loan_type VARCHAR(20) NOT NULL CHECK (loan_type IN ('express', 'weekly', 'monthly')),

    -- Fechas
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE, -- NULL mientras no se haya devuelto

    -- Estado
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'overdue', 'returned')),

    -- Mora
    days_overdue INTEGER DEFAULT 0,
    mora_amount DECIMAL(10, 2) DEFAULT 0,
    mora_paid BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_book ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_due_date ON loans(due_date);

-- ============================================
-- TABLA: reservations (Reservas de libros)
-- ============================================
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Estado de la reserva
    status VARCHAR(20) NOT NULL CHECK (status IN ('waiting', 'available', 'completed', 'cancelled')),

    -- Posición en la cola
    queue_position INTEGER,

    -- Fechas
    reserved_date TIMESTAMP DEFAULT NOW(),
    available_until DATE, -- Fecha límite para recoger si está disponible
    completed_date TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_book ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- ============================================
-- TABLA: sales (Ventas de libros)
-- ============================================
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Detalles de la venta
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Información de entrega
    delivery_name VARCHAR(255) NOT NULL,
    delivery_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,

    -- Método de pago
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'tarjeta')),

    -- Estado
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),

    -- Fechas
    sale_date TIMESTAMP DEFAULT NOW(),
    delivery_date TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_book ON sales(book_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_status ON sales(status);

-- ============================================
-- TABLA: notifications (Notificaciones)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Tipo de notificación
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'danger', 'success')),

    -- Contenido
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Estado
    is_read BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================
-- TABLA: mora_config (Configuración de mora)
-- ============================================
CREATE TABLE mora_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_rate DECIMAL(10, 2) NOT NULL DEFAULT 2000, -- Tarifa diaria de mora
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO mora_config (daily_rate) VALUES (2000);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular mora automáticamente
CREATE OR REPLACE FUNCTION calculate_mora()
RETURNS TRIGGER AS $$
DECLARE
    daily_rate DECIMAL(10, 2);
BEGIN
    -- Obtener la tarifa diaria
    SELECT mora_config.daily_rate INTO daily_rate FROM mora_config LIMIT 1;

    -- Si el préstamo está vencido y no ha sido devuelto
    IF NEW.due_date < CURRENT_DATE AND NEW.return_date IS NULL THEN
        NEW.status = 'overdue';
        NEW.days_overdue = CURRENT_DATE - NEW.due_date;
        NEW.mora_amount = NEW.days_overdue * daily_rate;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular mora
CREATE TRIGGER calculate_loan_mora BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION calculate_mora();

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mora_config ENABLE ROW LEVEL SECURITY;

-- Políticas para users (los usuarios solo pueden ver/editar su propia información)
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para books (todos pueden ver, solo admins pueden modificar)
CREATE POLICY "Anyone can view active books" ON books
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage books" ON books
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para loans
CREATE POLICY "Users can view their own loans" ON loans
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all loans" ON loans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para reservations
CREATE POLICY "Users can view their own reservations" ON reservations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all reservations" ON reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para sales
CREATE POLICY "Users can view their own sales" ON sales
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sales" ON sales
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Políticas para mora_config
CREATE POLICY "Anyone can view mora config" ON mora_config
    FOR SELECT USING (true);

CREATE POLICY "Admins can update mora config" ON mora_config
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );
