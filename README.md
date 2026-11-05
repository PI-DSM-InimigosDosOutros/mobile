# WorkIn

Aplicativo de treinos em casa. Frontend em React Native, Expo SDK 57, TypeScript e Expo Router.

Axios e AsyncStorage estão disponíveis na base do repositório para a futura integração com a API e o armazenamento da sessão.

## Desenvolvimento

Use Node.js compatível com o SDK 57 e npm. Na raiz do repositório `mobile`:

```sh
npm ci
npm start
```

Use `npm run android`, `npm run ios` ou `npm run web` conforme o dispositivo disponível. O simulador iOS exige macOS; no Windows, utilize um dispositivo físico compatível ou Android/web.

```sh
npm run typecheck
npm run lint
```

## Estado atual

A aplicação está em uma etapa de **layouts estáticos**, com seleção de cor de destaque funcional e sem conexão com o backend. O único `useState` próprio fica no tema, para manter a cor durante a sessão. A lógica de preenchimento, validação interativa, filtros, edição, autenticação e execução de treinos permanece desativada.

Continuam funcionando:

- Navegação entre login, ajuda, cadastro e os três menus.
- Avanço e retorno entre as cinco telas do cadastro (`/cadastro?etapa=1` até `etapa=5`). Essa navegação serve apenas para revisar os layouts.
- Troca de abas entre Treino do dia, Treinos anteriores e Conta.
- Abertura, fechamento e navegação entre as prévias de modais, incluindo retorno pelo sistema, fechamento pelo fundo e pela tecla Escape na web.
- Navegação visual pela sequência de exercícios, com prévias de execução, pausa, encerramento e conclusão. Não existe temporizador ativo nem registro de treino.
- Rolagem das telas e adaptação da largura, respeitando as áreas seguras.
- Carregamento das fontes e imagens originais.
- Seleção da cor no cadastro, na Conta e no modal de personalização, aplicada imediatamente às telas. A escolha permanece durante a navegação e volta ao verde-lima ao recarregar; não há persistência nem envio ao backend.

Campos e seletores, exceto a paleta de cores, ficam somente para visualização. Botões sem ação implementada estão desativados. Não há login, criação de conta, salvamento, atualização de métricas ou registro de exercícios reais.

As três abas e seus modais usam dados ilustrativos isolados em `src/data/demo-dashboard.ts`, identificados na interface. Não é um algoritmo de prescrição e não representa uma conta conectada. O acesso às três abas continua restrito ao desenvolvimento.

## Prévias de modais

Há 22 visualizações acessíveis pelos botões das telas:

- **Conta / Configurações:** dados pessoais, medidas e atividade, preferências, metas e modalidades, disponibilidade, personalização, configurações, acesso e segurança, recuperação de acesso, ajuda, sobre o WorkIn e retorno ao login.
- **Treino do dia:** detalhes do exercício, treino completo, execução, pausa, encerramento e conclusão.
- **Treinos anteriores e indicador de sequência:** histórico completo, resumo de sessão, filtros e sequência.

Os formulários reutilizam os componentes do cadastro, permanecendo somente para leitura. Ações de salvar, alterar senha, enviar recuperação e aplicar filtros estão desativadas. A visualização de um resumo completo ou parcial não registra treino nem altera a sequência. A paleta é a única configuração editável nesta etapa.

`src/app/modal.tsx` escolhe o conteúdo pela rota `/modal?tela=...&id=...`. Os nomes e atalhos ficam em `src/utils/preview-navigation.ts`. `src/components/preview-modal.tsx` reúne o cabeçalho, fechamento, áreas seguras e rolagem. O conteúdo fica separado em `account-previews.tsx`, `workout-previews.tsx` e `history-previews.tsx`.

## Organização para continuar o projeto

- `src/app`: telas e navegação com Expo Router.
- `src/components`: elementos visuais reutilizáveis, sem armazenamento próprio dos dados de formulários.
- `src/hooks/use-dashboard.tsx`: distribui os mesmos dados de leitura para os menus e modais. O provider no layout principal pode receber `data` para exibir outro conjunto de informações, sem alterar o layout.
- `src/utils/registration.ts`: tipos, opções, normalização e validações disponíveis para a implementação futura do preenchimento e envio.
- `src/utils/dashboard.ts`: tipos, formatação, filtros e resumo de sessões disponíveis para a implementação futura.
- `src/services/registration.ts`: serviço de cadastro preservado e isolado. **Não é chamado pelas telas nesta versão.**
- `tests`: verificações das funções de dados e do serviço, que permanecem disponíveis para a integração futura. Execute `npm test` em Node.js 24.

