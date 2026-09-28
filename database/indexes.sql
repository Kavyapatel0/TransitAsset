-- TransitAsset Database Indexes
-- Run after schema.sql

USE transitasset;

-- Assets indexes
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_asset_type ON assets(asset_type);
CREATE INDEX idx_assets_location ON assets(location_id);
CREATE INDEX idx_assets_department ON assets(department_id);
CREATE INDEX idx_assets_custodian ON assets(custodian_id);
CREATE INDEX idx_assets_warranty_expiry ON assets(warranty_expiry);
CREATE INDEX idx_assets_next_inspection ON assets(next_inspection_date);
CREATE INDEX idx_assets_condition ON assets(`condition`);
CREATE INDEX idx_assets_ownership ON assets(ownership_type);
CREATE INDEX idx_assets_created ON assets(created_at);

-- Asset lifecycle indexes
CREATE INDEX idx_lifecycle_asset ON asset_lifecycle(asset_id);
CREATE INDEX idx_lifecycle_performed_by ON asset_lifecycle(performed_by);
CREATE INDEX idx_lifecycle_created ON asset_lifecycle(created_at);

-- Maintenance indexes
CREATE INDEX idx_maint_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_maint_status ON maintenance_requests(status);
CREATE INDEX idx_maint_priority ON maintenance_requests(priority);
CREATE INDEX idx_maint_technician ON maintenance_requests(assigned_technician);
CREATE INDEX idx_maint_reported_at ON maintenance_requests(reported_at);

-- Inspection indexes
CREATE INDEX idx_insp_asset ON inspections(asset_id);
CREATE INDEX idx_insp_date ON inspections(inspection_date);
CREATE INDEX idx_insp_next_date ON inspections(next_inspection_date);
CREATE INDEX idx_insp_result ON inspections(result);

-- Transfer indexes
CREATE INDEX idx_transfer_asset ON asset_transfers(asset_id);
CREATE INDEX idx_transfer_status ON asset_transfers(status);
CREATE INDEX idx_transfer_from ON asset_transfers(from_location_id);
CREATE INDEX idx_transfer_to ON asset_transfers(to_location_id);
CREATE INDEX idx_transfer_requested_by ON asset_transfers(requested_by);

-- Alert indexes
CREATE INDEX idx_alerts_asset ON alerts(asset_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created ON alerts(created_at);

-- Audit log indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- User indexes
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_location ON users(location_id);
CREATE INDEX idx_users_department ON users(department_id);
