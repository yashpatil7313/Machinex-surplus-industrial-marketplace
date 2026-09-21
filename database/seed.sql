-- MACHINEX Seed Data
USE machinex_db;

-- Clear previous data (in reverse foreign key order)
DELETE FROM reports;
DELETE FROM purchase_requests;
DELETE FROM inquiries;
DELETE FROM wishlist;
DELETE FROM parts;
DELETE FROM categories;
DELETE FROM users;

-- 1. Insert Demo Users
-- Admin password: admin123
-- Seller password: seller123
-- Buyer password: buyer123
INSERT INTO users (id, name, email, password, phone, role, company_name, location) VALUES
(1, 'Admin Controller', 'admin@machinex.com', '$2a$10$EmrvX3ovOwjAtFYA8V6QLu//y1YBrDDR5yJlCtkGJRyxqDdLQzWEW', '+91 98200 11223', 'admin', 'MachineX Operations HQ', 'Mumbai, Maharashtra'),
(2, 'Rajesh Kulkarni', 'seller@industrialequip.com', '$2a$10$8MGmojgPAHQSiqGseZkrietl/EhfqBaR2hnlw.IqNWnmQfoOI.ah2', '+91 98450 33445', 'seller', 'Apex Industrial Solutions Pvt Ltd', 'Pune, Maharashtra'),
(3, 'Vikram Mehta', 'buyer@precisionmfg.com', '$2a$10$wDzHKw86W/tQhUvfX70XdO4F/FnMeb0Kwhu2FZu7XTC5jO1HWPMly', '+91 98790 55667', 'buyer', 'Precision Manufacturing Works', 'Ahmedabad, Gujarat'),
(4, 'Suresh Patel', 'suresh@techmachinery.in', '$2a$10$8MGmojgPAHQSiqGseZkrietl/EhfqBaR2hnlw.IqNWnmQfoOI.ah2', '+91 98221 77889', 'seller', 'Western Tool & Machinery Spares', 'Vadodara, Gujarat');

-- 2. Insert Popular Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Bearings', 'High-precision ball bearings, spherical roller bearings, taper and pillow block assemblies for heavy industrial machinery.'),
(2, 'Motors', 'AC/DC industrial induction motors, synchronous servo motors, gear-motors, and variable frequency drive matched units.'),
(3, 'Gears', 'Spur, helical, bevel gears, planetary industrial gearboxes, and speed reducers for torque transmission.'),
(4, 'Pumps', 'Centrifugal, hydraulic gear, rotary vane, diaphragm, and high-pressure fluid delivery pumps.'),
(5, 'Sensors', 'Inductive proximity sensors, photoelectric switches, rotary encoders, thermal and pressure monitoring transducers.'),
(6, 'Valves', 'Directional hydraulic valves, solenoid valves, pneumatic pilot units, butterfly valves, and pressure regulators.'),
(7, 'Shafts', 'Precision ground drive shafts, linear guide shafts, keyed transmission shafts, and alloy splined shafts.'),
(8, 'Belts', 'Timing belts, V-belts, poly-V ribbed drive belts, and reinforced polyurethane conveyor belts.'),
(9, 'Couplings', 'Flexible jaw couplings, disc couplings, gear couplings, and rigid shaft adaptors for power transfer.'),
(10, 'Electrical Components', 'Industrial contactors, circuit breakers, PLC modules, overload relays, terminal blocks, and switchgear.'),
(11, 'Hydraulic Parts', 'Hydraulic cylinders, manifolds, high-pressure hose assemblies, hydraulic power pack components, and filters.'),
(12, 'Pneumatic Parts', 'Pneumatic cylinders, FRL units, air preparation manifolds, push-in fittings, and quick exhaust valves.'),
(13, 'CNC Components', 'Ball screws, linear motion guideways, spindle cartridges, tool changers, and servo motor mounting brackets.');

