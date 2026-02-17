-- services/emprestimo-service/schema_emprestimo.sql
-- PostgreSQL - Schema do microserviço de empréstimo

CREATE SCHEMA IF NOT EXISTS emprestimo;

CREATE TABLE IF NOT EXISTS emprestimo.emprestimo (
    n_protocolo BIGSERIAL PRIMARY KEY,

    matricula INTEGER NOT NULL,
    cod_patrimonio VARCHAR(20) NOT NULL,

    data_saida DATE NOT NULL,
    data_retorno DATE NOT NULL,

    CONSTRAINT chk_datas_validas
        CHECK (data_retorno >= data_saida)
);

CREATE INDEX IF NOT EXISTS idx_emprestimo_matricula
ON emprestimo.emprestimo(matricula);

CREATE INDEX IF NOT EXISTS idx_emprestimo_cod_patrimonio
ON emprestimo.emprestimo(cod_patrimonio);

CREATE OR REPLACE FUNCTION emprestimo.verificar_disponibilidade()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM emprestimo.emprestimo e
        WHERE e.cod_patrimonio = NEW.cod_patrimonio
          AND (NEW.data_saida <= e.data_retorno AND NEW.data_retorno >= e.data_saida)
    ) THEN
        RAISE EXCEPTION 'Patrimônio já está emprestado neste período';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verificar_disponibilidade ON emprestimo.emprestimo;
CREATE TRIGGER trigger_verificar_disponibilidade
BEFORE INSERT ON emprestimo.emprestimo
FOR EACH ROW
EXECUTE FUNCTION emprestimo.verificar_disponibilidade();