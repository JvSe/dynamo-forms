export type FieldStatus = {
  status: "aprovado" | "reprovado";
  mensagem?: string | null;
} | null;

export const getFieldStatus = (
  registerSelected: Record<string, any> | null,
  fieldId: string
): FieldStatus => {
  if (!registerSelected?.campo_backoffice) return null;
  const campoBackoffice = registerSelected.campo_backoffice;
  const fieldIdWithPrefix = `form-group-${fieldId}`;
  let reprovado: { id: string; observacao: string } | undefined;
  let aprovado: { id: string; value: any } | undefined;

  if (Array.isArray(campoBackoffice)) {
    const sorted = [...campoBackoffice].sort(
      (a, b) =>
        new Date(b.data_criacao || 0).getTime() -
        new Date(a.data_criacao || 0).getTime()
    );
    const maisRecente = sorted[0];
    if (maisRecente?.dados_retornos) {
      const dr = maisRecente.dados_retornos;
      if (dr.reprovados?.length)
        reprovado = dr.reprovados.find(
          (r: { id: string }) => r.id === fieldId || r.id === fieldIdWithPrefix
        );
      if (dr.dados_aprovados?.length)
        aprovado = dr.dados_aprovados.find(
          (a: { id: string }) => a.id === fieldId || a.id === fieldIdWithPrefix
        );
    }
  } else if (
    campoBackoffice &&
    typeof campoBackoffice === "object" &&
    !Array.isArray(campoBackoffice) &&
    "dados_retornos" in campoBackoffice
  ) {
    const dr = (campoBackoffice as any).dados_retornos;
    if (dr?.reprovados?.length)
      reprovado = dr.reprovados.find(
        (r: { id: string }) => r.id === fieldId || r.id === fieldIdWithPrefix
      );
    if (dr?.dados_aprovados?.length)
      aprovado = dr.dados_aprovados.find(
        (a: { id: string }) => a.id === fieldId || a.id === fieldIdWithPrefix
      );
  }

  if (reprovado)
    return { status: "reprovado", mensagem: reprovado.observacao };
  if (aprovado) return { status: "aprovado", mensagem: null };
  return null;
};
