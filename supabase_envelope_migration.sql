-- Migration: add envelope/convite digital fields to site_configs
ALTER TABLE site_configs
  ADD COLUMN IF NOT EXISTS envelope_enabled  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS envelope_color    text    DEFAULT '#4A5E3A',
  ADD COLUMN IF NOT EXISTS seal_color        text    DEFAULT '#D4C5A0',
  ADD COLUMN IF NOT EXISTS seal_monogram_url text;
