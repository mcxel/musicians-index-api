import type { ProductKey } from "@tmi/contracts";

export type TelemetryEvent =
  | { type: "impression"; impressionKey: string; product: ProductKey; at: number }
  | { type: "click"; impressionKey: string; product: ProductKey; at: number };

export type TelemetrySink = (evt: TelemetryEvent) => void;

export const memoryTelemetry: { events: TelemetryEvent[]; sink: TelemetrySink } = {
  events: [],
  sink: (evt: TelemetryEvent) => {
    memoryTelemetry.events.push(evt);
  },
};

export const defaultSink: TelemetrySink = (evt) => memoryTelemetry.sink(evt);

export function trackImpression(sink: TelemetrySink, impressionKey: string, product: ProductKey) {
  sink({ type: "impression", impressionKey, product, at: Date.now() });
}

export function trackClick(sink: TelemetrySink, impressionKey: string, product: ProductKey) {
  sink({ type: "click", impressionKey, product, at: Date.now() });
}
