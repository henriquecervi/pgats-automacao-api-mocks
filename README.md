# 🏦 Banco API

API REST desenvolvida em JavaScript com Express para operações bancárias básicas. Esta API foi criada especificamente para aprendizado de testes e automação a nível de API.

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Endpoints](#endpoints)
- [Regras de Negócio](#regras-de-negócio)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Exemplos de Uso](#exemplos-de-uso)
- [Testes](#testes)
- [Documentação](#documentação)

## ✨ Características

- ✅ **Autenticação JWT** - Login seguro com tokens
- ✅ **Registro de usuários** - Criação de novas contas
- ✅ **Consulta de usuários** - Listagem e busca de usuários
- ✅ **Transferências** - Sistema de transferência entre contas
- ✅ **Extrato bancário** - Histórico de transações
- ✅ **Lista de favorecidos** - Gerenciamento de contatos favoritos
- ✅ **Consulta de saldo** - Verificação de saldo atual
- ✅ **Documentação Swagger** - API totalmente documentada
- ✅ **Validação de dados** - Validação robusta de entrada
- ✅ **Arquitetura em camadas** - Controller, Service, Repository
- ✅ **Banco em memória** - Dados armazenados em variáveis

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **JWT** - Autenticação com tokens
- **bcryptjs** - Criptografia de senhas
- **Swagger** - Documentação da API
- **express-validator** - Validação de dados
- **Mocha** - Framework de testes
- **Chai** - Biblioteca de assertions
- **Sinon** - Mocks e stubs
- **Supertest** - Testes de API

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🚀 Instalação

1. **Clone o repositório ou extraia os arquivos:**
   ```bash
   cd banco-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
   # Modo de desenvolvimento (com nodemon)
   npm run dev

   # Modo de produção
   npm start
   ```

4. **Acesse a API:**
   - Servidor: http://localhost:3000
   - Documentação: http://localhost:3000/api-docs
   - Status: http://localhost:3000/health

## ⚙️ Configuração

### Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
JWT_SECRET=seu-jwt-secret-aqui
```

### Dados Iniciais

A API inicia com dois usuários de exemplo:

| Username | Password | Email | Saldo | Favorecidos |
|----------|----------|-------|--------|-------------|
| admin | password | admin@example.com | R$ 10.000,00 | [user1] |
| user1 | password | user1@example.com | R$ 5.000,00 | [] |

## 📖 Uso

### 1. Registro de Usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "novouser",
    "password": "senha123",
    "email": "novo@email.com"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

### 3. Usar Token de Autenticação

```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
```

## 🛣️ Endpoints

### 🔐 Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrar novo usuário | ❌ |
| POST | `/auth/login` | Fazer login | ❌ |
| GET | `/auth/verify` | Verificar token | ✅ |

### 👥 Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/users` | Listar todos os usuários | ✅ |
| GET | `/users/me` | Dados do usuário logado | ✅ |
| GET | `/users/:id` | Buscar usuário por ID | ✅ |
| PUT | `/users/:id` | Atualizar dados do usuário | ✅ |
| GET | `/users/saldo` | Consultar saldo | ✅ |
| POST | `/users/favorecidos` | Adicionar favorecido | ✅ |
| DELETE | `/users/favorecidos/:id` | Remover favorecido | ✅ |

### 💰 Transações

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/transactions/transfer` | Realizar transferência | ✅ |
| GET | `/transactions/extrato` | Consultar extrato | ✅ |
| GET | `/transactions/:id` | Buscar transação por ID | ✅ |
| GET | `/transactions` | Listar todas as transações | ✅ |
| GET | `/transactions/stats` | Estatísticas das transações | ✅ |

### 📊 Sistema

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/health` | Status da API | ❌ |
| GET | `/api-docs` | Documentação Swagger | ❌ |
| GET | `/swagger.json` | JSON do Swagger | ❌ |

## ⚖️ Regras de Negócio

### 🔐 Autenticação e Registro
1. **Login obrigatório**: Username e password são obrigatórios para fazer login
2. **Usuários únicos**: Não é possível registrar usuários com username ou email duplicados
3. **Senha segura**: Senhas são criptografadas com bcrypt
4. **Token JWT**: Autenticação via token JWT com expiração de 24 horas

### 💸 Transferências
1. **Limite para não favorecidos**: Transferências para usuários que não estão marcados como "favorecidos" são limitadas a **R$ 5.000,00**
2. **Saldo suficiente**: O usuário deve ter saldo suficiente para realizar a transferência
3. **Destinatário válido**: O destinatário deve existir no sistema
4. **Autotransferência**: Não é possível transferir para si mesmo

### 👥 Usuários
1. **Saldo inicial**: Novos usuários começam com R$ 1.000,00
2. **Favorecidos**: Usuários podem gerenciar sua lista de favorecidos
3. **Dados sensíveis**: Senhas nunca são retornadas nas respostas da API

## 📁 Estrutura do Projeto

```
banco-api/
├── 📁 config/
│   └── database.js          # Configuração do banco em memória
├── 📁 controllers/
│   ├── authController.js    # Controller de autenticação
│   ├── userController.js    # Controller de usuários
│   └── transactionController.js # Controller de transações
├── 📁 services/
│   ├── authService.js       # Lógica de autenticação
│   ├── userService.js       # Lógica de usuários
│   └── transactionService.js # Lógica de transações
├── 📁 repositories/
│   ├── userRepository.js    # Acesso a dados de usuários
│   └── transactionRepository.js # Acesso a dados de transações
├── app.js                   # Configuração da aplicação Express
├── server.js               # Servidor HTTP
├── package.json            # Dependências e scripts
└── README.md              # Este arquivo
```

## 💡 Exemplos de Uso

### Fluxo Completo de Uso

1. **Registrar um novo usuário:**

```javascript
const response = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'test123',
    email: 'test@email.com'
  })
});
```

2. **Fazer login:**

```javascript
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'test123'
  })
});

const { token } = await loginResponse.json();
```

3. **Consultar saldo:**

```javascript
const balanceResponse = await fetch('http://localhost:3000/users/saldo', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

4. **Realizar transferência:**

```javascript
const transferResponse = await fetch('http://localhost:3000/transactions/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    destinatarioId: 2,
    valor: 100.50,
    descricao: 'Pagamento de serviços'
  })
});
```

5. **Consultar extrato:**

```javascript
const extratoResponse = await fetch('http://localhost:3000/transactions/extrato?limit=5', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🧪 Testes

Esta API usa **Mocha** como framework de testes, **Chai** para assertions, **Sinon** para mocks/stubs e **Supertest** para testes de API. O arquivo `app.js` exporta a aplicação Express sem o método `listen()`, permitindo testes isolados.

### Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm run test:controllers    # Testes dos controllers
npm run test:services       # Testes dos serviços (com Sinon)
npm run test:integration   # Testes de integração
npm run test:system        # Testes do sistema
```

### Exemplo de Teste

```javascript
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('./app');

describe('Auth Endpoints', () => {
  afterEach(() => {
    sinon.restore(); // Importante: sempre limpar mocks/stubs
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'test123',
        email: 'test@email.com'
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('user');
  });
});
```

## 📚 Documentação

### Swagger UI

Acesse a documentação interativa da API em: **http://localhost:3000/api-docs**

A documentação Swagger inclui:
- ✅ Todos os endpoints disponíveis
- ✅ Esquemas de request/response
- ✅ Exemplos de uso
- ✅ Códigos de status HTTP
- ✅ Modelos de dados
- ✅ Interface para testar a API

### JSON Schema

O esquema JSON do Swagger está disponível em: **http://localhost:3000/swagger.json**

## 🚨 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | ✅ Sucesso |
| 201 | ✅ Recurso criado |
| 400 | ❌ Dados inválidos |
| 401 | ❌ Não autorizado |
| 403 | ❌ Acesso negado |
| 404 | ❌ Recurso não encontrado |
| 500 | ❌ Erro interno do servidor |

## 🔧 Troubleshooting

### Problemas Comuns

1. **Porta 3000 já está em uso:**
   ```bash
   # Use uma porta diferente
   PORT=3001 npm start
   ```

2. **Token JWT inválido:**
   - Verifique se o token está sendo enviado no header `Authorization: Bearer <token>`
   - Tokens expiram em 24 horas, faça login novamente

3. **Transferência negada:**
   - Verifique se o destinatário existe
   - Confirme se há saldo suficiente
   - Para valores > R$ 5.000,00, o destinatário deve estar na lista de favorecidos

4. **Usuário já existe:**
   - Username e email devem ser únicos no sistema

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido para fins educacionais - Aprendizado de testes e automação de APIs.

---

**🎯 Objetivo**: Esta API foi criada especificamente para aprender e praticar testes automatizados a nível de API, proporcionando um ambiente controlado com regras de negócio bem definidas para exercitar cenários de teste diversos.