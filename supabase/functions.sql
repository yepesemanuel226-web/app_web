-- ============================================
-- FUNCIONES ADICIONALES PARA SUPABASE
-- ============================================

-- Función para decrementar stock de préstamo
CREATE OR REPLACE FUNCTION decrement_book_stock(book_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE books
    SET stock_loan = stock_loan - 1
    WHERE id = book_id AND stock_loan > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar stock de préstamo (cuando se devuelve)
CREATE OR REPLACE FUNCTION increment_book_stock(book_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE books
    SET stock_loan = stock_loan + 1
    WHERE id = book_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para decrementar stock de venta
CREATE OR REPLACE FUNCTION decrement_sale_stock(book_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE books
    SET stock_sale = stock_sale - quantity
    WHERE id = book_id AND stock_sale >= quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas del dashboard de usuario
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'active_loans', (
            SELECT COUNT(*)
            FROM loans
            WHERE user_id = p_user_id AND status = 'active'
        ),
        'pending_reservations', (
            SELECT COUNT(*)
            FROM reservations
            WHERE user_id = p_user_id AND status IN ('waiting', 'available')
        ),
        'overdue_loans', (
            SELECT COUNT(*)
            FROM loans
            WHERE user_id = p_user_id AND status = 'overdue'
        ),
        'total_mora', (
            SELECT COALESCE(SUM(mora_amount), 0)
            FROM loans
            WHERE user_id = p_user_id AND status = 'overdue' AND NOT mora_paid
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas del dashboard de admin
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_active_loans', (SELECT COUNT(*) FROM loans WHERE status = 'active'),
        'total_overdue_loans', (SELECT COUNT(*) FROM loans WHERE status = 'overdue'),
        'total_books', (SELECT COUNT(*) FROM books WHERE is_active = true),
        'total_sales_this_month', (
            SELECT COUNT(*)
            FROM sales
            WHERE DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', CURRENT_DATE)
        ),
        'pending_reservations', (SELECT COUNT(*) FROM reservations WHERE status = 'waiting'),
        'total_users', (SELECT COUNT(*) FROM users WHERE role = 'user')
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar posiciones en la cola de reservas
CREATE OR REPLACE FUNCTION update_reservation_queue(p_book_id UUID)
RETURNS VOID AS $$
DECLARE
    reservation_record RECORD;
    position INTEGER := 1;
BEGIN
    FOR reservation_record IN
        SELECT id
        FROM reservations
        WHERE book_id = p_book_id AND status = 'waiting'
        ORDER BY reserved_date ASC
    LOOP
        UPDATE reservations
        SET queue_position = position
        WHERE id = reservation_record.id;

        position := position + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar la cola cuando se crea una nueva reserva
CREATE OR REPLACE FUNCTION trigger_update_queue()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_reservation_queue(NEW.book_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_reservation_insert ON reservations;
CREATE TRIGGER after_reservation_insert
AFTER INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION trigger_update_queue();

-- Función para procesar devolución de libro
CREATE OR REPLACE FUNCTION process_book_return(p_loan_id UUID)
RETURNS JSON AS $$
DECLARE
    loan_record RECORD;
    result JSON;
BEGIN
    -- Obtener información del préstamo
    SELECT * INTO loan_record
    FROM loans
    WHERE id = p_loan_id;

    -- Actualizar el préstamo
    UPDATE loans
    SET
        return_date = CURRENT_DATE,
        status = 'returned'
    WHERE id = p_loan_id;

    -- Incrementar el stock del libro
    PERFORM increment_book_stock(loan_record.book_id);

    -- Construir resultado
    SELECT json_build_object(
        'success', true,
        'mora_amount', loan_record.mora_amount,
        'book_returned', true
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
