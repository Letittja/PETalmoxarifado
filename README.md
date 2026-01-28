# Almoxarifado PET: Sistema Distribuído

Este é o repositório central do sistema de gestão de almoxarifado da **PET C3**. O projeto foi migrado para uma arquitetura de **microsserviços distribuídos**, utilizando Docker para garantir que todos os desenvolvedores trabalhem no mesmo ambiente.

[Image of microservices architecture with an API Gateway and independent services]

## Arquitetura do Sistema

O projeto utiliza um modelo de **Monorepo**, onde cada serviço vive em sua própria pasta, mas todos são orquestrados pelo Docker:

| Serviço | Porta Interna | Descrição |
| :--- | :--- | :--- |
| **Gateway** | `80` | Ponto de entrada único (Nginx) que redireciona para as APIs. |
| **Patrimônio** | `3001` | Responsável pelo cadastro de itens e controle de estoque. |
| **Empréstimo** | `3002` | Responsável pelo fluxo de saída e devolução de materiais. |
| **Frontend** | `5173` | Interface web para interação com o usuário. |

---

## Tecnologias Principais

* **Linguagem:** Node.js (Express)
* **Banco de Dados:** PostgreSQL (hospedado no **Supabase**)
* **Mensageria:** RabbitMQ (via **CloudAMQP**)
* **Orquestração:** Docker & Docker Compose

## Como Rodar o Projeto

Para rodar o sistema completo na sua máquina, siga os passos abaixo:

### 1. Pré-requisitos
Certifique-se de ter instalado:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Obrigatório)
* [Node.js LTS](https://nodejs.org/)
* [Git](https://git-scm.com/)

### 2. Configuração do Arquivo `.env`
O arquivo de variáveis de ambiente contém senhas sensíveis e **não é enviado ao GitHub**. 
1. Na raiz do projeto, crie um arquivo chamado `.env`.
2. Solicite as chaves de acesso ao responsável pela infraestrutura e cole-as no arquivo.

### 3. Inicialização
Abra o terminal na pasta raiz do projeto e execute:
```bash
docker compose up --build
