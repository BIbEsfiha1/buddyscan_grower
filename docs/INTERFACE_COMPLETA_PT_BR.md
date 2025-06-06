# Descrição Absolutamente Completa da Interface

## 1. Dashboard Inicial

- **Plantios Ativos**
- **Alertas Críticos**
- **Últimos Diagnósticos IA**
- **Próximas Colheitas**

Ações rápidas:

- **Registrar Diário**
- **Escanear QR**
- **Criar Novo Plantio**

## 2. Menu Plantas

### Lista de Plantas

- Exibição em lista ou grade
- Cada card mostra nome/alias, status visual, último registro e botão de registro rápido

### Detalhe da Planta

- Foto atual
- Linha do tempo de registros
- Gráficos de histórico (altura, EC, pH)
- Dados básicos (strain, estágio, dias totais)

Ações disponíveis:

- **Registrar Novo Diário**
- **Solicitar Análise IA**
- **Editar Planta**

## 3. Menu Diário

### Tela Inicial

- Calendário com registros diários
- Opções para adicionar registro e exportar relatório

### Registrar Diário

Campos obrigatórios:

- Altura (cm)
- EC (condutividade elétrica)
- pH da solução
- Irrigação (litros)

Campos opcionais:

- Observações livres
- Seleção de sintomas comuns
- Upload de fotos
- Analisar com IA

Botão principal **Salvar Diário** (destaque em verde neon)

## 4. Menu Scanner QR

- Câmera abre automaticamente
- Feedback visual ao identificar QR ("Planta encontrada!")
- Resumo instantâneo dos detalhes da planta
- Acesso direto para adicionar registro diário

Alternativa manual:

- Campo de busca por ID ou alias
- Lista de plantas recentes

## 5. Menu Alertas

- Lista de alertas ativos por criticidade
- Tipos: ambientais, nutricionais e IA
- Cada alerta traz descrição, data/hora e ações recomendadas

Ações:

- **Marcar como Resolvido**
- **Ignorar Alerta**
- **Registrar Diário Corretivo**

## ⚙️ Menu de Configurações

- Perfil do usuário (dados básicos e 2FA)
- Ambientes e sensores (gestão de estufas e IoT)
- Usuários e permissões (Admin, Cultivador, Auditor)
- Plano de assinatura (status e upgrades)
- Backup e exportação de dados

## 📊 Relatórios e Exportação

- Relatório Diário (PDF ou CSV)
- Relatório Completo da Planta
- Relatório Geral do Plantio

## 📸 Diagnóstico IA (OpenAI Vision)

- Upload de imagem com animação de carregamento
- Diagnóstico resumido em texto e pontos visuais destacados
- Sugestões práticas (ex.: ajustar EC, verificar pragas)

Ações pós-diagnóstico:

- **Confirmar Diagnóstico**
- **Solicitar Nova Análise**
- **Registrar Diário com Diagnóstico**

