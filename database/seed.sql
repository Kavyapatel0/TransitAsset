USE transitasset;

SET FOREIGN_KEY_CHECKS = 0;

-- ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Full system access'),
(2, 'DEPOT_MANAGER', 'Manages depot assets'),
(3, 'TECHNICIAN', 'Handles maintenance');

-- DEPARTMENTS
INSERT INTO departments (id, name, description, status) VALUES
(1, 'Urban Transport Operations', 'Day-to-day urban transport operations', 'ACTIVE'),
(2, 'Fleet Management', 'Vehicle fleet lifecycle', 'ACTIVE'),
(3, 'Infrastructure', 'Depot and facility infrastructure', 'ACTIVE'),
(4, 'Maintenance', 'Maintenance and repair operations', 'ACTIVE'),
(5, 'Electrical Operations', 'Electrical systems and EV infrastructure', 'ACTIVE'),
(6, 'Security', 'Security systems and surveillance', 'ACTIVE'),
(7, 'ICT & Digital', 'IT, networking and digital systems', 'ACTIVE');

-- LOCATIONS
INSERT INTO locations (id, name, type, address, city, state, postal_code, contact_number, status) VALUES
(1, 'Central Depot', 'DEPOT', '1 Transport Way, Sector 5', 'Hyderabad', 'Telangana', '500001', '040-23456789', 'ACTIVE'),
(2, 'North Depot', 'DEPOT', '45 Northern Ring Road', 'Hyderabad', 'Telangana', '500004', '040-23456790', 'ACTIVE'),
(3, 'South Depot', 'DEPOT', '12 Southern Bypass', 'Hyderabad', 'Telangana', '500008', '040-23456791', 'ACTIVE'),
(4, 'East Depot', 'DEPOT', '78 Eastern Expressway', 'Hyderabad', 'Telangana', '500010', '040-23456792', 'ACTIVE'),
(5, 'Workshop 1', 'WORKSHOP', '3 Industrial Area, Sector 7', 'Hyderabad', 'Telangana', '500002', '040-23456793', 'ACTIVE'),
(6, 'Workshop 2', 'WORKSHOP', '22 Heavy Vehicle Park', 'Hyderabad', 'Telangana', '500003', '040-23456794', 'ACTIVE'),
(7, 'Charging Station Alpha', 'CHARGING_STATION', '9 Green Energy Zone', 'Hyderabad', 'Telangana', '500005', '040-23456795', 'ACTIVE'),
(8, 'Admin Office', 'OFFICE', 'Transport Authority HQ, Block A', 'Hyderabad', 'Telangana', '500000', '040-23456796', 'ACTIVE');

-- USERS
INSERT INTO users (id, name, email, password_hash, role_id, department_id, location_id, status) VALUES
(1, 'Arjun Sharma', 'admin@transitasset.local', '$2b$12$pf/LWw/qyn14LPeXxFUWx.VHHa6EqcaXp2ukW1pFylxOWVcSO684i', 1, 1, 8, 'ACTIVE'),
(2, 'Priya Nair', 'manager.central@transitasset.local', '$2b$12$2WQOpKLjqk4TAitRaLVzJuZvbwUre.znpnWF9208B5Qs4DcuXiWJ.', 2, 2, 1, 'ACTIVE'),
(3, 'Ravi Kumar', 'manager.north@transitasset.local', '$2b$12$2WQOpKLjqk4TAitRaLVzJuZvbwUre.znpnWF9208B5Qs4DcuXiWJ.', 2, 2, 2, 'ACTIVE'),
(4, 'Sanjay Patel', 'tech1@transitasset.local', '$2b$12$rAcDD5x42BxRLCDMni4Hd.z3.1pD/A.TYAh931sGW/hiNo3PfwzLq', 3, 4, 1, 'ACTIVE'),
(5, 'Meena Reddy', 'tech2@transitasset.local', '$2b$12$rAcDD5x42BxRLCDMni4Hd.z3.1pD/A.TYAh931sGW/hiNo3PfwzLq', 3, 4, 1, 'ACTIVE'),
(6, 'Kiran Babu', 'tech3@transitasset.local', '$2b$12$rAcDD5x42BxRLCDMni4Hd.z3.1pD/A.TYAh931sGW/hiNo3PfwzLq', 3, 4, 2, 'ACTIVE'),
(7, 'Deepa Krishnan', 'tech4@transitasset.local', '$2b$12$rAcDD5x42BxRLCDMni4Hd.z3.1pD/A.TYAh931sGW/hiNo3PfwzLq', 3, 5, 3, 'ACTIVE');

UPDATE departments SET manager_id = 1 WHERE id = 1;
UPDATE departments SET manager_id = 2 WHERE id = 2;
UPDATE departments SET manager_id = 2 WHERE id = 3;
UPDATE departments SET manager_id = 4 WHERE id = 4;
UPDATE locations SET manager_id = 2 WHERE id = 1;
UPDATE locations SET manager_id = 3 WHERE id = 2;
UPDATE locations SET manager_id = 2 WHERE id = 3;
UPDATE locations SET manager_id = 3 WHERE id = 4;
UPDATE locations SET manager_id = 4 WHERE id = 5;
UPDATE locations SET manager_id = 4 WHERE id = 6;

-- ASSET CATEGORIES & TYPES
INSERT INTO asset_categories (id, name, description) VALUES
(1, 'Vehicles', 'Motorised transport vehicles'),
(2, 'Depot Infrastructure', 'Infrastructure assets at depots'),
(3, 'Operational Equipment', 'Equipment used in daily operations'),
(4, 'General Infrastructure', 'General infrastructure and utilities');

INSERT INTO asset_types (category_id, name) VALUES
(1, 'Diesel Bus'), (1, 'CNG Bus'), (1, 'Electric Bus'),
(2, 'Charging Station'), (2, 'Fuel Station'), (2, 'Workshop Equipment'), (2, 'Depot Equipment'),
(3, 'Ticketing Machine'), (3, 'GPS Device'), (3, 'CCTV Camera'), (3, 'Passenger Information Display'), (3, 'Security Equipment'),
(4, 'Generator'), (4, 'Networking Equipment'), (4, 'Electrical Equipment'), (4, 'Office Equipment');

