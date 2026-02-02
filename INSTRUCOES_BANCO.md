# Configuração do Banco de Dados (PostgreSQL)

Como o sistema de terminal integrado está com instabilidade para executar comandos de banco de dados, você precisará executar dois comandos simples no seu terminal do Windows (PowerShell ou CMD).

## Passos:

1.  Abra o terminal (ou VS Code) na pasta do projeto:
    `C:\Users\dcoelho\.gemini\antigravity\scratch\king_of_survivors`

2.  Crie as tabelas no banco de dados rodando este comando:
    ```bash
    npx prisma db push
    ```
    *Se pedir para aceitar a perda de dados (data loss), pode confirmar com `y`.*

3.  Atualize o cliente do sistema com este comando:
    ```bash
    npx prisma generate
    ```

4.  Reinicie o servidor de desenvolvimento:
    *   Se o `npm run dev` já estiver rodando, pare ele (Ctrl+C).
    *   Rode novamente:
        ```bash
        npm run dev
        ```

## Como saber se funcionou?
Se o comando `npx prisma db push` terminar com uma mensagem verde dizendo `🚀 Your database is now in sync with your Prisma schema.`, está tudo pronto!
