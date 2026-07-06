-- Limpiar
DELETE FROM service_requests;
DELETE FROM service_request_items;
DELETE FROM services;
DELETE FROM service_categories;

-- Insertar Categorías
INSERT INTO service_categories (id, name, slug, description, sort_order, created_at) VALUES 
('cat-1', 'Enfermería General', 'enfermeria-general', 'Servicios básicos de enfermería a domicilio.', 1, NOW()),
('cat-2', 'Cuidados Especiales', 'cuidados-especiales', 'Cuidado prolongado y atención especializada.', 2, NOW());

-- Insertar Servicios
INSERT INTO services (id, category_id, name, slug, description, base_price, estimated_duration_min, icon_key, requires_prescription, is_active, created_at, updated_at) VALUES 
('srv-1', 'cat-1', 'Inyección Intramuscular', 'inyeccion', 'Aplicación de medicamento vía intramuscular.', 150.00, 20, 'Syringe', 1, 1, NOW(), NOW()),
('srv-2', 'cat-1', 'Toma de Signos Vitales', 'signos', 'Medición de presión arterial, glucosa, temperatura.', 200.00, 30, 'Activity', 0, 1, NOW(), NOW()),
('srv-3', 'cat-1', 'Curación de Heridas', 'curacion', 'Limpieza y vendaje de heridas postoperatorias.', 350.00, 45, 'Activity', 0, 1, NOW(), NOW()),
('srv-4', 'cat-2', 'Turno Nocturno (8 hrs)', 'turno-nocturno', 'Cuidados y vigilancia del paciente durante la noche.', 1200.00, 480, 'Activity', 0, 1, NOW(), NOW()),
('srv-5', 'cat-2', 'Turno Diurno (8 hrs)', 'turno-diurno', 'Atención continua, movilización y alimentación.', 1000.00, 480, 'Activity', 0, 1, NOW(), NOW());
