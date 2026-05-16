-- ============================================
-- DATOS DE EJEMPLO (SEED DATA)
-- Sistema de Gestión Bibliotecaria
-- ============================================

-- ============================================
-- USUARIOS DE PRUEBA
-- ============================================
-- Nota: En producción, las contraseñas deben estar hasheadas con bcrypt
-- Contraseñas de ejemplo (sin hashear para referencia):
-- admin@edu.co -> admin123
-- usuario@gmail.com -> usuario123

INSERT INTO users (id, email, password_hash, name, role, phone, address, city, registration_date) VALUES
-- ADMINISTRADOR
('550e8400-e29b-41d4-a716-446655440001', 'admin@edu.co', '$2a$10$rCDLq8qfX/C4Y.5R/Z8Rb.YxN3Xw.nYqZUPpC2/WJKGYvjHVKUq1O', 'Administrador SGB', 'admin', '300 123 4567', 'Calle 123 #45-67', 'Bogotá', '2024-01-15 10:00:00'),

-- USUARIOS NORMALES
('550e8400-e29b-41d4-a716-446655440002', 'usuario@gmail.com', '$2a$10$rCDLq8qfX/C4Y.5R/Z8Rb.YxN3Xw.nYqZUPpC2/WJKGYvjHVKUq1O', 'María González', 'user', '301 234 5678', 'Carrera 7 #12-34', 'Bogotá', '2025-01-15 11:00:00'),
('550e8400-e29b-41d4-a716-446655440003', 'juan.perez@hotmail.com', '$2a$10$rCDLq8qfX/C4Y.5R/Z8Rb.YxN3Xw.nYqZUPpC2/WJKGYvjHVKUq1O', 'Juan Pérez', 'user', '302 345 6789', 'Avenida 19 #100-50', 'Medellín', '2025-02-20 14:30:00'),
('550e8400-e29b-41d4-a716-446655440004', 'carlos.lopez@yahoo.com', '$2a$10$rCDLq8qfX/C4Y.5R/Z8Rb.YxN3Xw.nYqZUPpC2/WJKGYvjHVKUq1O', 'Carlos López', 'user', '303 456 7890', 'Calle 50 #22-10', 'Cali', '2024-11-10 09:00:00'),
('550e8400-e29b-41d4-a716-446655440005', 'ana.martinez@gmail.com', '$2a$10$rCDLq8qfX/C4Y.5R/Z8Rb.YxN3Xw.nYqZUPpC2/WJKGYvjHVKUq1O', 'Ana Martínez', 'user', '304 567 8901', 'Transversal 30 #45-12', 'Barranquilla', '2025-03-05 16:45:00'),
('550e8400-e29b-41d4-a716-446655440006', 'laura.ruiz@outlook.com', '$2a$10$rCDLq8qfX/C4Y.5R/Z8Rb.YxN3Xw.nYqZUPpC2/WJKGYvjHVKUq1O', 'Laura Ruiz', 'user', '305 678 9012', 'Diagonal 80 #5-30', 'Cartagena', '2024-12-01 12:00:00'),
('550e8400-e29b-41d4-a716-446655440007', 'pedro.gomez@gmail.com', '$2a$10$rCDLq8qfX/C4Y.5R/Z8Rb.YxN3Xw.nYqZUPpC2/WJKGYvjHVKUq1O', 'Pedro Gómez', 'user', '306 789 0123', 'Calle 100 #15-45', 'Bucaramanga', '2025-04-12 08:30:00');

-- ============================================
-- LIBROS DE EJEMPLO
-- ============================================
INSERT INTO books (id, title, author, isbn, category, description, publisher, publication_year, pages, stock_loan, stock_sale, sale_price, cover_image_url) VALUES

('650e8400-e29b-41d4-a716-446655440001',
 'Cien años de soledad',
 'Gabriel García Márquez',
 '978-0-307-47472-8',
 'Ficción',
 'Una obra maestra de la literatura latinoamericana que narra la saga de la familia Buendía en el pueblo ficticio de Macondo, explorando temas de soledad, amor, poder y el paso del tiempo a través de múltiples generaciones.',
 'Editorial Sudamericana',
 1967,
 417,
 5,
 8,
 45000,
 NULL  -- 🖼️ AQUÍ IRÍA LA URL DE LA IMAGEN: 'https://tu-bucket.supabase.co/storage/v1/object/public/book-covers/cien-anos-soledad.jpg'
),