A obtenção de dados da API, controle de sessão, estados de carregamento/erro, persistência, formulários interativos e execução de treinos deverão ser implementados posteriormente. O backend continuará responsável por validar e persistir os dados; a equipe deverá conectar as interações do frontend aos serviços nessa etapa.

## Integração do cadastro

O envio está isolado em `src/services/registration.ts`, sem ligação ativa com a interface. Quando a equipe implementar o preenchimento e a submissão do formulário, poderá configurar a URL completa em `EXPO_PUBLIC_REGISTER_URL` (veja `.env.example`). Configurar a URL por si só não ativa o cadastro.

O contrato abaixo é uma proposta do frontend para alinhar com a futura API; não representa um backend já disponível. O servidor deve validar todos os campos novamente, aplicar as regras de unicidade do e-mail e gerar o hash da senha antes de persistir. Em produção, utilize HTTPS. A confirmação de senha fica apenas no formulário.

O pedido é `POST`, com `Content-Type: application/json`:

```json
{
  "fullName": "Pessoa Teste",
  "birthDate": "2000-02-29",
  "gender": "Prefiro não informar",
  "email": "teste@example.com",
  "heightCm": 170.5,
  "weightKg": 70.2,
  "activityLevel": null,
  "medicalNotes": null,
  "exerciseCategories": ["Yoga", "Pilates"],
  "goal": "Melhorar condicionamento",
  "availableMinutesPerDay": 30,
  "availableDays": [1, 3, 5],
  "password": "SenhaDeExemplo1!",
  "accentColor": "#BAE068"
}
```

- `birthDate`: data ISO, sem conversão de fuso horário.
- `gender`, `activityLevel` e modalidades: opções locais definidas em `src/utils/registration.ts`. IDs do catálogo e eventuais códigos deverão ser acordados com o backend. Histórico de atividade e observações médicas são opcionais.
- `availableDays`: 1 = segunda-feira até 7 = domingo; unidades físicas e tempo são numéricos.
- `accentColor`: uma das cores com contraste verificado da paleta local. A seleção e sua persistência deverão ser conectadas ao backend posteriormente.
- `201`: o serviço considera a criação confirmada. A navegação após o cadastro deverá ser implementada na interface.
- `409`: o serviço retorna erro de e-mail já cadastrado.
- `400`/`422`: o serviço retorna erro de dados rejeitados.
- Outras respostas, falha de rede ou timeout de 15 segundos: o serviço retorna erro. Não há repetição automática de pedidos. O feedback visual será conectado junto ao formulário.

O preenchimento de nome completo deverá ser conciliado com `FirstName`/`LastName` da modelagem durante a integração. As observações e a relação com atividades físicas também precisam ser contempladas na API/modelagem; não alteram a geração de treinos nesta etapa. O GIF demonstrativo de medidas ainda precisa ser fornecido.

Os requisitos de senha seguem o protótipo: 8 a 16 caracteres, número, letra maiúscula e caractere especial. Não foram introduzidos limites de idade nem faixas físicas arbitrárias. O tempo disponível precisa caber em um dia.

Execute `npm run test:registration` em Node.js 24 para verificar validação, normalização, contraste e respostas da integração, sem acessar um servidor real.

## Organização e identidade

- `src/app`: rotas e layouts; `(preview)` reúne as três telas principais em desenvolvimento.
- `src/components`: componentes compartilhados; `VisualAssets` preserva os SVGs originais do protótipo.
- `src/constants/theme.ts`: cores semânticas, fontes e espaçamentos.
- `src/hooks/use-theme.tsx`: tema e estado da cor de destaque compartilhados por todas as telas.

Os SVGs são exibidos com `expo-image`, sem transformador ou biblioteca SVG adicional. Space Grotesk e DM Mono são carregadas dos arquivos locais em `assets/Fonts` com `expo-font`; títulos e controles usam Space Grotesk, e textos técnicos e campos usam DM Mono. Os ícones de instalação e splash são derivados dos SVGs originais.
