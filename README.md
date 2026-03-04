# Dynamo Forms

Formulários dinâmicos para **React** e **React Native**. Monorepo com pacotes compartilhados.

## Estrutura

```
dynamo-forms/
├── packages/
│   ├── core/           # @jvse/dynamo-core – tipos, condições, schema, validação
│   ├── react/          # @jvse/dynamo-react – componentes para web
│   └── react-native/   # @jvse/dynamo-react-native – componentes para React Native
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

- **Web:** `pnpm add @jvse/dynamo-core @jvse/dynamo-react`
- **React Native:** `pnpm add @jvse/dynamo-core @jvse/dynamo-react-native`

O código de formulário completo (componentes com UI) que hoje vive na raiz (`components/`, `lib/`) continua disponível para o app existente; a migração para dentro dos pacotes pode ser feita em seguida.

## Licença

MIT
