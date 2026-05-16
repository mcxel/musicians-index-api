export interface EmailTemplateVersion {
  templateKey: string;
  version: number;
  subject: string;
  html: string;
  text: string;
  safeTransactional: boolean;
  updatedAt: number;
}

export interface RenderedEmailTemplate {
  templateKey: string;
  version: number;
  subject: string;
  html: string;
  text: string;
  safeTransactional: boolean;
}

const templateStore = new Map<string, EmailTemplateVersion[]>();

function interpolate(
  template: string,
  variables: Record<string, string | number | boolean>
): string {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    return acc.split(`{{${key}}}`).join(String(value));
  }, template);
}

function ensureTemplate(templateKey: string): EmailTemplateVersion {
  const existing = templateStore.get(templateKey);
  if (existing && existing.length > 0) return existing[0];

  const seed: EmailTemplateVersion = {
    templateKey,
    version: 1,
    subject: `[TMI] ${templateKey}`,
    html: `<p>{{message}}</p>`,
    text: '{{message}}',
    safeTransactional: false,
    updatedAt: Date.now(),
  };

  templateStore.set(templateKey, [seed]);
  return seed;
}

export class EmailTemplateEngine {
  static upsertTemplate(input: {
    templateKey: string;
    subject: string;
    html: string;
    text: string;
    safeTransactional?: boolean;
  }): EmailTemplateVersion {
    const existing = templateStore.get(input.templateKey) ?? [];
    const latestVersion = existing[0]?.version ?? 0;
    const next: EmailTemplateVersion = {
      templateKey: input.templateKey,
      version: latestVersion + 1,
      subject: input.subject,
      html: input.html,
      text: input.text,
      safeTransactional: input.safeTransactional ?? false,
      updatedAt: Date.now(),
    };

    templateStore.set(input.templateKey, [next, ...existing].slice(0, 20));
    return next;
  }

  static getLatestTemplate(templateKey: string): EmailTemplateVersion {
    return ensureTemplate(templateKey);
  }

  static renderTemplate(
    templateKey: string,
    variables: Record<string, string | number | boolean>
  ): RenderedEmailTemplate {
    const latest = ensureTemplate(templateKey);
    return {
      templateKey,
      version: latest.version,
      subject: interpolate(latest.subject, variables),
      html: interpolate(latest.html, variables),
      text: interpolate(latest.text, variables),
      safeTransactional: latest.safeTransactional,
    };
  }

  static listTemplateVersions(templateKey?: string): EmailTemplateVersion[] {
    if (templateKey) return [...(templateStore.get(templateKey) ?? [])];
    return Array.from(templateStore.values()).flatMap((versions) => versions);
  }
}

export default EmailTemplateEngine;
