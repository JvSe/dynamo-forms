export default function DocsPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>Dynamo Forms</h1>
      <p>
        Formulários dinâmicos para React e React Native. Documentação em construção.
      </p>
      <h2>Pacotes</h2>
      <ul>
        <li><code>@jvse/dynamo-core</code> – lógica compartilhada (condições, schema, validação)</li>
        <li><code>@jvse/dynamo-react</code> – componentes para React (web)</li>
        <li><code>@jvse/dynamo-react-native</code> – componentes para React Native</li>
      </ul>
    </main>
  );
}
