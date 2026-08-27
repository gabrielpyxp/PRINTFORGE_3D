-- 002: permite Base64 gigante em produtos.imagem_url
ALTER TABLE produtos ALTER COLUMN imagem_url TYPE TEXT;
-- garante índice ainda válido (TEXT não precisa de limite)