('650e8400-e29b-41d4-a716-446655440002',
 '1984',
 'George Orwell',
 '978-0-451-52493-5',
 'Ficción',
 'Una distopía que presenta un futuro totalitario donde el Gran Hermano todo lo ve. Una advertencia sobre los peligros del totalitarismo y la manipulación de la verdad.',
 'Secker & Warburg',
 1949,
 328,
 3,
 0,
 NULL,
 NULL  -- 🖼️ AQUÍ IRÍA LA URL DE LA IMAGEN
),

('650e8400-e29b-41d4-a716-446655440003',
 'Don Quijote de la Mancha',
 'Miguel de Cervantes',
 '978-0-06-093434-7',
 'Clásicos',
 'La obra cumbre de la literatura española que narra las aventuras de un hidalgo que pierde la razón y se lanza como caballero andante. Una sátira ingeniosa sobre los libros de caballerías.',
 'Francisco de Robles',
 1605,
 863,
 4,
 6,
 38000,
 NULL  -- 🖼️ AQUÍ IRÍA LA URL DE LA IMAGEN
),

('650e8400-e29b-41d4-a716-446655440004',
 'El principito',
 'Antoine de Saint-Exupéry',
 '978-0-15-601219-5',
 'Infantil',
 'Un cuento poético que relata las aventuras de un pequeño príncipe que viaja por el universo. Una obra filosófica sobre el amor, la amistad y el sentido de la vida.',
 'Reynal & Hitchcock',
 1943,
 96,
 7,
 12,
 25000,
 NULL  -- 🖼️ AQUÍ IRÍA LA URL DE LA IMAGEN
),

('650e8400-e29b-41d4-a716-446655440005',
 'Rayuela',
 'Julio Cortázar',
 '978-0-394-75284-6',
 'Ficción',
 'Una novela experimental que puede leerse de múltiples formas. Cuenta la historia de Horacio Oliveira y su búsqueda existencial entre París y Buenos Aires.',
 'Editorial Sudamericana',
 1963,
 600,
 2,
 0,
 NULL,
 NULL  -- 🖼️ AQUÍ IRÍA LA URL DE LA IMAGEN
),

('650e8400-e29b-41d4-a716-446655440006',
 'La casa de los espíritus',
 'Isabel Allende',
 '978-1-501-11705-8',
 'Ficción',
 'La saga de la familia Trueba a través de cuatro generaciones, mezclando realismo mágico con la historia política de Chile. Una historia de amor, poder y revolución.',
 'Plaza & Janés',
 1982,
 448,
 6,
 5,
 42000,
 NULL  -- 🖼️ AQUÍ IRÍA LA URL DE LA IMAGEN
);

-- ============================================
-- PRÉSTAMOS DE EJEMPLO
-- ============================================
INSERT INTO loans (user_id, book_id, loan_type, start_date, due_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'weekly', '2026-05-01', '2026-05-15', 'active'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'express', '2026-05-05', '2026-05-12', 'active'),
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 'monthly', '2026-04-01', '2026-05-01', 'overdue');

-- ============================================
-- RESERVAS DE EJEMPLO
-- ============================================
INSERT INTO reservations (user_id, book_id, status, queue_position, reserved_date) VALUES
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440006', 'available', NULL, '2026-05-05 10:00:00'),
('550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 'waiting', 1, '2026-05-07 14:30:00');

-- ============================================
-- VENTAS DE EJEMPLO
-- ============================================
INSERT INTO sales (user_id, book_id, quantity, unit_price, total_amount, delivery_name, delivery_phone, delivery_address, delivery_city, payment_method, status) VALUES
('550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 1, 38000, 38000, 'Ana Martínez', '304 567 8901', 'Transversal 30 #45-12', 'Barranquilla', 'efectivo', 'confirmed'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 2, 25000, 50000, 'María González', '301 234 5678', 'Carrera 7 #12-34', 'Bogotá', 'transferencia', 'delivered');

-- ============================================
-- NOTIFICACIONES DE EJEMPLO
-- ============================================
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'warning', 'Préstamo próximo a vencer', 'El libro "Cien años de soledad" vence en 3 días (15 de Mayo)', false),
('550e8400-e29b-41d4-a716-446655440004', 'danger', 'Mora activa', 'Tienes una mora de $14.000 por el libro "1984". Por favor, realiza la devolución.', false),
('550e8400-e29b-41d4-a716-446655440002', 'success', 'Reserva disponible', 'El libro "La casa de los espíritus" está disponible para recoger. Tienes hasta el 12 de Mayo.', false);
