# 🌱 Semeia+ — Plataforma Digital para Gestão de Demandas de Sementes
Sistema web responsivo para cadastro, acompanhamento, expedição e transparência de solicitações de sementes destinadas à agricultura familiar.
Desenvolvido com foco em usabilidade, rastreabilidade (QR Code), inclusão digital, gestão eficiente e controle de processos por diferentes perfis de usuário.

🚀 Objetivos do Sistema

✔ Automatizar o processo de solicitação de sementes
✔ Garantir acompanhamento eficiente do status da demanda
✔ Permitir rastreamento via QR Code
✔ Oferecer portal de transparência pública
✔ Gerar relatórios em PDF com histórico de entregas
✔ Melhorar a experiência do usuário (UX) e acessibilidade

👥 Perfis de Usuários
Perfil	Funções permitidas
Agricultor	Cadastrar pedidos, visualizar status, cancelar antes da análise, histórico próprio
Cooperativa	Mesmas funções do agricultor, com visão de pedidos vinculados à cooperativa
Administrador	Acompanhar todos os pedidos, alterar status, excluir registros, gerar relatórios
Público Geral	Acessar portal de transparência com histórico de entregas finalizadas
🗂 Principais Funcionalidades

✨ Login com perfis diferentes e mensagens personalizadas
✨ Cadastro de demanda com campos de observação
✨ Acompanhamento filtro por status e data
✨ Rastreamento automático via QR Code para cada pedido
✨ Relatórios em PDF e histórico para administradores
✨ Portal de Transparência aberto ao público
✨ Página "Quem Somos" e "Perfil do Usuário"

🛠 Tecnologias Utilizadas
Camada	Tecnologias
Front-end	HTML5, CSS3, JavaScript (puro), QRious.js, html2pdf.js
Armazenamento Local	LocalStorage (dados mockados)
Design Responsivo	Flexbox, Grid e boas práticas de UX/UI
Estruturação	Organização modular por páginas, scripts e estilos separados
📸 Estrutura de Telas (Front-End)
/index.html                 → Login
/cadastro-usuario.html      → Cadastro de usuário  
/cadastro.html              → Cadastro de demanda  
/acompanhamento.html        → Acompanhamento e gestão dos pedidos  
/portal-transparencia.html  → Histórico público de entregas  
/perfil.html                → Dados do usuário logado  
/quem-somos.html            → Informações sobre o Semeia+  
/style.css                  → Estilização global  
/main.js                    → Lógica e funções principais
/script.js                  → Funções auxiliares

▶ Como Executar o Projeto
🔘 Simples (local)

Baixe ou clone o repositório

Abra index.html no navegador

Inicie pelo login → admin/admin (modo administrador)

Explore todos os fluxos do sistema

🔌 Via Live Server (VSCode recomendado)

Clique com o botão direito em index.html → Open with Live Server

🧪 Testes de Usabilidade (planejados)

Teste com usuários reais (agricultores, técnicos e gestores)

Teste de usabilidade baseado em SUS (System Usability Scale)

Coleta via Microsoft Forms com métricas de tempo, cliques, erros e satisfação

💡 Possibilidades Futuras

🔹 Integração com banco de dados real (Firebase ou Supabase)
🔹 Módulo mobile com PWA
🔹 Assinatura digital no laudo de confirmação
🔹 API para expedição e logística de entrega

👨‍👩‍👧 Público-Alvo

Agricultores familiares

Cooperativas rurais

Técnicos do IPA

Gestores públicos

Comunidade (transparência)

📄 Licença

Este projeto está sob licença MIT — livre para uso acadêmico e social.

🤝 Colaboração

Sugestões, melhorias e contribuições são muito bem-vindas!
Faça um pull request ou abra uma issue.

✨ Semeia+: Porque semear é mais que plantar — é gerar futuro. 🌾
