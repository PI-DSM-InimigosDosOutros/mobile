# WorkIn

Aplicativo de treinos em casa em React Native, Expo SDK 57, TypeScript e Expo Router.

## Desenvolvimento

Na pasta `mobile`, com Node.js compatível com o SDK 57:

```sh
npm ci
npm start
```

Configure `EXPO_PUBLIC_API_URL` conforme `.env.example` e reinicie o Expo após mudar o endereço. A aplicação aceita o endereço do backend com ou sem `/api`. Na web local, use `http://localhost:3000`; em um celular, use o IP do computador acessível pela mesma rede. Não coloque senhas, credenciais do banco ou chaves em variáveis `EXPO_PUBLIC_*`.

O backend é um repositório separado e precisa da configuração da equipe para acessar banco e serviços de e-mail. Sem essa configuração, não é possível validar o funcionamento com dados reais. O link de desenvolvimento na tela de login abre uma demonstração identificada, sem chamadas de treino ao backend. Uma falha da API na conta real nunca troca silenciosamente seus dados pelos exemplos.

Use `npm run android`, `npm run ios` ou `npm run web` conforme o dispositivo. O simulador iOS exige macOS.

## Estado atual

Há dois modos explícitos: **conta real**, com as chamadas existentes em `src/services/api.ts`, e **modo local (mock)**, com perfil, preferências, geração ilustrativa, prática recuperável e histórico salvos por AsyncStorage. Na web, o armazenamento é localStorage. Uma falha da API não troca automaticamente para o mock.

O cadastro completo agora permite criar um perfil local de teste. Não cria usuário no servidor nem guarda senha. O rascunho também é salvo, excluindo senha e confirmação. A entrada de desenvolvimento recupera o perfil salvo e, sem perfil, inicia a demonstração com exemplos. A cor permanece salva por dispositivo.

Login, recuperação, redefinição de senha, consulta do treino, início, progresso e finalização usam a API no modo de conta real. Cadastro completo, edição de perfil, geração e histórico definitivo continuam dependendo dos contratos descritos abaixo. Na conta real, resumos novos ainda ficam em memória; o armazenamento do mock é separado.

O catálogo local é ilustrativo e não interpreta medidas, metas ou observações para prescrever exercícios. Geração, perfil, resumos e sequência estão centralizados para facilitar a substituição pelos serviços futuros. Consulte **[MOCK-E-INTEGRACAO.md](MOCK-E-INTEGRACAO.md)** para os objetos, campos, arquivos e pontos de troca.
## Pendências do contrato com o backend

| Contexto | O que falta |
| --- | --- |
| Cadastro completo | Definir nome completo versus `firstName`/`lastName`, códigos de gênero, medidas, atividade, observações, metas, modalidades e dias/tempo disponível. |
| Criar treino | Disponibilizar operação que gere e associe o treino à conta com base nas preferências salvas. O serviço Gemini existente ainda não está exposto por essa operação. |
| Conta | Disponibilizar consulta e atualização de perfil/preferências. |
| Segurança | Disponibilizar alteração autenticada de senha; recuperação por e-mail já possui chamada própria. |
| Histórico e sequência | Persistir e consultar sessões, situação integral/parcial, tempos medidos e dias programados. A finalização atual não grava essas informações. |
| Recuperação | Configurar SMTP e o link público/deep link que devolve o token à tela de redefinição. |

Esses pontos não são resolvidos apenas preenchendo o `.env`; também precisam de endpoints/contratos e persistência no backend. Nenhum campo novo do banco foi presumido nesta etapa.

## Onde trabalhar

- `src/app/index.tsx`: login e entrada na demonstração.
- `src/app/cadastro.tsx` e `src/components/registration-steps.tsx`: etapas do cadastro.
- `src/app/reset-password.tsx`: redefinição por token.
- `src/app/(preview)`: Treino do dia, Treinos anteriores e Conta.
- `src/app/modal.tsx`: seleção de modal pela rota `/modal?tela=...&id=...`.
- `src/components/account-previews.tsx`: conta, preferências, recuperação e configurações.
- `src/components/workout-previews.tsx`: treino completo, exercício, execução, pausa, encerramento e conclusão.
- `src/components/history-previews.tsx`: filtros, histórico, resumo e sequência.
- `src/hooks/use-workout-practice.ts`: relógio local e transições da prática.
- `src/hooks/use-dashboard.tsx`: dados compartilhados, consulta do treino, modo demonstrativo e resumos em memória.
- `src/hooks/use-session.tsx` e `src/services/session.ts`: sessão e persistência.
- `src/services/api.ts`: chamadas compatíveis com os endpoints atuais, autenticação e tratamento de erros.
- `src/services/workoutAdapter.ts`: resposta do treino para os objetos da interface; minutos convertidos para segundos.
- `src/hooks/use-registration.tsx`: rascunho compartilhado entre etapas, sem persistir senha.
- `src/utils/registration.ts`: tipos, opções, normalização e validações do cadastro.
- `src/utils/dashboard.ts`: objetos de treino/sessão, filtros e formatação.
- `src/data/demo-dashboard.ts`: exemplos isolados, usados apenas na demonstração.
- `src/services/registration.ts`: proposta anterior de envio completo, preservada para alinhamento. Não é chamada pelas telas e não equivale ao contrato atual de `/api/user/register`. `EXPO_PUBLIC_REGISTER_URL` continua reservado para esse serviço.

## Identidade visual

Foram mantidos os SVGs originais em `src/components/VisualAssets`, Space Grotesk e DM Mono em `src/assets/Fonts`, tema semântico, retângulos, setas, listras, quadriculados e marca d'água. Os PNGs fornecidos nos arquivos WorkIn.zip e WorkIn (1).zip orientaram a revisão; o link do Figma não pôde ser consultado diretamente.

Cores, fontes e espaçamentos ficam em `src/constants/theme.ts`; seleção e persistência de cor, em `src/hooks/use-theme.tsx`. Os SVGs usam `expo-image`, sem nova biblioteca ou transformador.

## Verificação

```sh
npm run lint
npm run typecheck
npm test
```

Os testes de dados/contratos usam Node.js 24. As verificações de interface com respostas controladas da API não substituem os testes com MySQL, e-mail e dispositivos físicos configurados pela equipe.