-- ASSETS
INSERT INTO assets (id, asset_code, name, asset_type, category, serial_number, registration_number, manufacturer, model, purchase_date, purchase_cost, warranty_start, warranty_expiry, ownership_type, location_id, department_id, custodian_id, status, `condition`, fuel_type, seating_capacity, mileage, battery_capacity, vehicle_number, last_inspection_date, next_inspection_date, last_maintenance_date, description) VALUES
(1,'BUS-001','Ashok Leyland Diesel Bus 01','Diesel Bus','Vehicles','VH-DSL-001','TS09AB1001','Ashok Leyland','Viking R','2022-03-15',4200000.00,'2022-03-15','2025-03-15','GOVERNMENT_OWNED',1,2,2,'OPERATIONAL','GOOD','DIESEL',52,85420.50,NULL,'TS09AB1001','2026-06-15','2026-12-15','2026-04-10','Standard inter-city diesel bus'),
(2,'BUS-002','Ashok Leyland Diesel Bus 02','Diesel Bus','Vehicles','VH-DSL-002','TS09AB1002','Ashok Leyland','Viking R','2022-03-15',4200000.00,'2022-03-15','2025-03-15','GOVERNMENT_OWNED',2,2,3,'UNDER_MAINTENANCE','FAIR','DIESEL',52,92100.00,NULL,'TS09AB1002','2026-03-10','2026-09-10','2026-09-01','Requires engine overhaul'),
(3,'BUS-003','TATA Diesel Bus 03','Diesel Bus','Vehicles','VH-DSL-003','TS09AB1003','TATA Motors','Starbus Ultra','2021-07-20',3850000.00,'2021-07-20','2024-07-20','GOVERNMENT_OWNED',3,2,2,'OPERATIONAL','GOOD','DIESEL',48,110500.00,NULL,'TS09AB1003','2026-05-20','2026-11-20','2026-02-15','City route bus'),
(4,'BUS-004','TATA Diesel Bus 04','Diesel Bus','Vehicles','VH-DSL-004','TS09AB1004','TATA Motors','Starbus Ultra','2021-07-20',3850000.00,'2021-07-20','2024-07-20','GOVERNMENT_OWNED',4,2,3,'RETIRED','POOR','DIESEL',48,185000.00,NULL,'TS09AB1004',NULL,NULL,'2025-11-20','End of service life'),
(5,'BUS-005','CNG Bus 05','CNG Bus','Vehicles','VH-CNG-001','TS09CD2001','Ashok Leyland','CNG Viking','2023-01-10',4650000.00,'2023-01-10','2026-01-10','GOVERNMENT_OWNED',1,2,2,'OPERATIONAL','EXCELLENT','CNG',52,45200.00,NULL,'TS09CD2001','2026-07-01','2026-12-31','2026-05-20','High-capacity CNG bus'),
(6,'BUS-006','CNG Bus 06','CNG Bus','Vehicles','VH-CNG-002','TS09CD2002','Ashok Leyland','CNG Viking','2023-01-10',4650000.00,'2023-01-10','2026-01-10','GOVERNMENT_OWNED',2,2,3,'OPERATIONAL','GOOD','CNG',52,48900.00,NULL,'TS09CD2002','2026-07-01','2026-12-31','2026-06-01','High-capacity CNG bus'),
(7,'BUS-007','CNG Bus 07','CNG Bus','Vehicles','VH-CNG-003','TS09CD2003','TATA Motors','CNG Starbus','2022-09-05',4400000.00,'2022-09-05','2025-09-05','GOVERNMENT_OWNED',3,2,2,'UNDER_INSPECTION','GOOD','CNG',48,72300.00,NULL,'TS09CD2003','2026-09-25','2027-03-25',NULL,'Scheduled periodic inspection'),
(8,'BUS-008','CNG Bus 08','CNG Bus','Vehicles','VH-CNG-004','TS09CD2004','TATA Motors','CNG Starbus','2022-09-05',4400000.00,'2022-09-05','2025-09-05','GOVERNMENT_OWNED',4,2,3,'OPERATIONAL','FAIR','CNG',48,91000.00,NULL,'TS09CD2004','2026-04-10','2026-10-10','2026-03-22','Minor wear on brake pads'),
(9,'BUS-009','Electric Bus 01','Electric Bus','Vehicles','VH-ELC-001','TS09EL3001','Olectra','GreenCell EV','2024-02-20',8500000.00,'2024-02-20','2030-02-20','GOVERNMENT_OWNED',7,5,2,'OPERATIONAL','EXCELLENT','ELECTRIC',40,12500.00,250.00,'TS09EL3001','2026-08-01','2027-02-01','2026-07-15',NULL),
(10,'BUS-010','Electric Bus 02','Electric Bus','Vehicles','VH-ELC-002','TS09EL3002','Olectra','GreenCell EV','2024-02-20',8500000.00,'2024-02-20','2030-02-20','GOVERNMENT_OWNED',7,5,2,'OPERATIONAL','EXCELLENT','ELECTRIC',40,11800.00,250.00,'TS09EL3002','2026-08-01','2027-02-01',NULL,NULL),
(11,'BUS-011','Electric Bus 03','Electric Bus','Vehicles','VH-ELC-003','TS09EL3003','Tata EV','Tata Starbus EV','2024-04-15',9200000.00,'2024-04-15','2030-04-15','GOVERNMENT_OWNED',1,5,2,'OPERATIONAL','EXCELLENT','ELECTRIC',45,8900.00,350.00,'TS09EL3003','2026-08-15','2027-02-15',NULL,NULL),
(12,'BUS-012','Electric Bus 04','Electric Bus','Vehicles','VH-ELC-004','TS09EL3004','Tata EV','Tata Starbus EV','2024-04-15',9200000.00,'2024-04-15','2030-04-15','GOVERNMENT_OWNED',2,5,3,'UNDER_MAINTENANCE','GOOD','ELECTRIC',45,15200.00,350.00,'TS09EL3004','2026-07-10','2027-01-10','2026-09-10','Battery management system issue'),
(13,'BUS-013','Electric Bus 05','Electric Bus','Vehicles','VH-ELC-005','TS09EL3005','Olectra','GreenCell EV Plus','2024-06-01',9800000.00,'2024-06-01','2030-06-01','PPP',3,5,2,'OPERATIONAL','EXCELLENT','ELECTRIC',45,5600.00,350.00,'TS09EL3005','2026-09-01','2027-03-01',NULL,'PPP model electric bus'),
(14,'CHG-001','EV Charging Station 01','Charging Station','Depot Infrastructure','CS-EV-001',NULL,'Delta Electronics','AC22kW','2024-01-15',850000.00,'2024-01-15','2027-01-15','GOVERNMENT_OWNED',7,5,7,'OPERATIONAL','EXCELLENT',NULL,NULL,NULL,NULL,NULL,'2026-07-20','2027-01-20',NULL,'22kW AC fast charger'),
(15,'CHG-002','EV Charging Station 02','Charging Station','Depot Infrastructure','CS-EV-002',NULL,'Delta Electronics','DC50kW','2024-01-15',1800000.00,'2024-01-15','2027-01-15','GOVERNMENT_OWNED',7,5,7,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-07-20','2027-01-20','2026-05-10','50kW DC fast charger'),
(16,'CHG-003','EV Charging Station 03','Charging Station','Depot Infrastructure','CS-EV-003',NULL,'ABB','Terra HP','2024-03-10',2400000.00,'2024-03-10','2027-03-10','GOVERNMENT_OWNED',7,5,7,'OPERATIONAL','EXCELLENT',NULL,NULL,NULL,NULL,NULL,'2026-08-10','2027-02-10',NULL,'150kW high power charger'),
(17,'CHG-004','EV Charging Station 04','Charging Station','Depot Infrastructure','CS-EV-004',NULL,'ABB','Terra HP','2024-03-10',2400000.00,'2024-03-10','2027-03-10','GOVERNMENT_OWNED',1,5,2,'UNDER_MAINTENANCE','POOR',NULL,NULL,NULL,NULL,NULL,'2026-06-01','2026-12-01','2026-09-15','Connector fault'),
(18,'CHG-005','EV Charging Station 05','Charging Station','Depot Infrastructure','CS-EV-005',NULL,'Tata Power','EZ Charge','2023-11-20',1200000.00,'2023-11-20','2026-11-20','GOVERNMENT_OWNED',2,5,3,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-08-20','2027-02-20',NULL,'22kW AC charger at North Depot'),
(19,'CAM-001','CCTV Camera 01 - Central Depot Gate','CCTV Camera','Operational Equipment','CC-001',NULL,'Hikvision','DS-2CD3145G2-IS','2023-05-01',85000.00,'2023-05-01','2026-05-01','GOVERNMENT_OWNED',1,6,2,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-06-01','2026-12-01',NULL,'Entry gate surveillance'),
(20,'CAM-002','CCTV Camera 02 - Central Interior','CCTV Camera','Operational Equipment','CC-002',NULL,'Hikvision','DS-2CD3145G2-IS','2023-05-01',85000.00,'2023-05-01','2026-05-01','GOVERNMENT_OWNED',1,6,2,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-06-01','2026-12-01',NULL,'Interior monitoring'),
(21,'CAM-003','CCTV Camera 03 - North Depot','CCTV Camera','Operational Equipment','CC-003',NULL,'Dahua','IPC-HFW2831S','2023-08-10',72000.00,'2023-08-10','2026-08-10','GOVERNMENT_OWNED',2,6,3,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-07-10','2027-01-10',NULL,NULL),
(22,'CAM-004','CCTV Camera 04 - South Depot','CCTV Camera','Operational Equipment','CC-004',NULL,'Dahua','IPC-HFW2831S','2023-08-10',72000.00,'2023-08-10','2026-08-10','GOVERNMENT_OWNED',3,6,2,'UNDER_INSPECTION','FAIR',NULL,NULL,NULL,NULL,NULL,'2026-09-20',NULL,NULL,'Image quality degraded'),
(23,'CAM-005','CCTV Camera 05 - East Depot','CCTV Camera','Operational Equipment','CC-005',NULL,'Dahua','IPC-HFW2831S','2022-11-05',72000.00,'2022-11-05','2025-11-05','GOVERNMENT_OWNED',4,6,3,'OPERATIONAL','FAIR',NULL,NULL,NULL,NULL,NULL,'2026-05-05','2026-11-05','2026-02-10','Warranty expired'),
(24,'CAM-006','CCTV Camera 06 - Workshop 1','CCTV Camera','Operational Equipment','CC-006',NULL,'Hikvision','DS-2CD2T47G2-L','2024-02-01',95000.00,'2024-02-01','2027-02-01','GOVERNMENT_OWNED',5,6,2,'OPERATIONAL','EXCELLENT',NULL,NULL,NULL,NULL,NULL,'2026-08-01','2027-02-01',NULL,'Night vision camera'),
(25,'TKT-001','Automated Ticketing Machine 01','Ticketing Machine','Operational Equipment','TM-001',NULL,'Scheidt Bachmann','ATAC-300','2023-06-15',320000.00,'2023-06-15','2026-06-15','GOVERNMENT_OWNED',1,1,2,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-08-15','2027-02-15','2026-04-01',NULL),
(26,'TKT-002','Automated Ticketing Machine 02','Ticketing Machine','Operational Equipment','TM-002',NULL,'Scheidt Bachmann','ATAC-300','2023-06-15',320000.00,'2023-06-15','2026-06-15','GOVERNMENT_OWNED',2,1,3,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-08-15','2027-02-15',NULL,NULL),
(27,'TKT-003','Automated Ticketing Machine 03','Ticketing Machine','Operational Equipment','TM-003',NULL,'Scheidt Bachmann','ATAC-300','2023-06-15',320000.00,'2023-06-15','2026-06-15','GOVERNMENT_OWNED',3,1,2,'UNDER_MAINTENANCE','POOR',NULL,NULL,NULL,NULL,NULL,'2026-05-15','2026-11-15','2026-09-20','Card reader malfunction'),
(28,'TKT-004','Automated Ticketing Machine 04','Ticketing Machine','Operational Equipment','TM-004',NULL,'IFM','Ticket Pro','2022-09-01',280000.00,'2022-09-01','2025-09-01','GOVERNMENT_OWNED',4,1,3,'OPERATIONAL','FAIR',NULL,NULL,NULL,NULL,NULL,'2026-03-01','2026-09-01','2026-01-15','Warranty expired'),
(29,'TKT-005','Automated Ticketing Machine 05','Ticketing Machine','Operational Equipment','TM-005',NULL,'IFM','Ticket Pro','2022-09-01',280000.00,'2022-09-01','2025-09-01','GOVERNMENT_OWNED',1,1,2,'RETIRED','CRITICAL',NULL,NULL,NULL,NULL,NULL,'2025-09-01',NULL,'2025-10-01','Hardware failure'),
(30,'GPS-001','GPS Tracking Unit 01','GPS Device','Operational Equipment','GP-001',NULL,'Concox','GT06N','2023-02-10',15000.00,'2023-02-10','2026-02-10','GOVERNMENT_OWNED',1,1,2,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-07-10','2027-01-10',NULL,'Vehicle GPS tracker'),
(31,'GPS-002','GPS Tracking Unit 02','GPS Device','Operational Equipment','GP-002',NULL,'Concox','GT06N','2023-02-10',15000.00,'2023-02-10','2026-02-10','GOVERNMENT_OWNED',2,1,3,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-07-10','2027-01-10',NULL,'Vehicle GPS tracker'),
(32,'GPS-003','GPS Tracking Unit 03','GPS Device','Operational Equipment','GP-003',NULL,'Teltonika','FMB920','2024-01-05',22000.00,'2024-01-05','2027-01-05','GOVERNMENT_OWNED',3,1,2,'OPERATIONAL','EXCELLENT',NULL,NULL,NULL,NULL,NULL,'2026-08-05','2027-02-05',NULL,'Advanced GPS with CAN bus'),
(33,'GPS-004','GPS Tracking Unit 04','GPS Device','Operational Equipment','GP-004',NULL,'Teltonika','FMB920','2024-01-05',22000.00,'2024-01-05','2027-01-05','GOVERNMENT_OWNED',4,1,3,'OPERATIONAL','EXCELLENT',NULL,NULL,NULL,NULL,NULL,'2026-08-05','2027-02-05',NULL,'Advanced GPS with CAN bus'),
(34,'GEN-001','Power Generator 01 Central Depot','Generator','General Infrastructure','GN-001',NULL,'Cummins','C500D5','2021-05-10',2800000.00,'2021-05-10','2024-05-10','GOVERNMENT_OWNED',1,3,2,'OPERATIONAL','FAIR',NULL,NULL,NULL,NULL,NULL,'2026-04-10','2026-10-10','2026-06-20','500kVA Diesel generator'),
(35,'GEN-002','Power Generator 02 North Depot','Generator','General Infrastructure','GN-002',NULL,'Cummins','C500D5','2022-07-15',2900000.00,'2022-07-15','2025-07-15','GOVERNMENT_OWNED',2,3,3,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-07-15','2027-01-15','2026-03-10','500kVA Diesel generator'),
(36,'GEN-003','Power Generator 03 South Depot','Generator','General Infrastructure','GN-003',NULL,'Kirloskar','KG1-82AS','2023-03-20',1800000.00,'2023-03-20','2026-03-20','GOVERNMENT_OWNED',3,3,2,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-08-20','2027-02-20',NULL,'82.5kVA Generator'),
(37,'DEQ-001','Vehicle Lift Hydraulic 01','Depot Equipment','Depot Infrastructure','DE-001',NULL,'Stertil-Koni','ST1085','2022-04-25',1200000.00,'2022-04-25','2025-04-25','GOVERNMENT_OWNED',5,3,4,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-06-25','2026-12-25',NULL,'Hydraulic vehicle inspection lift'),
(38,'DEQ-002','Wheel Alignment Machine','Depot Equipment','Depot Infrastructure','DE-002',NULL,'Hofmann','geoliner 870','2023-08-10',650000.00,'2023-08-10','2026-08-10','GOVERNMENT_OWNED',5,3,4,'OPERATIONAL','GOOD',NULL,NULL,NULL,NULL,NULL,'2026-08-10','2027-02-10',NULL,'3D wheel alignment system'),
(39,'DEQ-003','Tyre Inflator Industrial','Depot Equipment','Depot Infrastructure','DE-003',NULL,'Atlas Copco','LT 5','2022-01-15',180000.00,'2022-01-15','2025-01-15','GOVERNMENT_OWNED',6,3,4,'OPERATIONAL','FAIR',NULL,NULL,NULL,NULL,NULL,'2026-05-15','2026-11-15','2025-12-10','Industrial tyre inflator'),
(40,'DEQ-004','Engine Diagnostic Scanner','Workshop Equipment','Depot Infrastructure','DE-004',NULL,'Launch Tech','X431 Pro','2024-05-01',85000.00,'2024-05-01','2026-05-01','GOVERNMENT_OWNED',5,4,4,'OPERATIONAL','EXCELLENT',NULL,NULL,NULL,NULL,NULL,'2026-07-01','2027-01-01',NULL,'Multi-brand vehicle diagnostic tool'),
(41,'NET-001','Network Switch Central Depot','Networking Equipment','General Infrastructure','NE-001',NULL,'Cisco','Catalyst 2960X','2023-10-01',95000.00,'2023-10-01','2026-10-01','GOVERNMENT_OWNED',1,7,2,'OPERATIONAL','EXCELLENT',NULL,NULL,NULL,NULL,NULL,'2026-09-01','2027-03-01',NULL,'24-port managed switch'),
(42,'NET-002','Network Switch North Depot','Networking Equipment','General Infrastructure','NE-002',NULL,'Cisco','Catalyst 2960X','2023-10-01',95000.00,'2023-10-01','2026-10-01','GOVERNMENT_OWNED',2,7,3,'OPERATIONAL','EXCELLENT',NULL,NULL,NULL,NULL,NULL,'2026-09-01','2027-03-01',NULL,'24-port managed switch'),
(43,'ELC-001','Distribution Panel Central','Electrical Equipment','General Infrastructure','EP-001',NULL,'Schneider Electric','NSX160B','2021-06-15',380000.00,'2021-06-15','2024-06-15','GOVERNMENT_OWNED',1,5,2,'OPERATIONAL','FAIR',NULL,NULL,NULL,NULL,NULL,'2026-03-15','2026-09-15','2026-01-20','Main distribution board'),
(44,'PID-001','Passenger Information Display 01','Passenger Information Display','Operational Equipment','PI-001',NULL,'Daktronics','OmniSport','2024-03-01',220000.00,'2024-03-01','2027-03-01','GOVERNMENT_OWNED',1,1,2,'OPERATIONAL','EXCELLENT',NULL,NULL,NULL,NULL,NULL,'2026-08-01','2027-02-01',NULL,'LED passenger display board');

-- ASSET LIFECYCLE HISTORY
INSERT INTO asset_lifecycle (asset_id, previous_status, new_status, event_type, location_id, performed_by, reason, remarks, created_at) VALUES
(1, NULL, 'PROCURED', 'PROCUREMENT', NULL, 1, 'Asset procured from Ashok Leyland', 'Purchase order approved', '2022-03-15 10:00:00'),
(1, 'PROCURED', 'REGISTERED', 'REGISTRATION', 8, 1, 'Asset registered in system', 'All documents verified', '2022-03-20 11:00:00'),
(1, 'REGISTERED', 'ASSIGNED', 'ASSIGNMENT', 1, 1, 'Assigned to Central Depot', 'Depot allocation confirmed', '2022-04-01 09:00:00'),
(1, 'ASSIGNED', 'OPERATIONAL', 'ACTIVATION', 1, 2, 'Asset made operational', 'Pre-operational check passed', '2022-04-05 08:00:00'),
(1, 'OPERATIONAL', 'UNDER_MAINTENANCE', 'MAINTENANCE_STARTED', 1, 4, 'Scheduled maintenance', 'Annual service', '2026-04-10 08:00:00'),
(1, 'UNDER_MAINTENANCE', 'OPERATIONAL', 'MAINTENANCE_COMPLETED', 1, 4, 'Maintenance completed', 'Engine tuning done', '2026-04-12 17:00:00'),
(2, NULL, 'PROCURED', 'PROCUREMENT', NULL, 1, 'Asset procured', NULL, '2022-03-15 10:00:00'),
(2, 'PROCURED', 'REGISTERED', 'REGISTRATION', 8, 1, 'Registered', NULL, '2022-03-20 11:00:00'),
(2, 'REGISTERED', 'ASSIGNED', 'ASSIGNMENT', 2, 1, 'Assigned to North Depot', NULL, '2022-04-01 09:00:00'),
(2, 'ASSIGNED', 'OPERATIONAL', 'ACTIVATION', 2, 3, 'Made operational', NULL, '2022-04-05 08:00:00'),
(2, 'OPERATIONAL', 'UNDER_MAINTENANCE', 'MAINTENANCE_STARTED', 2, 5, 'Engine overhaul required', 'Major engine issue detected', '2026-09-01 08:00:00'),
(9, NULL, 'PROCURED', 'PROCUREMENT', NULL, 1, 'Electric bus procured under EV scheme', NULL, '2024-02-20 10:00:00'),
(9, 'PROCURED', 'REGISTERED', 'REGISTRATION', 8, 1, 'Registered and type certified', NULL, '2024-02-28 11:00:00'),
(9, 'REGISTERED', 'ASSIGNED', 'ASSIGNMENT', 7, 1, 'Assigned to Charging Station Alpha', NULL, '2024-03-10 09:00:00'),
(9, 'ASSIGNED', 'OPERATIONAL', 'ACTIVATION', 7, 2, 'Operational after charging infra check', NULL, '2024-03-15 08:00:00'),
(12, NULL, 'PROCURED', 'PROCUREMENT', NULL, 1, 'Electric bus procured', NULL, '2024-04-15 10:00:00'),
(12, 'PROCURED', 'REGISTERED', 'REGISTRATION', 8, 1, 'Registered', NULL, '2024-04-20 11:00:00'),
(12, 'REGISTERED', 'ASSIGNED', 'ASSIGNMENT', 1, 1, 'Initially assigned to Central Depot', NULL, '2024-05-01 09:00:00'),
(12, 'ASSIGNED', 'OPERATIONAL', 'ACTIVATION', 1, 2, 'Made operational', NULL, '2024-05-05 08:00:00'),
(12, 'OPERATIONAL', 'TRANSFERRED', 'TRANSFER_STARTED', 2, 1, 'Transfer to North Depot', NULL, '2026-08-01 10:00:00'),
(12, 'TRANSFERRED', 'OPERATIONAL', 'TRANSFER_COMPLETED', 2, 3, 'Transfer completed', 'Successfully moved to North Depot', '2026-08-05 14:00:00'),
(12, 'OPERATIONAL', 'UNDER_MAINTENANCE', 'MAINTENANCE_STARTED', 2, 6, 'BMS issue reported', 'Battery management system fault', '2026-09-10 09:00:00'),
(4, NULL, 'PROCURED', 'PROCUREMENT', NULL, 1, 'Asset procured', NULL, '2021-07-20 10:00:00'),
(4, 'PROCURED', 'REGISTERED', 'REGISTRATION', 8, 1, 'Registered', NULL, '2021-07-25 11:00:00'),
(4, 'REGISTERED', 'OPERATIONAL', 'ACTIVATION', 4, 3, 'Made operational', NULL, '2021-08-01 08:00:00'),
(4, 'OPERATIONAL', 'RETIRED', 'RETIREMENT', 4, 1, 'End of service life', 'Asset exceeded 180,000km', '2026-09-01 10:00:00');

-- MAINTENANCE REQUESTS
INSERT INTO maintenance_requests (id, asset_id, reported_by, assigned_technician, title, description, priority, status, reported_at, scheduled_at, started_at, completed_at, diagnosis, resolution, maintenance_cost, parts_used, remarks) VALUES
(1, 2, 3, 4, 'Engine Overhaul Required', 'Bus engine consuming excess oil and losing power. Requires complete overhaul.', 'CRITICAL', 'IN_PROGRESS', '2026-09-01 09:00:00', '2026-09-05 08:00:00', '2026-09-05 08:00:00', NULL, 'Cylinder liner wear detected', NULL, 185000.00, 'Cylinder liners, piston rings, gasket set', 'Vehicle off-road'),
(2, 12, 2, 6, 'Battery Management System Fault', 'EV bus showing BMS error codes. Battery not charging to full capacity.', 'HIGH', 'ASSIGNED', '2026-09-10 10:00:00', '2026-09-20 08:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 17, 7, 5, 'Charging Station Connector Fault', 'CHG-004 connector not locking properly, causing interrupted charging sessions.', 'HIGH', 'IN_PROGRESS', '2026-09-15 11:00:00', '2026-09-18 09:00:00', '2026-09-18 09:00:00', NULL, 'Connector lock solenoid failure', NULL, 45000.00, 'Lock solenoid unit', 'Temporary connector in use'),
(4, 27, 2, 5, 'Card Reader Malfunction - TKT-003', 'Smart card reader not reading cards consistently.', 'HIGH', 'IN_PROGRESS', '2026-09-20 08:00:00', '2026-09-22 09:00:00', '2026-09-22 09:00:00', NULL, 'Card reader module damaged due to moisture', NULL, 28000.00, 'Smart card reader module', NULL),
(5, 1, 2, 4, 'Annual Preventive Maintenance - BUS-001', 'Annual service including oil change, filter replacement, brake inspection.', 'MEDIUM', 'COMPLETED', '2026-04-08 09:00:00', '2026-04-10 08:00:00', '2026-04-10 08:00:00', '2026-04-12 17:00:00', 'Brake pads 60% worn, engine in good condition', 'Oil changed, filters replaced, brake pads adjusted', 42000.00, 'Engine oil 20L, air filter, fuel filter, brake fluid', NULL),
(6, 3, 3, 4, 'Tyre Replacement - BUS-003', 'Front tyres worn below minimum tread depth.', 'MEDIUM', 'COMPLETED', '2026-02-10 10:00:00', '2026-02-15 08:00:00', '2026-02-15 08:00:00', '2026-02-15 18:00:00', 'Front tyres below 2mm tread', 'Both front tyres replaced', 38000.00, '2x MRF ZVTS 275/70 R22.5', NULL),
(7, 5, 2, 5, 'CNG Cylinder Pressure Test', 'Routine 2-year cylinder hydrostatic test due.', 'MEDIUM', 'COMPLETED', '2026-05-15 09:00:00', '2026-05-20 08:00:00', '2026-05-20 08:00:00', '2026-05-20 17:00:00', 'All 6 CNG cylinders passed hydrostatic test', 'Cylinders recertified, seals replaced', 32000.00, 'CNG cylinder seals', NULL),
(8, 34, 2, 4, 'Generator 01 Unscheduled Shutdown', 'Generator shutting down automatically after 2 hours of operation.', 'HIGH', 'COMPLETED', '2026-06-15 14:00:00', '2026-06-16 09:00:00', '2026-06-16 09:00:00', '2026-06-18 14:00:00', 'Coolant temperature sensor faulty', 'Coolant temp sensor replaced, cooling system flushed', 18500.00, 'Temperature sensor, coolant 10L', NULL),
(9, 14, 7, 5, 'Charging Station 01 Software Update', 'Firmware update required for compatibility with new EV models.', 'LOW', 'COMPLETED', '2026-07-01 10:00:00', '2026-07-10 09:00:00', '2026-07-10 09:00:00', '2026-07-10 16:00:00', 'Firmware version outdated', 'Firmware updated to v3.2.1', 5000.00, 'Remote update service charge', NULL),
(10, 8, 3, 6, 'Brake System Service - BUS-008', 'Brake response slightly delayed. Scheduled maintenance.', 'MEDIUM', 'COMPLETED', '2026-03-20 09:00:00', '2026-03-22 08:00:00', '2026-03-22 08:00:00', '2026-03-22 16:00:00', 'Brake fluid contaminated, disc pads worn', 'Brake fluid flushed, rear pads replaced', 35000.00, 'Brake fluid 2L, rear brake pads', NULL),
(11, 43, 2, 7, 'Distribution Panel Inspection - ELC-001', 'Annual electrical inspection and thermal imaging.', 'MEDIUM', 'COMPLETED', '2026-01-10 10:00:00', '2026-01-20 09:00:00', '2026-01-20 09:00:00', '2026-01-20 17:00:00', 'Minor loose connections on bus bars', 'Connections tightened, thermal check passed', 12000.00, 'Cable ties, insulation tape', NULL),
(12, 22, 3, 5, 'CCTV CAM-004 Image Quality Issue', 'Camera at South Depot showing blurred overnight images.', 'LOW', 'OPEN', '2026-09-25 11:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 28, 3, 6, 'Ticketing Machine TKT-004 Printer Jam', 'Ticket printer jamming frequently.', 'MEDIUM', 'COMPLETED', '2026-01-12 08:00:00', '2026-01-15 09:00:00', '2026-01-15 09:00:00', '2026-01-15 15:00:00', 'Paper sensor and feed rollers worn', 'Feed rollers and sensor replaced', 15000.00, 'Feed rollers x2, paper sensor', NULL),
(14, 37, 4, 4, 'Vehicle Lift Hydraulic Leak', 'Hydraulic lift leaking oil from cylinder seal.', 'HIGH', 'COMPLETED', '2026-05-05 10:00:00', '2026-05-08 08:00:00', '2026-05-08 08:00:00', '2026-05-09 16:00:00', 'Hydraulic cylinder O-ring and piston seal failed', 'Hydraulic seals replaced, oil topped up', 28000.00, 'Seal kit, hydraulic oil 5L', NULL),
(15, 10, 2, 6, 'Electric Bus 02 AC System Check', 'Passenger compartment AC not cooling adequately.', 'MEDIUM', 'ASSIGNED', '2026-09-26 09:00:00', '2026-10-02 08:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- INSPECTIONS
INSERT INTO inspections (id, asset_id, inspector_id, inspection_date, result, `condition`, findings, recommendations, next_inspection_date, remarks, created_at) VALUES
(1, 1, 4, '2026-06-15', 'PASS', 'GOOD', 'Engine normal, body minor dents, tyres 65% tread', 'Schedule tyre rotation in 3 months', '2026-12-15', 'Passed routine half-yearly inspection', '2026-06-15 16:00:00'),
(2, 3, 4, '2026-05-20', 'PASS', 'GOOD', 'All systems functional, new tyres fitted in March', 'Continue monthly driver checks', '2026-11-20', NULL, '2026-05-20 15:00:00'),
(3, 5, 5, '2026-07-01', 'PASS', 'EXCELLENT', 'CNG cylinders recertified, all safety systems checked', 'Next cylinder test in 2 years', '2026-12-31', 'Excellent condition', '2026-07-01 16:00:00'),
(4, 6, 5, '2026-07-01', 'PASS', 'GOOD', 'Minor surface rust on undercarriage, all mechanicals OK', 'Apply underbody coating at next service', '2026-12-31', NULL, '2026-07-01 16:00:00'),
(5, 7, 5, '2026-09-25', 'REQUIRES_ATTENTION', 'GOOD', 'Steering play slightly above tolerance.', 'Wheel alignment and steering check required', NULL, 'Inspection ongoing', '2026-09-25 10:00:00'),
(6, 9, 7, '2026-08-01', 'PASS', 'EXCELLENT', 'Battery at 98% health, all EV systems nominal', 'Continue monthly health monitoring', '2027-02-01', NULL, '2026-08-01 15:00:00'),
(7, 10, 7, '2026-08-01', 'PASS', 'EXCELLENT', 'Battery at 97% health, systems optimal', 'Continue monitoring', '2027-02-01', NULL, '2026-08-01 15:30:00'),
(8, 11, 7, '2026-08-15', 'PASS', 'EXCELLENT', 'New EV bus, all systems checked at 3500km mark', 'Manufacturer warranty inspection passed', '2027-02-15', NULL, '2026-08-15 14:00:00'),
(9, 14, 7, '2026-07-20', 'PASS', 'EXCELLENT', 'Charger firmware current, connector wear minimal', 'Increase cleaning frequency', '2027-01-20', NULL, '2026-07-20 15:00:00'),
(10, 15, 7, '2026-07-20', 'PASS', 'GOOD', 'Connector shows moderate wear, cooling fan operational', 'Monitor connector wear', '2027-01-20', NULL, '2026-07-20 15:30:00'),
(11, 19, 6, '2026-06-01', 'PASS', 'GOOD', 'Camera operational, image quality good, storage 85% utilized', 'Expand storage or archive old footage', '2026-12-01', NULL, '2026-06-01 14:00:00'),
(12, 22, 6, '2026-09-20', 'FAIL', 'FAIR', 'Night mode image quality below acceptable standard. IR illuminator failure.', 'Replace IR illuminator array', NULL, 'Camera requires repair', '2026-09-20 11:00:00'),
(13, 34, 4, '2026-04-10', 'REQUIRES_ATTENTION', 'FAIR', 'Generator age 5 years, coolant shows contamination', 'Major service overdue', '2026-10-10', 'Priority maintenance recommended', '2026-04-10 15:00:00'),
(14, 37, 4, '2026-06-25', 'PASS', 'GOOD', 'Hydraulic lift post maintenance - no leaks, lift speed normal', 'Quarterly oil level checks', '2026-12-25', 'Post-maintenance inspection passed', '2026-06-25 14:00:00'),
(15, 8, 6, '2026-04-10', 'PASS', 'FAIR', 'Post brake service inspection, all brakes functional, minor body rust', 'Body treatment recommended', '2026-10-10', NULL, '2026-04-10 16:00:00'),
(16, 25, 2, '2026-08-15', 'PASS', 'GOOD', 'Ticketing machine calibrated, card reader operational, printer functional', 'Software update recommended', '2027-02-15', NULL, '2026-08-15 15:00:00'),
(17, 43, 7, '2026-03-15', 'REQUIRES_ATTENTION', 'FAIR', 'Distribution panel showing thermal hotspot at bus bar B.', 'Schedule emergency maintenance within 30 days', '2026-09-15', 'Post-maintenance follow-up required', '2026-03-15 15:00:00');

-- ASSET TRANSFERS
INSERT INTO asset_transfers (id, asset_id, from_location_id, to_location_id, requested_by, approved_by, request_date, transfer_date, reason, status, remarks) VALUES
(1, 12, 1, 2, 2, 1, '2026-07-28 10:00:00', '2026-08-05 14:00:00', 'North Depot has shortage of electric buses', 'COMPLETED', 'Transfer completed successfully'),
(2, 6, 1, 2, 2, 1, '2026-06-01 10:00:00', '2026-06-10 12:00:00', 'North depot operational requirement', 'COMPLETED', NULL),
(3, 21, 1, 2, 3, 1, '2026-05-15 09:00:00', '2026-05-20 11:00:00', 'Security upgrade at North Depot', 'COMPLETED', 'CAM-003 installed at North Depot main gate'),
(4, 32, 1, 3, 2, 1, '2026-05-01 10:00:00', '2026-05-08 14:00:00', 'GPS tracking expansion to South Depot', 'COMPLETED', NULL),
(5, 33, 2, 4, 3, 1, '2026-06-10 09:00:00', '2026-06-15 12:00:00', 'East Depot fleet expansion requires GPS', 'COMPLETED', NULL),
(6, 8, 2, 4, 3, 1, '2026-03-01 10:00:00', '2026-03-10 14:00:00', 'East Depot fleet augmentation', 'COMPLETED', NULL),
(7, 3, 2, 3, 2, NULL, '2026-09-20 10:00:00', NULL, 'South Depot requires additional diesel bus for peak season', 'REQUESTED', 'Awaiting admin approval'),
(8, 26, 1, 4, 2, 1, '2026-09-15 10:00:00', NULL, 'East Depot ticketing system upgrade', 'APPROVED', 'Approved - awaiting logistics');

-- DOCUMENTS
INSERT INTO documents (asset_id, document_type, document_name, document_url, uploaded_by) VALUES
(1, 'PURCHASE', 'BUS-001 Purchase Order', '/docs/assets/BUS-001-PO.pdf', 1),
(1, 'WARRANTY', 'BUS-001 Warranty Certificate', '/docs/assets/BUS-001-WARRANTY.pdf', 1),
(9, 'PURCHASE', 'EV Bus Purchase Order', '/docs/assets/BUS-009-PO.pdf', 1),
(9, 'WARRANTY', 'Olectra 6-Year Warranty', '/docs/assets/BUS-009-WARRANTY.pdf', 1),
(9, 'SERVICE', 'EV Bus Service Contract', '/docs/assets/BUS-009-SERVICE.pdf', 2),
(14, 'PURCHASE', 'Charger Purchase Invoice', '/docs/assets/CHG-001-INVOICE.pdf', 1),
(14, 'WARRANTY', 'Delta Charger Warranty', '/docs/assets/CHG-001-WARRANTY.pdf', 1),
(37, 'PURCHASE', 'Vehicle Lift Purchase Order', '/docs/assets/DEQ-001-PO.pdf', 1),
(34, 'SERVICE', 'Generator Annual Service Record 2026', '/docs/assets/GEN-001-SERVICE-2026.pdf', 4),
(43, 'INSPECTION', 'Electrical Panel Inspection Report', '/docs/assets/ELC-001-INSPECTION.pdf', 7);

-- ALERTS
INSERT INTO alerts (asset_id, alert_type, severity, title, message, is_read) VALUES
(2, 'MAINTENANCE_CRITICAL', 'CRITICAL', 'Critical Maintenance - BUS-002', 'Engine overhaul in progress on BUS-002. Vehicle off-road.', 0),
(12, 'MAINTENANCE_HIGH', 'HIGH', 'Maintenance Required - Electric Bus 04', 'BMS fault on BUS-012. Battery management system repair assigned.', 0),
(17, 'MAINTENANCE_HIGH', 'HIGH', 'Charging Station Offline - CHG-004', 'EV Charging Station 04 is under maintenance due to connector fault.', 0),
(4, 'ASSET_RETIRED', 'INFO', 'Asset Retired - BUS-004', 'TATA Diesel Bus 04 has been retired after reaching end of service life.', 1),
(23, 'WARRANTY_EXPIRED', 'WARNING', 'Warranty Expired - CAM-005', 'Warranty on CCTV Camera East Depot expired on 2025-11-05.', 0),
(28, 'WARRANTY_EXPIRED', 'WARNING', 'Warranty Expired - TKT-004', 'Ticketing Machine 04 warranty expired 2025-09-01.', 0),
(34, 'WARRANTY_EXPIRED', 'WARNING', 'Warranty Expired - GEN-001', 'Power Generator at Central Depot warranty expired 2024-05-10.', 0),
(7, 'INSPECTION_ATTENTION', 'HIGH', 'Inspection Attention Required - BUS-007', 'Steering play above tolerance detected during inspection.', 0),
(22, 'INSPECTION_FAILED', 'HIGH', 'Inspection Failed - CAM-004', 'CCTV Camera South Depot failed inspection. IR illuminator failure.', 0),
(NULL, 'MAINTENANCE_PENDING', 'WARNING', '3 Inspections Overdue This Month', 'Assets CAM-004, GEN-001, ELC-001 have overdue inspections.', 0),
(3, 'TRANSFER_PENDING', 'INFO', 'Transfer Request Pending - BUS-003', 'Transfer request for BUS-003 awaiting admin approval.', 0),
(8, 'TRANSFER_APPROVED', 'INFO', 'Transfer Approved - TKT-002', 'Transfer of Ticketing Machine 02 to East Depot has been approved.', 1);

-- AUDIT LOGS
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at) VALUES
(1, 'USER_LOGIN', 'auth', NULL, NULL, JSON_OBJECT('email', 'admin@transitasset.local'), '192.168.1.10', '2026-09-28 08:00:00'),
(2, 'USER_LOGIN', 'auth', NULL, NULL, JSON_OBJECT('email', 'manager.central@transitasset.local'), '192.168.1.11', '2026-09-28 08:05:00'),
(1, 'ASSET_CREATED', 'assets', 44, NULL, JSON_OBJECT('asset_code', 'PID-001', 'name', 'Passenger Information Display 01'), '192.168.1.10', '2026-09-01 10:00:00'),
(1, 'ASSET_STATUS_CHANGED', 'assets', 4, JSON_OBJECT('status', 'OPERATIONAL'), JSON_OBJECT('status', 'RETIRED'), '192.168.1.10', '2026-09-01 10:30:00'),
(2, 'MAINTENANCE_CREATED', 'maintenance_requests', 1, NULL, JSON_OBJECT('asset_id', 2, 'title', 'Engine Overhaul Required', 'priority', 'CRITICAL'), '192.168.1.11', '2026-09-01 09:00:00'),
(1, 'MAINTENANCE_ASSIGNED', 'maintenance_requests', 1, JSON_OBJECT('status', 'OPEN'), JSON_OBJECT('status', 'ASSIGNED', 'technician_id', 4), '192.168.1.10', '2026-09-01 11:00:00'),
(4, 'MAINTENANCE_STARTED', 'maintenance_requests', 1, JSON_OBJECT('status', 'ASSIGNED'), JSON_OBJECT('status', 'IN_PROGRESS'), '192.168.1.14', '2026-09-05 08:00:00'),
(1, 'TRANSFER_CREATED', 'asset_transfers', 7, NULL, JSON_OBJECT('asset_id', 3, 'status', 'REQUESTED'), '192.168.1.10', '2026-09-20 10:00:00'),
(1, 'TRANSFER_APPROVED', 'asset_transfers', 8, JSON_OBJECT('status', 'REQUESTED'), JSON_OBJECT('status', 'APPROVED'), '192.168.1.10', '2026-09-15 11:00:00'),
(1, 'INSPECTION_CREATED', 'inspections', 12, NULL, JSON_OBJECT('asset_id', 22, 'result', 'FAIL'), '192.168.1.16', '2026-09-20 11:00:00'),
(1, 'ASSET_UPDATED', 'assets', 12, JSON_OBJECT('location_id', 1), JSON_OBJECT('location_id', 2), '192.168.1.10', '2026-08-05 14:00:00');

SET FOREIGN_KEY_CHECKS = 1;
