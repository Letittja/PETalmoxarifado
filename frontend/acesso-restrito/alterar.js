// === UTILITÁRIOS ===

// Função auxiliar para ler parâmetros da URL (ex: ?id=123)
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Preenche o campo oculto de ID do usuário caso venha na URL
const userId = getQueryParam('id');
if (userId) {
    const userIdInput = document.getElementById('user-id');
    if (userIdInput) userIdInput.value = userId;
} else {
    console.warn('Nenhum ID de usuário detectado na URL.');
}

// === FUNCIONALIDADE: ADICIONAR ITEM ===
document.getElementById("add-item-btn").addEventListener("click", function (event) {
    event.preventDefault(); // Evita o reload da página pelo formulário

    const itemName = document.getElementById("item-name").value;
    const itemDescription = document.getElementById("item-description").value;
    
    // Definição de valores padrão para chaves estrangeiras (API exige IDs numéricos)
    const categoriaId = 1; 
    const localId = 1;     

    if (itemName && itemDescription) {
        // Monta o objeto (payload) conforme esperado pelo Banco de Dados
        const data = {
            nome: itemName,
            descricao: itemDescription,
            categoria_id: categoriaId,
            local_id: localId
        };

        // Envia requisição POST para a API (Porta 3001)
        fetch("http://localhost:3001/itens", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) throw new Error('Falha na comunicação com a API.');
            return response.json();
        })
        .then(data => {
            alert("Item cadastrado com sucesso!");
            document.getElementById("add-item-form").reset();
        })
        .catch(error => {
            console.error("Erro no cadastro:", error);
            alert("Erro de conexão. Verifique se o serviço de backend está ativo na porta 3001.");
        });
    } else {
        alert("Os campos Nome e Descrição são obrigatórios.");
    }
});

// === FUNCIONALIDADE: DELETAR ITEM ===
document.getElementById("delete-item-btn").addEventListener("click", function (event) {
    event.preventDefault();
    const itemId = document.getElementById("item-id").value;

    if (itemId) {
        // Envia requisição DELETE para a rota específica do ID
        fetch(`http://localhost:3001/itens/${itemId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao tentar excluir o item.');
            // Trata status 204 (Sucesso sem conteúdo) ou converte resposta para JSON
            return response.status === 204 ? {} : response.json();
        })
        .then(data => {
            alert("Item removido com sucesso!");
            document.getElementById("delete-item-form").reset();
        })
        .catch(error => {
            console.error("Erro na exclusão:", error);
            alert("Não foi possível deletar. Verifique se o ID é válido.");
        });
    } else {
        alert("Informe um ID válido para exclusão.");
    }
});

// === FUNCIONALIDADE: RETIRAR ITEM (ESTOQUE) ===
document.getElementById("retirar-item-btn").addEventListener("click", function (event) {
    event.preventDefault();
    
    // Bloqueio temporário: A API atual suporta apenas Itens de Patrimônio (bens únicos).
    // A lógica de controle de estoque (quantidades) ainda será implementada.
    alert("Funcionalidade em desenvolvimento: O backend aguarda implementação da tabela de movimentações.");
    
    /* LÓGICA PRESERVADA PARA FUTURA IMPLEMENTAÇÃO:
    const itemNameCode = document.getElementById("item-name-code").value.trim();
    const itemQuantity = parseInt(document.getElementById("item-quantity-retirar").value);

    if (itemNameCode && itemQuantity > 0) {
        const data = {
            item_id: itemNameCode, 
            quantidade: itemQuantity,
            tipo: 'SAIDA'
        };

        fetch("http://localhost:3001/movimentacoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => alert("Retirada registrada!"))
        .catch(error => alert("Erro ao registrar retirada."));
    }
    */
});