-- 3. Insert Machine Parts (10 Featured + 2 Pending + 1 Sold)
INSERT INTO parts (id, seller_id, category_id, name, brand, model_number, description, condition_state, quantity, price, location, image, status) VALUES
(1, 2, 2, 'Siemens 5 HP Industrial Motor', 'Siemens', '1LE1001-1DB22-2AA4', 'Heavy-duty 3-phase squirrel cage induction motor. 3.7 kW (5 HP), 1450 RPM, 415V, IP55 enclosure, Cast iron frame with IE3 premium efficiency. Factory surplus from cancelled conveyor project.', 'New / Unused', 4, 38500.00, 'Pune, Maharashtra', '/uploads/siemens-motor.jpg', 'approved'),
(2, 2, 1, 'SKF Deep Groove Ball Bearing', 'SKF', '6208-2RS1/C3', 'High precision single row deep groove ball bearing with rubber contact seals on both sides. 40mm bore, 80mm OD, 18mm width. Genuine SKF Sweden stock, factory sealed in original boxes.', 'Surplus', 60, 1450.00, 'Pune, Maharashtra', '/uploads/skf-bearing.jpg', 'approved'),
(3, 2, 11, 'Bosch Rexroth Hydraulic Pump', 'Bosch Rexroth', 'A10VSO45DFR1/31R-PPA12N00', 'Variable displacement axial piston pump designed for hydrostatic drives in open hydraulic circuits. 45 cc displacement, max pressure 280 bar. Bench tested and in pristine condition.', 'Like New', 3, 42000.00, 'Pune, Maharashtra', '/uploads/bosch-pump.jpg', 'approved'),
(4, 2, 5, 'Schneider Proximity Sensor', 'Schneider Electric', 'XS618B1PAL2', 'Inductive proximity sensor, M18 brass cylindrical casing, flush mountable. 8mm sensing distance, 3-wire PNP normally open output, 12-48V DC supply, 2m pre-wired PVC cable.', 'New / Unused', 25, 2800.00, 'Pune, Maharashtra', '/uploads/schneider-sensor.jpg', 'approved'),
(5, 2, 3, 'ABB Industrial Gearbox', 'ABB', 'M2BAX 132MLA Helical', 'Foot-mounted inline helical gearbox with high radial load capacity. Ratio 15:1, input bore 38mm, output shaft 50mm. Stored in climate-controlled warehouse with oil preservation.', 'Surplus', 2, 68000.00, 'Pune, Maharashtra', '/uploads/abb-gearbox.jpg', 'approved'),
(6, 2, 6, 'Parker Hydraulic Valve', 'Parker Hannifin', 'D1VW001CNJW', 'Directional control valve, NFPA D03 / CETOP 3 mounting. 4-way 3-position closed center spool, 24V DC solenoid operated with manual override. Tested under pressure.', 'Used - Good', 6, 18500.00, 'Pune, Maharashtra', '/uploads/parker-valve.jpg', 'approved'),
(7, 2, 2, 'Mitsubishi Servo Motor', 'Mitsubishi Electric', 'HG-SR152', 'High-inertia AC rotary servo motor. 1.5 kW output, rated speed 2000 RPM, 22-bit absolute optical encoder, straight shaft with keyway. Tested with MR-J4 drive.', 'Like New', 5, 54000.00, 'Pune, Maharashtra', '/uploads/mitsubishi-servo.jpg', 'approved'),
(8, 2, 1, 'FAG Spherical Roller Bearing', 'FAG / Schaeffler', '22215-E1-XL', 'Premium double-row spherical roller bearing with cylindrical bore. 75mm bore, 130mm OD, 31mm width. Brass cage, C3 clearance, perfect for heavy vibrating crushers and screens.', 'New / Unused', 18, 6200.00, 'Pune, Maharashtra', '/uploads/fag-bearing.jpg', 'approved'),
(9, 2, 10, 'Allen Bradley PLC Module', 'Allen-Bradley', '1756-IB16 ControlLogix', '16-point 24V DC digital sinking input module with removable terminal block. Compatible with ControlLogix 5570/5580 chassis. Removed from clean decommissioned packaging cell.', 'Used - Good', 8, 29000.00, 'Pune, Maharashtra', '/uploads/allen-bradley-plc.jpg', 'approved'),
(10, 2, 10, 'Siemens Contactor', 'Siemens', '3RT2026-1BB40 Sirius', '3-pole IEC magnetic power contactor, 25A AC-3 rating (11 kW @ 400V), 24V DC control coil, 1NO + 1NC auxiliary contacts. Screw terminal connections, DIN rail mountable.', 'Surplus', 30, 3400.00, 'Pune, Maharashtra', '/uploads/siemens-contactor.jpg', 'approved'),
(11, 4, 12, 'Rexroth Pneumatic Cylinder', 'Bosch Rexroth', 'PRA-DA-080-0250', 'ISO 15552 standard profile cylinder, 80mm bore, 250mm stroke, adjustable pneumatic cushioning at both ends. Magnetic piston for position sensors.', 'Surplus', 10, 9800.00, 'Vadodara, Gujarat', '/uploads/rexroth-cylinder.jpg', 'pending'),
(12, 4, 13, 'THK Linear Motion Guideway Set', 'THK Japan', 'HSR25R2SS+1200L', 'Precision ground linear guide block and 1200mm rail set. Heavy load 4-way equal load construction. Factory coated in protective rust-inhibiting grease.', 'New / Unused', 4, 21500.00, 'Vadodara, Gujarat', '/uploads/thk-guideway.jpg', 'pending'),
(13, 2, 4, 'Grundfos Multi-Stage Centrifugal Pump', 'Grundfos', 'CR 15-3 A-F-A-E-HQQE', 'Vertical multistage centrifugal inline pump, stainless steel impellers, 4 kW motor. High pressure boiler feed and water treatment application.', 'Used - Good', 1, 48000.00, 'Pune, Maharashtra', '/uploads/grundfos-pump.jpg', 'sold');

