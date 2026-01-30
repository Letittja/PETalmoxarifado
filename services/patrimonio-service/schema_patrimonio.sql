-- cria uma tabela chamada categorias
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY, -- cada linha é única
    nome VARCHAR(50) NOT NULL
);

-- tabela com os locais (armário, gaveta etc)
CREATE TABLE locais (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nome VARCHAR(50) NOT NULL
);

-- tabela de itens
CREATE TABLE itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    categoria_id INT, -- ligar o item com a categoria
    local_id INT NOT NULL, -- ligar o item com o local

    -- chaves estrangeiras
    CONSTRAINT fk_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id),

    CONSTRAINT fk_local
        FOREIGN KEY (local_id)
        REFERENCES locais(id)
);
