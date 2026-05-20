"use client";

export type ArenaGeometryMode =
  | "U_SHAPED_AMPHITHEATER"
  | "C_SHAPED_OPERA_BALCONY"
  | "RECTANGULAR_CLUB_FLOOR"
  | "ROUND_PROSCENIUM_STAGE";

export interface CalculateCoordinatesInput {
  seatIndex: number;
  totalSeats: number;
  geometryMode: ArenaGeometryMode;
  row?: number;
  totalRows?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface Vector2D {
  x: number;
  y: number;
  opacity: number;
}

export function computeArenaSeatVector(input: CalculateCoordinatesInput): Vector2D {
  const {
    seatIndex,
    totalSeats,
    geometryMode,
    row = 0,
    totalRows = 1,
    canvasWidth = 800,
    canvasHeight = 400,
  } = input;

  const cx = canvasWidth / 2;
  const cy = canvasHeight * 0.85;
  const t = totalSeats > 1 ? seatIndex / (totalSeats - 1) : 0.5;
  const rowFraction = totalRows > 1 ? row / (totalRows - 1) : 0;
  const depthOpacity = 0.45 + (1 - rowFraction) * 0.55;

  switch (geometryMode) {
    case "U_SHAPED_AMPHITHEATER": {
      const startAngle = Math.PI * 1.1;
      const endAngle = Math.PI * 1.9;
      const angle = startAngle + t * (endAngle - startAngle);
      const baseRadius = canvasHeight * 0.3;
      const radius = baseRadius + row * (canvasHeight * 0.06);
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * 0.55,
        opacity: depthOpacity,
      };
    }
    case "C_SHAPED_OPERA_BALCONY": {
      const startAngle = Math.PI * 1.15;
      const endAngle = Math.PI * 1.85;
      const angle = startAngle + t * (endAngle - startAngle);
      const baseRadius = canvasHeight * 0.35;
      const radius = baseRadius + row * (canvasHeight * 0.05);
      return {
        x: cx + Math.cos(angle) * radius * 1.1,
        y: cy + Math.sin(angle) * radius * 0.45,
        opacity: depthOpacity * 0.85,
      };
    }
    case "RECTANGULAR_CLUB_FLOOR": {
      const cols = Math.ceil(Math.sqrt(totalSeats * (canvasWidth / canvasHeight)));
      const col = seatIndex % cols;
      const r = Math.floor(seatIndex / cols);
      const spacingX = canvasWidth / (cols + 1);
      const spacingY = (canvasHeight * 0.65) / (totalRows + 1);
      return {
        x: spacingX * (col + 1),
        y: canvasHeight * 0.15 + spacingY * (r + 1),
        opacity: 0.3 + rowFraction * 0.5,
      };
    }
    case "ROUND_PROSCENIUM_STAGE": {
      const angle = (2 * Math.PI * seatIndex) / totalSeats - Math.PI / 2;
      const baseRadius = canvasHeight * 0.25;
      const radius = baseRadius + row * (canvasHeight * 0.07);
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy * 0.85 + Math.sin(angle) * radius * 0.6,
        opacity: depthOpacity,
      };
    }
  }
}

export interface ArenaAmphitheaterProps {
  totalSeats?: number;
  totalRows?: number;
  geometryMode?: ArenaGeometryMode;
  occupiedCount?: number;
  width?: number;
  height?: number;
  accentColor?: string;
}

export default function ArenaAmphitheater({
  totalSeats = 120,
  totalRows = 4,
  geometryMode = "U_SHAPED_AMPHITHEATER",
  occupiedCount = 0,
  width = 800,
  height = 320,
  accentColor = "#00FFFF",
}: ArenaAmphitheaterProps) {
  const seatsPerRow = Math.ceil(totalSeats / totalRows);
  const seats: Vector2D[] = [];

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < seatsPerRow; col++) {
      const seatIndex = col;
      seats.push(
        computeArenaSeatVector({
          seatIndex,
          totalSeats: seatsPerRow,
          geometryMode,
          row,
          totalRows,
          canvasWidth: width,
          canvasHeight: height,
        })
      );
    }
  }

  const occupied = Math.min(occupiedCount, seats.length);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        background: "radial-gradient(ellipse at 50% 100%, rgba(0,255,255,0.06) 0%, transparent 65%)",
        overflow: "hidden",
        borderRadius: 12,
        border: `1px solid ${accentColor}18`,
      }}
    >
      {/* Stage platform */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: "35%",
          height: 6,
          background: `linear-gradient(90deg, transparent, ${accentColor}60, rgba(255,45,170,0.5), transparent)`,
          borderRadius: 3,
          boxShadow: `0 0 14px ${accentColor}40`,
        }}
      />

      {/* Seat dots */}
      {seats.map((seat, i) => {
        const isOccupied = i < occupied;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 5,
              height: 5,
              borderRadius: "50%",
              left: seat.x - 2.5,
              top: seat.y - 2.5,
              opacity: seat.opacity,
              background: isOccupied
                ? accentColor
                : "rgba(255,255,255,0.15)",
              boxShadow: isOccupied ? `0 0 4px ${accentColor}80` : "none",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          />
        );
      })}

      {/* Capacity label */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 12,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: accentColor,
          opacity: 0.7,
        }}
      >
        {occupied}/{seats.length}
      </div>
    </div>
  );
}
