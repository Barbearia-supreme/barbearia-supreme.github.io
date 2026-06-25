# 💈 Barbearia Supreme - Sistema de Agendamento Online

> Uma solução simples, rápida e intuitiva para clientes agendarem cortes de cabelo e barbeiros gerenciarem sua agenda diária sem perda de tempo.

O projeto elimina a necessidade de conversas demoradas por WhatsApp para consultar horários disponíveis. O cliente acessa, escolhe o serviço, visualiza a foto do barbeiro e agenda em segundos.

## 🚀 Funcionalidades

### 📱 Para o Cliente:
* **Interface Intuitiva:** Processo de agendamento simples e direto.
* **Escolha de Profissional:** Visualização do nome e foto do barbeiro de preferência.
* **Verificação de Disponibilidade:** Exibição apenas dos dias e horários livres.
* **Identificação Rápida:** Cadastro simplificado com apenas nome e celular.

### 💼 Para o Barbeiro (Painel Administrativo):
* **Autenticação Segura:** Login exclusivo para os profissionais da barbearia.
* **Agenda do Dia:** Visualização clara do nome do cliente, celular, serviço, data e hora.
* **Notificação Instantânea:** Assim que o cliente clica em agendar, o barbeiro recebe uma mensagem de confirmação no seu WhatsApp.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 e JavaScript (Vanilla)
* **Backend como Serviço (BaaS):** Firebase
  * **Firestore Database:** Armazenamento de agendamentos e horários em tempo real.
  * **Authentication:** Controle de acesso seguro para o painel do administrador.
* **Integrações:**  Redirecionamento via Link Direto (WhatsApp Deep Linking) de forma gratuita.
## 📋 Pré-requisitos

Para rodar este projeto localmente, você precisará de:
* Um navegador web atualizado (Chrome, Edge, Firefox, etc.).
* Uma conta no **Firebase** para configurar o banco de dados.

## 🔧 Instalação e Configuração

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/jtovarmorales93/Barbearia-Supreme.git
   ```

2. 2. **Configure o Firebase:**
   * Cria um projeto lá no console do Firebase.
   * Ativa o *Firestore Database* e o *Authentication*.
   * chaves de acesso direto no teu arquivo JavaScript para conectar com o banco de dados:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyBUfamPSEoP3qIy_MUifGR1X2ZBtyqz_tQ",
     authDomain: "barberia-bunny-c0486.firebaseapp.com",
     projectId: "barberia-bunny-c0486",
     storageBucket: "barberia-bunny-c0486.firebasestorage.app",
     messagingSenderId: "240230509007",
     appId: "1:240230509007:web:82c6e08b72276ce35d4aba"
   };
   ```


3. **Execução:**
   * Abra o arquivo `index.html` diretamente no seu navegador ou utilize uma extensão como o *Live Server* no VS Code.

## ✒️ Autor

* **jose tovar** - *Desenvolvedor junior* - https://github.com/jtovarmorales93
