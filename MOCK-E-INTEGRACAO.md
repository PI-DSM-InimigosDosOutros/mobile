# Mock e integração — mapa atual

Os textos técnicos foram retirados da interface para apresentação. O funcionamento continua separado entre perfil mock e conta autenticada; não há migração automática dos dados de apresentação para o servidor.

## Operações já conectadas

- Cadastro completo: `app/cadastro.tsx` → `registerAccount()` em `services/api.ts`. Ativar EXPO_PUBLIC_DATA_MODE=api. Campos são normalizados em `utils/registration.ts`; senha não entra em rascunhos persistidos.
- Perfil: `components/account-previews.tsx` → `toProfilePatch()` → `dashboard.updateDemoProfile()`. O nome do método foi preservado, mas contas reais usam PUT /user/profile e apresentação usa armazenamento local. Cada grupo é salvo separadamente, preservando o restante do perfil.
- Treino: `dashboard.createWorkout()` chama /workout/create na conta ou `generateMockWorkout()` na apresentação.
- Prática: `hooks/use-workout-practice.ts` usa dailyWorkoutId no início, sessionId + exerciseOrder + durationSeconds na conclusão e sessionId + exercício interrompido na finalização.
- Histórico e métricas: `fetchHistory()` e `fetchMetrics()` preenchem `data.history`, `currentStreak` e `week` na conta real. A finalização real exibe o resumo do servidor.
- Senha: o modal Segurança envia currentPassword/newPassword para /user/change-password; recuperação e redefinição mantêm suas rotas próprias.
- Contratos: `services/userAdapter.ts`, `workoutAdapter.ts` e `historyAdapter.ts` correspondem às respostas atuais do backend. `services/registration.ts` reexporta o serviço real; o contrato antigo isolado foi retirado.

Os caminhos acima ficam dentro de `src/` do mobile. O backend tem controllers em `https/`, serviços em `services/` e persistência em `repositories/`.

## O que continua mock

Somente o modo de apresentação continua usando `data/demo-dashboard.ts`, `utils/mock-dashboard.ts` e `services/mock-storage.ts`: perfil, preferências, catálogo/geração ilustrativa, prática, histórico e sequência. As imagens/GIFs ausentes nesse catálogo permanecem sem arquivo demonstrativo. As modalidades foram alinhadas ao SQL; descrições e nomes antigos são formatados para apresentação sem apagar os registros.

Não há autenticação por senha no modo mock. Recuperação por e-mail e alteração de senha não recebem sucesso fictício. A cor continua sendo uma preferência do dispositivo em ambos os modos.

`RegistrationDraft` não é uma pendência de API: é o formato dos campos de preenchimento. `RegistrationProfile` representa os dados normalizados; `Practice` representa a execução e `WorkoutSession` o resumo.

## O que falta executar fora do código

- Conferir o esquema publicado e aplicar `src/migrations/001_workout_sessions.sql` do backend, que adiciona sessões, exercícios por sessão e versões de disponibilidade. O script original de criação do banco ficou fora das alterações, conforme solicitado.
- Configurar MySQL, JWT_SECRET, APP_TIMEZONE, SMTP, MAIL_FROM, FRONTEND_URL, GEMINI_API_KEY e GEMINI_MODEL. Trocar JWT_SECRET na publicação para invalidar os tokens da antiga emissão sem senha.
- Confirmar os códigos de gênero das contas legadas: o contrato usa F/M/N/P para as quatro opções existentes.
- Testar transações, concorrência, GIFs, e-mail, link de retorno e geração no ambiente real e em dispositivos físicos.
- Histórico anterior sem tempos/situação não pode ser reconstruído automaticamente. A retomada da API recupera o progresso confirmado, sem o tempo ainda não enviado do exercício que estava aberto.

Os limites da IA são por processo e não substituem a cota de gastos do provedor. Nenhum desses serviços externos foi acionado usando credenciais reais nesta implementação.
