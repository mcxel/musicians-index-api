export type TmiPanelContract = {
  id: string;
  title: string;
  dataSource: "real" | "simulated";
  primaryAction: { label: string; target: string };
  secondaryAction: { label: string; target: string };
  routeJump: string;
  backAction: string;
  emptyState: string;
  loadingState: string;
};

export function isPanelContractComplete(panel: TmiPanelContract): boolean {
  return Boolean(
    panel.id &&
      panel.title &&
      panel.dataSource &&
      panel.primaryAction?.target &&
      panel.secondaryAction?.target &&
      panel.routeJump &&
      panel.backAction &&
      panel.emptyState &&
      panel.loadingState,
  );
}
