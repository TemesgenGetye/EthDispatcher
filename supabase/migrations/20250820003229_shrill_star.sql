/*
  # Seed Initial Data

  1. Sample Data
    - Create sample admin user
    - Create sample drivers
    - Create sample suppliers
    - Create sample orders with proper relationships

  2. Test Data
    - Realistic data for testing the application
    - Proper relationships between entities
    - Various order statuses and priorities
*/

-- Insert sample admin user
INSERT INTO users (id, role, full_name, email, phone, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin', 'Michael Gardner', 'admin@dispatch.com', '+1-555-0001', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample drivers
INSERT INTO users (id, role, full_name, email, phone, vehicle_info, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'driver', 'Derrick Green', 'derrick@dispatch.com', '+1-555-0101', '{"vehicle_type": "van", "license_plate": "DRV-001", "capacity_kg": 1000}', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'driver', 'Christopher Norton', 'christopher@dispatch.com', '+1-555-0102', '{"vehicle_type": "truck", "license_plate": "DRV-002", "capacity_kg": 2000}', 'break'),
('550e8400-e29b-41d4-a716-446655440003', 'driver', 'Luke Goodwin', 'luke@dispatch.com', '+1-555-0103', '{"vehicle_type": "van", "license_plate": "DRV-003", "capacity_kg": 1200}', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'driver', 'Jerry Gomez', 'jerry@dispatch.com', '+1-555-0104', '{"vehicle_type": "motorcycle", "license_plate": "DRV-004", "capacity_kg": 50}', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'driver', 'Nathaniel Parker', 'nathaniel@dispatch.com', '+1-555-0105', '{"vehicle_type": "truck", "license_plate": "DRV-005", "capacity_kg": 3000}', 'inactive')
ON CONFLICT (email) DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (id, name, contact_name, phone, email, address, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'TechCorp Solutions', 'Sarah Johnson', '+1-555-0201', 'orders@techcorp.com', '123 Tech Street, Business District', 'active'),
('660e8400-e29b-41d4-a716-446655440002', 'Global Retail Inc', 'Mark Wilson', '+1-555-0202', 'supply@globalretail.com', '456 Retail Ave, Mall Plaza', 'active'),
('660e8400-e29b-41d4-a716-446655440003', 'MedSupply Co', 'Dr. Emily Chen', '+1-555-0203', 'urgent@medsupply.com', '789 Medical Way, Health District', 'active'),
('660e8400-e29b-41d4-a716-446655440004', 'Office Supplies Plus', 'Robert Davis', '+1-555-0204', 'orders@officesupplies.com', '321 Office Blvd, Corporate Tower', 'active'),
('660e8400-e29b-41d4-a716-446655440005', 'Restaurant Chain Ltd', 'Maria Rodriguez', '+1-555-0205', 'supply@restaurantchain.com', '654 Food Street, Culinary District', 'active'),
('660e8400-e29b-41d4-a716-446655440006', 'Fashion Boutique', 'Lisa Thompson', '+1-555-0206', 'orders@fashionboutique.com', '987 Fashion Ave, Shopping Center', 'inactive'),
('660e8400-e29b-41d4-a716-446655440007', 'Auto Parts Direct', 'James Miller', '+1-555-0207', 'parts@autopartsdirect.com', '147 Auto Lane, Industrial Zone', 'pending')
ON CONFLICT (email) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (id, serial_number, supplier_id, driver_id, customer_name, customer_phone, pickup_address, delivery_address, price, items_count, weight_kg, distance_km, order_date, delivery_date, estimated_time, status, priority, notes) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'ORD-2024-001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'TechCorp Solutions', '+1-555-1001', 'Warehouse A, Downtown', 'TechCorp HQ, Business District', 2450.00, 12, 45.0, 12.5, '2024-03-28', '2024-03-28', '10:30:00', 'delivered', 'high', 'Urgent delivery for client presentation'),
('770e8400-e29b-41d4-a716-446655440002', 'ORD-2024-002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Global Retail Inc', '+1-555-1002', 'Distribution Center B', 'Store #245, Mall Plaza', 1890.00, 8, 32.0, 8.3, '2024-03-28', '2024-03-28', '14:15:00', 'out_for_delivery', 'medium', 'Standard retail delivery'),
('770e8400-e29b-41d4-a716-446655440003', 'ORD-2024-003', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'MedSupply Co', '+1-555-1003', 'Medical Warehouse', 'City Hospital, Emergency Wing', 3200.00, 5, 18.0, 15.2, '2024-03-28', '2024-03-28', '11:45:00', 'assigned', 'high', 'Emergency medical supplies - handle with care'),
('770e8400-e29b-41d4-a716-446655440004', 'ORD-2024-004', '660e8400-e29b-41d4-a716-446655440004', NULL, 'Office Supplies Plus', '+1-555-1004', 'Central Depot', 'Corporate Tower, Floor 15', 890.00, 15, 28.0, 6.7, '2024-03-28', '2024-03-29', '16:30:00', 'pending', 'low', 'Regular office supply delivery'),
('770e8400-e29b-41d4-a716-446655440005', 'ORD-2024-005', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'Restaurant Chain Ltd', '+1-555-1005', 'Food Distribution Hub', 'Restaurant #12, Main Street', 1560.00, 20, 55.0, 9.8, '2024-03-28', '2024-03-28', '13:00:00', 'assigned', 'medium', 'Fresh food delivery - temperature controlled'),
('770e8400-e29b-41d4-a716-446655440006', 'ORD-2024-006', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Electronics Store', '+1-555-1006', 'Tech Warehouse', 'Electronics Store, Shopping Center', 4200.00, 6, 22.0, 11.4, '2024-03-27', '2024-03-27', '15:45:00', 'delivered', 'high', 'High-value electronics - signature required'),
('770e8400-e29b-41d4-a716-446655440007', 'ORD-2024-007', '660e8400-e29b-41d4-a716-446655440006', NULL, 'Fashion Boutique', '+1-555-1007', 'Textile Center', 'Fashion Boutique, Downtown', 750.00, 10, 15.0, 7.2, '2024-03-27', NULL, '17:00:00', 'cancelled', 'low', 'Order cancelled by customer'),
('770e8400-e29b-41d4-a716-446655440008', 'ORD-2024-008', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Pharmacy Network', '+1-555-1008', 'Pharma Distribution', 'Pharmacy #8, Suburb Area', 2100.00, 25, 38.0, 13.6, '2024-03-27', '2024-03-27', '09:30:00', 'delivered', 'medium', 'Prescription medications - secure delivery')
ON CONFLICT (serial_number, order_date) DO NOTHING;

-- Insert sample financial records
INSERT INTO financial_records (order_id, driver_id, transaction_type, amount, description, transaction_date) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'payment', 50.00, 'Delivery payment for ORD-2024-001', '2024-03-28'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'payment', 75.00, 'Delivery payment for ORD-2024-006', '2024-03-27'),
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'payment', 45.00, 'Delivery payment for ORD-2024-008', '2024-03-27'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'expense', 25.00, 'Fuel expense for delivery route', '2024-03-28')
ON CONFLICT DO NOTHING;

-- Insert sample returns
INSERT INTO returns (order_id, driver_id, return_to, reason, return_date) VALUES
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Customer cancelled order', '2024-03-27')
ON CONFLICT DO NOTHING;