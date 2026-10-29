-- EEMTI DRAGÃO DO MAR — evidências fotográficas de ocorrências
-- Execute no Supabase SQL Editor.

ALTER TABLE public.ocorrencias
  ADD COLUMN IF NOT EXISTS fotos JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Bucket PRIVADO para fotografias de evidência.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ocorrencias-evidencias',
  'ocorrencias-evidencias',
  false,
  12582912,
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 12582912,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif'];

-- As políticas abaixo restringem cada pasta ao ID do usuário autenticado.
-- O app armazena arquivos no padrão: <auth.uid>/<registro>/<foto>.jpg
DROP POLICY IF EXISTS "ocorrencias evidencias ler pasta propria" ON storage.objects;
CREATE POLICY "ocorrencias evidencias ler pasta propria"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'ocorrencias-evidencias'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "ocorrencias evidencias enviar pasta propria" ON storage.objects;
CREATE POLICY "ocorrencias evidencias enviar pasta propria"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'ocorrencias-evidencias'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "ocorrencias evidencias apagar pasta propria" ON storage.objects;
CREATE POLICY "ocorrencias evidencias apagar pasta propria"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'ocorrencias-evidencias'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Atenção: políticas RLS da tabela public.ocorrencias são independentes.
-- Preserve e revise as políticas existentes dessa tabela. Não desligue RLS.
