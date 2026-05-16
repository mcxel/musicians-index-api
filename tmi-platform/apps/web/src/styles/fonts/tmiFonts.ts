import { Anton, Bebas_Neue, Bungee, Oswald, Rajdhani, Orbitron } from "next/font/google";

export const tmiAnton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-tmi-anton",
  display: "swap",
});

export const tmiBebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-tmi-bebas",
  display: "swap",
});

export const tmiOswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tmi-oswald",
  display: "swap",
});

export const tmiRajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-tmi-rajdhani",
  display: "swap",
});

export const tmiBungee = Bungee({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-tmi-bungee",
  display: "swap",
});

export const tmiOrbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-tmi-orbitron",
  display: "swap",
});
