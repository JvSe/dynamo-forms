# Dynamo Forms

Formulários dinâmicos para **React** e **React Native**. Monorepo com pacotes compartilhados.

## Estrutura

```
dynamo-forms/
├── packages/
│   ├── core/           # @jvseen/dynamo-core – tipos, condições, schema, validação
│   ├── react/          # @jvseen/dynamo-react – componentes para web
│   ├── react-native/   # @jvseen/dynamo-react-native – componentes para React Native
│   └── builder/        # @jvseen/dynamo-builder – construtor drag-and-drop (paleta | canvas | configurações)
├── apps/
│   └── docs/           # Site de documentação (Next.js)
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Desenvolvimento

```bash
pnpm install
pnpm build          # build de todos os pacotes
pnpm dev            # dev em paralelo (core, react, react-native, docs)
cd apps/docs && pnpm dev   # só a documentação
```

## Uso

- **Web:** `pnpm add @jvseen/dynamo-core @jvseen/dynamo-react`
- **React Native:** `pnpm add @jvseen/dynamo-core @jvseen/dynamo-react-native`
- **Construtor de formulários (web):** `pnpm add @jvseen/dynamo-core @jvseen/dynamo-builder` — layout em 3 colunas (componentes arrastáveis | canvas | configurações do campo); saída em `DynamicFieldConfig[]` (JSON).

O código de formulário completo (componentes com UI) que hoje vive na raiz (`components/`, `lib/`) continua disponível para o app existente; a migração para dentro dos pacotes pode ser feita em seguida.

## Licença

MIT
