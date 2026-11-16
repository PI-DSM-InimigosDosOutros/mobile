# WorkIn

Aplicativo de treinos em casa em React Native, Expo SDK 57, TypeScript e Expo Router. Mantém Space Grotesk, DM Mono e os SVGs do protótipo.

## Desenvolvimento

```sh
npm ci
npm start
npm run lint
npm run typecheck
npm test
```

Android e web podem ser testados no Windows; o simulador iOS exige macOS. Não foram adicionadas dependências nesta integração.

## API ou apresentação

A interface de apresentação mantém armazenamento e geração ilustrativa local onde necessário. Os marcadores técnicos foram retirados das telas a pedido da equipe; isso não representa dados enviados ao servidor.

Configure `.env` conforme `.env.example` e reinicie o Expo:

- `EXPO_PUBLIC_DATA_MODE=mock` (padrão): cadastro cria um perfil de teste salvo por AsyncStorage. Na web usa localStorage; no celular usa o armazenamento do app. O atalho “CONTINUAR PARA MEUS TREINOS” abre esse perfil/demonstração. Não há autenticação local por senha.
- `EXPO_PUBLIC_DATA_MODE=api`: cadastro envia o formulário completo para `/api/user/register`, guarda o JWT e abre a conta retornada pelo servidor.
- `EXPO_PUBLIC_API_URL`: endereço do backend, com ou sem `/api`. Na web local, http://localhost:3000; no celular, usar o IP acessível do computador. Nunca colocar credenciais do banco, chaves ou segredos em EXPO_PUBLIC_*.

No modo mock, Entrar abre o perfil de apresentação e ignora JWTs antigos, sem consultar a API. No modo api, login usa e-mail/senha no servidor. Uma conta autenticada consulta perfil, treino, histórico e métricas do servidor e usa as operações reais de geração, início, conclusão de exercício, finalização, edição de perfil e alteração de senha. Uma falha da API não ativa o mock automaticamente. O atalho de apresentação continua restrito ao desenvolvimento.

O backend precisa da migração `src/migrations/001_workout_sessions.sql` e da configuração da equipe antes de ativar a integração real. Consulte o README do repositório backend para os contratos, preparação e limitações.

## Organização

- `src/app`: login, cadastro em cinco etapas, redefinição de senha, ajuda e navegação Expo Router.
- `src/app/(preview)`: Treino do dia, Treinos anteriores e Conta.
- `src/components/*-previews.tsx`: conteúdo dos modais de conta, treino e histórico. Os nomes de arquivos foram preservados para facilitar a manutenção.
- `src/hooks/use-dashboard.tsx`: consulta compartilhada dos dados, criação de treino e edição de perfil. Encaminha cada operação ao modo correspondente.
- `src/hooks/use-workout-practice.ts`: relógio, pausa e transições; a API recebe sessionId, exerciseOrder e tempo medido. A finalização real usa o resumo retornado pelo servidor.
- `src/services/api.ts`: transporte, JWT e endpoints. `userAdapter.ts`, `workoutAdapter.ts` e `historyAdapter.ts` tratam os contratos atuais.
- `src/services/registration.ts`: alias do cadastro real; não usa mais EXPO_PUBLIC_REGISTER_URL nem um contrato separado.
- `src/utils/registration.ts`: formatos de formulário, validações e normalização por seção. Modalidades seguem o SQL informado: Equilíbrio, Flexibilidade, Cardio, Musculação, HIIT e Calistenia.
- `src/services/mock-storage.ts` e `src/utils/mock-dashboard.ts`: armazenamento, catálogo ilustrativo e cálculos do modo de apresentação, isolados da conta real.
- `src/hooks/use-theme.tsx`: cor persistida por dispositivo. A cor não é sincronizada com a conta.

O rascunho de cadastro continua necessário para os campos e é salvo sem senha/confirmacão. O perfil de apresentação é único por dispositivo e é editado pela Conta; cadastrar não sobrescreve um perfil já existente. Dados antigos não têm suas modalidades convertidas automaticamente (por exemplo, Yoga não vira Flexibilidade); revise as preferências ao trocar para o catálogo atual.

## Validação

Os testes verificam normalização, limites do banco, contratos de resposta, filtros, resumos e o modo de apresentação. Os testes de navegador usam respostas controladas da API e não substituem a execução com o MySQL, SMTP e Gemini reais. A aplicação da migração e os testes no Alwaysdata permanecem com a equipe, pois as credenciais não estão disponíveis neste ambiente.

Fluxo de treino e configuração para gravação: [FLUXO-TREINO.md](FLUXO-TREINO.md).
