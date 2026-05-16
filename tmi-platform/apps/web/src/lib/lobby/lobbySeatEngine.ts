export type SeatZone = "vip" | "standard" | "overflow" | "standing";
export type SeatState = "empty" | "occupied" | "reserved" | "bot-held" | "live performer";

export type LobbySeat = {
  id: string;
  row: string;
  index: number;
  zone: SeatZone;
  state: SeatState;
  occupantName?: string;
};

export type LobbySeatMap = {
  roomId: string;
  seats: LobbySeat[];
};

export function createSeatMap(roomId: string): LobbySeatMap {
  const seatDefs: Array<[string, SeatZone, number]> = [
    ["VIP", "vip", 8],
    ["MID", "standard", 16],
    ["REAR", "overflow", 14],
    ["STAND", "standing", 10],
  ];

  const seats: LobbySeat[] = [];
  for (const [row, zone, count] of seatDefs) {
    for (let index = 1; index <= count; index += 1) {
      seats.push({
        id: `${row}-${index}`,
        row,
        index,
        zone,
        state: "empty",
      });
    }
  }

  seats[0] = { ...seats[0], state: "reserved", occupantName: "Host +1" };
  seats[2] = { ...seats[2], state: "bot-held", occupantName: "Bot Sentinel" };
  seats[5] = { ...seats[5], state: "occupied", occupantName: "NovaK" };

  return { roomId, seats };
}

export function claimSeat(map: LobbySeatMap, seatId: string, name: string): LobbySeatMap {
  return {
    ...map,
    seats: map.seats.map((seat) =>
      seat.id === seatId && seat.state === "empty"
        ? { ...seat, state: "occupied", occupantName: name }
        : seat,
    ),
  };
}

export function releaseSeat(map: LobbySeatMap, seatId: string): LobbySeatMap {
  return {
    ...map,
    seats: map.seats.map((seat) =>
      seat.id === seatId ? { ...seat, state: "empty", occupantName: undefined } : seat,
    ),
  };
}

export function reserveSeat(map: LobbySeatMap, seatId: string, name: string): LobbySeatMap {
  return {
    ...map,
    seats: map.seats.map((seat) =>
      seat.id === seatId && seat.state === "empty"
        ? { ...seat, state: "reserved", occupantName: name }
        : seat,
    ),
  };
}

export function switchSeat(map: LobbySeatMap, fromSeatId: string, toSeatId: string): LobbySeatMap {
  const from = map.seats.find((seat) => seat.id === fromSeatId);
  const to = map.seats.find((seat) => seat.id === toSeatId);
  if (!from || !to || from.state !== "occupied" || to.state !== "empty") {
    return map;
  }

  return {
    ...map,
    seats: map.seats.map((seat) => {
      if (seat.id === fromSeatId) {
        return { ...seat, state: "empty", occupantName: undefined };
      }
      if (seat.id === toSeatId) {
        return { ...seat, state: "occupied", occupantName: from.occupantName };
      }
      return seat;
    }),
  };
}
