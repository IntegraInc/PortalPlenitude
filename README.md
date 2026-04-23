# 🛒 Portal Plenitude

Sistema de gestão de compras com integração direta com ERP, permitindo que usuários gerem ordens de compra e realizem atualização de preços de produtos de forma centralizada.

---

## 🚀 Problema

Em muitos cenários corporativos, o processo de compras é descentralizado, manual e sujeito a erros — principalmente quando envolve atualização de preços e sincronização com sistemas ERP.

Esse projeto resolve:

- Falta de padronização na geração de ordens de compra
- Atualização manual de preços no ERP
- Risco de inconsistência entre sistemas

---

## 💡 Solução

O Portal Plenitude atua como uma camada intermediária entre usuários e o ERP, garantindo:

- Criação estruturada de ordens de compra
- Atualização de preços integrada com o ERP
- Centralização das operações de compra
- Redução de erros operacionais

---

## 🏗️ Arquitetura

O sistema é dividido em duas partes principais:

### Frontend

- Interface para gestão de compras
- Visualização e manipulação de dados

### Backend (API)

- Responsável pela comunicação com o ERP
- Processamento de regras de negócio
- Integrações externas

---

## 🧰 Tecnologias Utilizadas

### Frontend

- ReactJS
- NextJS
- TanStack Table

### Backend

- Node.js (API)
- Integrações com ERP (REST / SOAP)

---

## 🔗 Repositórios

- Frontend: https://github.com/IntegraInc/PortalPlenitude
- Backend: https://github.com/IntegraInc/integrainc-senior-api

---

## ⚙️ Funcionalidades

- ✔️ Criação de ordens de compra
- ✔️ Atualização de preços de produtos
- ✔️ Integração com ERP
- ✔️ Visualização tabular de dados (TanStack Table)
- ✔️ Estrutura escalável para novas integrações

---

## 📈 Diferenciais Técnicos

- Separação clara entre frontend e backend
- Foco em integração com sistemas legados (ERP)
- Arquitetura preparada para crescimento
- Uso de ferramentas modernas para manipulação de dados

---

## ▶️ Como executar o projeto

### Frontend

```bash
cd PortalPlenitude
npm install
npm run dev
```

### Backend

## É necessário acessar o repositorio integrainc-senior-api

```bash
cd integrainc-senior-api
npm install
npm run dev
```
