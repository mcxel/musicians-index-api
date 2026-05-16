const MAX_STACK = 80;

export class TmiNavigationStack {
  private stack: string[] = [];

  push(path: string) {
    if (!path) return;
    if (this.stack[this.stack.length - 1] === path) return;
    this.stack.push(path);
    if (this.stack.length > MAX_STACK) {
      this.stack = this.stack.slice(this.stack.length - MAX_STACK);
    }
  }

  peek(): string | null {
    return this.stack.length ? this.stack[this.stack.length - 1] : null;
  }

  pop(): string | null {
    if (!this.stack.length) return null;
    return this.stack.pop() ?? null;
  }

  previous(): string | null {
    if (this.stack.length < 2) return null;
    return this.stack[this.stack.length - 2];
  }

  list(): string[] {
    return [...this.stack];
  }

  clear() {
    this.stack = [];
  }
}

export const tmiNavigationStack = new TmiNavigationStack();
