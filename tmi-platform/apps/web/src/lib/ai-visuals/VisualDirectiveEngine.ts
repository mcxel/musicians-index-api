export type VisualDirectiveType =
  | "replace-stubs"
  | "upgrade-low-quality"
  | "build-missing-assets"
  | "create-event-posters"
  | "create-article-art"
  | "create-venue-visuals";

export type VisualDirective = {
  directiveId: string;
  type: VisualDirectiveType;
  payload: Record<string, string | number | boolean>;
  createdAt: number;
  active: boolean;
};

const directives = new Map<string, VisualDirective>();

function id(): string {
  return `vdir_${Math.random().toString(36).slice(2, 11)}`;
}

export function issueDirective(
  type: VisualDirectiveType,
  payload: Record<string, string | number | boolean>
): VisualDirective {
  const directive: VisualDirective = {
    directiveId: id(),
    type,
    payload,
    createdAt: Date.now(),
    active: true,
  };
  directives.set(directive.directiveId, directive);
  return directive;
}

export function disableDirective(directiveId: string): VisualDirective | null {
  const current = directives.get(directiveId);
  if (!current) return null;
  const next: VisualDirective = { ...current, active: false };
  directives.set(directiveId, next);
  return next;
}

export function listDirectives(activeOnly = false): VisualDirective[] {
  const all = [...directives.values()];
  return activeOnly ? all.filter((d) => d.active) : all;
}
