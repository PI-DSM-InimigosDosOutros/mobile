# Fluxo de treino — referência e funcionamento

## Comparação com a equipe

Foi consultado o histórico remoto atualizado dos dois repositórios:

- Backend develop: 75cb3ab (ObanaThird), com início, progresso e finalização introduzidos em e525870. O fluxo é consultar treino, iniciar, avançar na sequência, finalizar e retornar resumo.
- Mobile: d41edc9 (ObanaThird), sobre 571d90f (Joia). Havia serviços de treino e consulta da Home; os controles dos modais ainda navegavam pelas prévias sem chamar início/progresso/finalização.
- A versão 3a29ef5 da Luana gerava o treino ao consultar /wod. Essa geração automática já não está no último develop do ObanaThird. Foi confirmado com a equipe manter consulta do existente e criação pelo botão.

Na integração posterior foram acrescentados cronômetro, sessão identificada, tempos persistidos e proteção contra repetição de requisições. Também foram introduzidas confirmações extras na interface e alterada a navegação do exercício anterior. Essas mudanças de uso foram corrigidas para preservar a sequência da equipe.

## Passo a passo atual

1. Menu **Treino do dia** (`src/app/(preview)/treino.tsx`): consulta o treino existente. **Criar treino** continua sendo uma ação explícita; entrar ou atualizar a tela não gera outro treino nem chama IA.
2. **Visualizar exercício** ou **Ver treino completo** abre a consulta em `src/components/workout-previews.tsx`. Consultar não inicia nem registra a prática.
3. **Treinar**, no menu, nos detalhes ou no treino completo: inicia uma única vez e abre diretamente o primeiro exercício pendente. Não exige um segundo botão “Iniciar treino”. Uma prática já aberta usa **Continuar treino**.
4. **Próximo exercício**: registra a conclusão e o tempo do atual e exibe o próximo. A API continua usando sessão e exercício identificados internamente, sem expor esses dados ao usuário.
5. **Exercício anterior**: consulta o exercício anterior dentro da mesma tela de execução, sem desfazer conclusões nem registrar o mesmo exercício novamente. O relógio pausa durante a consulta; voltar ao atual recupera a situação anterior.
6. **Pausar treino / Retomar treino**: mantém o exercício e não contabiliza o período pausado. Pausa e encerramento substituem a tela do modal para evitar acúmulo de telas antigas na volta.
7. No último exercício, **Concluir treino** registra a última conclusão e finaliza. Em caso de erro, permanece na execução com possibilidade de corrigir/tentar novamente; não exibe sucesso sem confirmação.
8. A confirmação de conclusão oferece **Ver resumo completo** e **Voltar ao treino do dia**. Ver o resumo não envia outra finalização.
9. **Encerrar treino**, antes do fim: abre confirmação. **Continuar treino** retorna ao mesmo exercício; **Encerrar e ver resumo** registra a situação parcial. Não conta como conclusão integral.

## Modo para gravação

`.env.local` está configurado com `EXPO_PUBLIC_DATA_MODE=mock`. Reiniciar o Expo após mudar esse valor.

- **Entrar**, cadastro, perfil e treino usam os dados de apresentação salvos por AsyncStorage.
- Uma sessão JWT antiga é ignorada nesse modo e as chamadas de API são bloqueadas. Não depende do banco para gravar o vídeo.
- A entrada mantém a validação visual dos campos, mas não é autenticação por senha. Não se armazena senha e não se simula envio de e-mail ou troca de credenciais.
- A integração real permanece no código e é reativada com `EXPO_PUBLIC_DATA_MODE=api`, endereço da API e configuração/migração do backend.

Nenhuma mudança de endpoint ou regra de persistência do backend foi revertida nesta adequação de interface. O SQL do banco não foi executado nem alterado.
