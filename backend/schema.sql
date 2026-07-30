-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- BEFORE starting the backend for the first time.
--
-- SQLAlchemy's Base.metadata.create_all() (called in main.py) will create all
-- the actual tables. It will NOT create this extension, so that part has to
-- happen here first, or every request touching the `chunks` table will fail
-- with "type vector does not exist".

create extension if not exists vector;