-- 4. Insert Sample Wishlist Item (Buyer has SKF Bearing and Siemens Motor on wishlist)
INSERT INTO wishlist (id, buyer_id, part_id) VALUES
(1, 3, 2),
(2, 3, 1);

-- 5. Insert Sample Inquiries
INSERT INTO inquiries (id, part_id, buyer_id, seller_id, message, quantity, reply, status) VALUES
(1, 1, 3, 2, 'Hello Rajesh, do you have the original manufacturer test certificates (MTC) and warranty documents for these 5 HP Siemens motors?', 2, 'Yes Vikram, all 4 units include original Siemens test certificates and are in sealed OEM packaging. Ready for dispatch.', 'accepted'),
(2, 4, 3, 2, 'Are these Schneider proximity sensors flush or non-flush mounting? Can you do expedited dispatch to Ahmedabad?', 10, 'These are flush mount M18 models with 8mm sensing range. We can dispatch via DTDC courier within 24 hours of confirmation.', 'completed');

-- 6. Insert Sample Purchase Requests
INSERT INTO purchase_requests (id, part_id, buyer_id, seller_id, quantity, total_price, message, status) VALUES
(1, 1, 3, 2, 2, 77000.00, 'Formal PO issued. Need delivery to Precision Manufacturing Works, Phase II GIDC Vatva, Ahmedabad. Please provide GST invoice.', 'approved'),
(2, 6, 3, 2, 1, 18500.00, 'Urgent replacement needed for our CNC press machine hydraulic pack. Ready to release payment immediately upon approval.', 'pending');

-- 7. Insert Sample Report (to demonstrate admin moderation)
INSERT INTO reports (id, part_id, reported_by, reason, details, status) VALUES
(1, 6, 3, 'Incorrect information', 'Model tag indicates D1VW001CNJW which is 24V DC, please double check voltage in description.', 'pending');
