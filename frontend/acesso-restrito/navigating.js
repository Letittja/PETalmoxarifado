document.addEventListener("DOMContentLoaded", () => {
    // Mapeamento: ID do Botão -> ID da Div de Conteúdo
    const navItems = {
        "show_home": "home_content",
        "show_user": "user_content",
        "show_stock": "stock_content",
        "show_manage_inventory": "manage_content",
        "show_request": "request_content",
    };

    // Configuração dos cliques no menu
    Object.keys(navItems).forEach((menuId) => {
        const menuItem = document.getElementById(menuId);
        const contentId = navItems[menuId];

        if (menuItem) {
            menuItem.addEventListener("click", async (e) => {
                e.preventDefault();

                // 1. Esconde todas as telas
                Object.values(navItems).forEach((id) => {
                    const content = document.getElementById(id);
                    if (content) content.style.display = "none";
                });

                // 2. Mostra a tela selecionada
                const contentToShow = document.getElementById(contentId);
                if (contentToShow) {
                    contentToShow.style.display = "block";

                    // 3. Carrega os dados específicos daquela tela
                    if (menuId === "show_user") {
                        await loadUsers();
                    }
                    else if (menuId === "show_stock") {
                        await loadStock(); // Agora busca os itens do Backend da Sofia
                    }
                    else if (menuId === "show_request") {
                        await loadRequests();
                    }
                }
            });
        }
    });

    // ==========================================================
    // FUNÇÃO: Carregar Usuários
    // NOTA: O backend atual (3001) ainda NÃO tem rota /usuarios
    // ==========================================================
    async function loadUsers() {
        const membrosList = document.getElementById("user_select");
        membrosList.innerHTML = "<p>Carregando...</p>";

        try {
            // Tentativa de conexão na porta 3001
            const response = await fetch("http://localhost:3001/usuarios"); 
            if (!response.ok) throw new Error("Rota de usuários ainda não implementada no backend.");

            const membros = await response.json();

            membrosList.innerHTML = `
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Nome</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    ${membros.map((membro) => `
                        <tr>
                            <td>${membro.id}</td>
                            <td>${membro.username}</td>
                            <td>${membro.name}</td>
                            <td>${membro.type}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
        } catch (error) {
            console.warn("Aviso:", error.message);
            membrosList.innerHTML = "<p><em>Funcionalidade indisponível: Backend ainda não possui cadastro de usuários.</em></p>";
        }
    }

    // ==========================================================
    // FUNÇÃO: Adicionar Usuário (Formulário)
    // ==========================================================
    const userForm = document.getElementById("add_user_form");
    if (userForm) {
        userForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            alert("Backend ainda não suporta criação de usuários.");
            /*
            // Código preservado para futuro:
            const username = document.getElementById("username").value;
            // ... logica de fetch para porta 3001 ...
            */
        });
    }

    // ==========================================================
    // FUNÇÃO: Carregar Estoque (ITENS DE PATRIMÔNIO)
    // Conectado ao backend da Sofia (/itens)
    // ==========================================================
    async function loadStock() {
        const stock_table = document.getElementById("stock_select");
        stock_table.innerHTML = "<p>Buscando itens no servidor...</p>";
        
        try {
            // Rota correta do serviço de patrimônio
            const response = await fetch("http://localhost:3001/itens");
            
            if (!response.ok) throw new Error("Erro ao conectar com serviço de Itens.");
            
            const estoque = await response.json();
            
            // Renderiza a tabela
            show_stock_table(estoque);

            // Configuração do Filtro
            const filterButton = document.getElementById("filter_button");
            // Removemos event listeners antigos para não duplicar (cloneNode)
            if (filterButton) {
                const newBtn = filterButton.cloneNode(true);
                filterButton.parentNode.replaceChild(newBtn, filterButton);
                
                newBtn.addEventListener("click", () => {
                    const filterType = document.getElementById("filter_type").value; // ex: 'nome'
                    const filterValue = document.getElementById("filter_input").value.toLowerCase();

                    const filteredItems = estoque.filter(item => {
                        // Proteção caso o campo seja nulo
                        const val = item[filterType] ? item[filterType].toString().toLowerCase() : "";
                        return val.includes(filterValue);
                    });
                    show_stock_table(filteredItems);
                });
            }
        } catch (error) {
            console.error("Erro no Estoque:", error);
            stock_table.innerHTML = `<p style="color:red">Erro ao carregar itens. Verifique se o Docker está rodando na porta 3001.</p>`;
        }
    }

    // Renderiza a tabela de itens (Adaptada para os campos do Backend)
    function show_stock_table(listaItens){
        const stock_table = document.getElementById("stock_select");

        // Cabeçalho ajustado: Sai 'Quantidade', Entra 'Local' e 'Categoria'
        let tableHTML = `
                <h3>Lista de Patrimônio</h3>
                <table border="1" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Categoria</th>
                            <th>Local</th>
                            <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (listaItens.length === 0) {
                tableHTML += `<tr><td colspan="5">Nenhum item encontrado.</td></tr>`;
            } else {
                listaItens.forEach(item => {
                    // O Backend retorna: id, nome, descricao, categoria (nome), local (nome)
                    tableHTML += `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.nome}</td> 
                            <td>${item.categoria || '-'}</td>
                            <td>${item.local || '-'}</td>
                            <td>${item.descricao}</td>
                        </tr>
                    `;
                });
            }

            tableHTML += "</tbody></table>";
            stock_table.innerHTML = tableHTML;
    }

    // ==========================================================
    // FUNÇÃO: Carregar Pedidos/Empréstimos
    // NOTA: Backend ainda não tem tabela de pedidos
    // ==========================================================
    async function loadRequests() {
        const request_table = document.getElementById("pedidos-tabela");
        // Verifica se a tabela existe antes de tentar limpar
        if(!request_table) return;

        const tbody = request_table.getElementsByTagName('tbody')[0];
        if(tbody) tbody.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

        try {
            // Rota hipotética
            const response = await fetch("http://localhost:3001/pedidos");
            if (!response.ok) throw new Error("Rota de pedidos inexistente.");
            
            const pedidos = await response.json();
            show_requests_table(pedidos);

        } catch (error) {
            console.warn("Pedidos indisponíveis:", error);
            if(tbody) tbody.innerHTML = "<tr><td colspan='5'><em>Funcionalidade em desenvolvimento (Backend pendente).</em></td></tr>";
        }
    }

    function show_requests_table(pedidos) {
        const request_table = document.getElementById("pedidos-tabela");
        if(!request_table) return;
        const tbody = request_table.getElementsByTagName('tbody')[0];

        let html = '';
        pedidos.forEach(pedido => {
            html += `
                <tr>
                    <td>${pedido.id}</td>
                    <td>${pedido.usuario_id}</td>
                    <td>${pedido.item_id}</td>
                    <td>1</td>
                    <td>${pedido.data_saida}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }
});