# Modo local e pontos de troca pela API

O mock usa AsyncStorage, já instalado no projeto. Na web, isso usa o localStorage; em Android/iOS, usa o armazenamento do aplicativo. Os dados ficam apenas neste dispositivo/origem. Não há sincronização com o servidor.

## Como testar

- Cadastro: preencher as cinco etapas e clicar em **Criar perfil local**. Cria um único perfil de teste no dispositivo, sem criar usuário no backend nem armazenar senha.
- Entrada: **DESENVOLVIMENTO: ABRIR MODO LOCAL** abre o perfil salvo; no primeiro acesso sem cadastro, cria a demonstração com exemplos identificados.
- Criar treino: abre as preferências do perfil e permite **Criar treino local**. O catálogo é ilustrativo, limitado às modalidades selecionadas e ao tempo disponível. Não é geração por IA ou prescrição personalizada. Metas, medidas e observações são armazenadas, mas não interpretadas pelo mock.
- Execução: iniciar, pausar, retomar, concluir exercícios ou encerrar antes do fim. A prática é salva periodicamente e nas mudanças de estado. Reabrir recupera a prática pausada, sem contar o tempo fechado; pode perder até aproximadamente dois segundos entre checkpoints.
- Conta: editar dados pessoais, medidas, metas, modalidades e disponibilidade e clicar em **Salvar no dispositivo**. Mudanças afetam a próxima geração, preservando o treino atual e o histórico.
- Histórico: resumos completos/parciais e tempos ficam salvos. A sequência local é calculada pelos registros e dias programados, sem incrementar por encerramento parcial. Os filtros atuam sobre os registros locais.
- Sair: fecha o modo local, preservando seus dados. A entrada de desenvolvimento permite continuar depois. Um novo cadastro não sobrescreve um perfil já salvo: use a edição da Conta.

O perfil inicial e as sessões `demo-*` são exemplos. Perfis criados pelo cadastro começam sem histórico e sem treino. Os dados `mock-*` são produzidos para teste e os resumos `local-*` registram somente a prática no aparelho. A interface identifica o modo local em telas e modais.

## O que já usa a API

`src/services/api.ts` concentra login, recuperação, redefinição de senha, consulta do treino, início, avanço e finalização, conforme os contratos do backend atual. Esses fluxos permanecem separados do mock. Uma falha da API não ativa o mock automaticamente. A validação com MySQL e envio real de e-mail continua pendente da configuração da equipe.

`POST /api/user/register` existe no backend, mas não recebe o cadastro completo de cinco etapas. O serviço anterior `src/services/registration.ts` contém uma proposta de contrato e não é chamado pelas telas. A rota técnica de emissão de token também não é usada como alternativa ao login.

## Lista para substituir depois

| Contexto/campos | Objeto usado pela interface | Local principal | Integração futura |
| --- | --- | --- | --- |
| Cadastro em cinco etapas | `RegistrationDraft` → `RegistrationProfile` | `src/app/cadastro.tsx`, `src/hooks/use-registration.tsx`, `src/utils/registration.ts` | Substituir `dashboard.registerLocal(profile)` por criação completa da conta; alinhar nome, gênero e resposta de autenticação. |
| Nome, nascimento, gênero e e-mail | `data.profile` | `src/components/account-previews.tsx` → `dashboard.updateDemoProfile(profile)` | Consultar/atualizar perfil pela API. |
| Altura, peso, atividade e observações | `data.profile.heightCm`, `weightKg`, `activityLevel`, `medicalNotes` | Mesmo fluxo de edição do perfil | Persistir e retornar esses campos no backend. |
| Meta e modalidades | `data.profile.goal`, `exerciseCategories` | Mesmo fluxo de edição do perfil | Alinhar opções/IDs do catálogo e salvar preferências. |
| Minutos/dia e dias da semana | `data.profile.availableMinutesPerDay`, `availableDays` | Mesmo fluxo de edição do perfil | Salvar disponibilidade e usá-la na geração/agendamento. |
| Criar treino | `data.workout: DailyWorkout` | `src/utils/mock-dashboard.ts` → `generateMockWorkout`, chamado por `dashboard.createWorkout()` | Trocar catálogo simulado pela operação de geração e adaptar a resposta. |
| Prática em andamento | `Practice`: índice, durações, conclusões e relógio | `src/hooks/use-workout-practice.ts` | Alinhar sessão identificável e retomada no servidor; início/progresso/finalização já têm chamadas reais fora do mock. |
| Resumo e histórico | `data.history: WorkoutSession[]` | `dashboard.keepSummary()`, `recordMockSummary()`, `src/components/history-previews.tsx` | Gravar/consultar sessões, situação integral/parcial e tempos reais. Evitar duplicidade em repetição de pedidos. |
| Sequência e semana | `data.currentStreak`, `data.week` | `src/utils/mock-dashboard.ts` → `mockProgress()` | Usar histórico e agendamento definitivos da conta; manter regras documentadas. |
| Cor | `theme.accent`, `profile.accentColor` | `src/hooks/use-theme.tsx`, `src/components/accent-palette.tsx` | Opcionalmente sincronizar com o perfil; a escolha já é salva por dispositivo. |

## Organização e limites

- `src/services/mock-storage.ts`: único ponto de leitura/gravação dos snapshots e rascunhos do mock. Snapshot versionado em `@workin/mock/v1`; rascunho em `@workin/mock-draft/v1`, sem senha nem confirmação.
- `src/hooks/use-dashboard.tsx`: operações que as telas chamam. Conectar os endpoints futuros nesses métodos permite preservar os formulários e layouts. O modo de conta real continua usando os serviços existentes.
- `src/utils/mock-dashboard.ts`: catálogo ilustrativo, montagem local, resumo e cálculo de sequência. Essa simulação não deve ser movida para produção como algoritmo de treino.
- `RegistrationDraft` é o formato de preenchimento (textos, data DD/MM/AAAA, horas/minutos). `RegistrationProfile` é o objeto normalizado para uso/salvamento. O rascunho continua necessário mesmo após a API estar pronta; não é um placeholder.
- Autenticação, recuperação por e-mail e alteração autenticada de senha não são substituídas por armazenamento local. A troca de senha pela conta permanece pendente de endpoint. O mock não guarda credenciais nem oferece autenticação real.
- GIFs continuam indisponíveis quando não fornecidos. Não foram criados arquivos ou URLs fictícios para aparentar integração.
- A cor é uma preferência do dispositivo. Alterar a cor não representa sincronização com o backend.
- O histórico da conta real ainda fica em memória; os dados persistentes desta implementação pertencem ao modo local e não são enviados automaticamente ao usuário autenticado.

Não basta remover a palavra “mock”: cada ponto acima exige alinhamento de contrato, validação no servidor, substituição da operação local e teste com o banco real.
