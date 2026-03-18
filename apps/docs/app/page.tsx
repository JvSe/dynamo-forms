import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="dyn:px-8 dyn:py-8 dyn:max-w-[800px] dyn:mx-auto">
      <h1 className="dyn:text-3xl dyn:font-bold dyn:text-foreground dyn:mb-4">Dynamo Forms</h1>
      <p className="dyn:text-muted-foreground dyn:mb-6">
        Formulários dinâmicos para React e React Native. Documentação em construção.
      </p>
      <h2 className="dyn:text-xl dyn:font-semibold dyn:text-foreground dyn:mb-3">Pacotes</h2>
      <ul className="dyn:list-disc dyn:list-inside dyn:space-y-1 dyn:text-muted-foreground dyn:mb-6">
        <li><code className="dyn:bg-muted dyn:px-1 dyn:py-0.5 dyn:rounded dyn:text-foreground">@jvseen/dynamo-core</code> – lógica compartilhada (condições, schema, validação)</li>
        <li><code className="dyn:bg-muted dyn:px-1 dyn:py-0.5 dyn:rounded dyn:text-foreground">@jvseen/dynamo-react</code> – componentes para React (web)</li>
        <li><code className="dyn:bg-muted dyn:px-1 dyn:py-0.5 dyn:rounded dyn:text-foreground">@jvseen/dynamo-react-native</code> – componentes para React Native</li>
        <li><code className="dyn:bg-muted dyn:px-1 dyn:py-0.5 dyn:rounded dyn:text-foreground">@jvseen/dynamo-builder</code> – construtor drag-and-drop de formulários</li>
      </ul>
      <p className="dyn:mt-6">
        <Link
          href="/builder"
          className="dyn:inline-block dyn:py-2.5 dyn:px-4 dyn:bg-primary dyn:text-primary-foreground dyn:rounded-lg dyn:no-underline dyn:font-medium dyn:hover:opacity-90 dyn:transition-opacity"
        >
          Testar builder de formulários →
        </Link>
      </p>
    </main>
  );
}
