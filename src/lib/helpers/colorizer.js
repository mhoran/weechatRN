import { sha256 } from "js-sha256";

const AVAILABLE_COLORS = [
  "#3E4141",
  "#F1F1F0",
  "#554141",
  "#654141",
  "#DAACDF",
  "#FFCF85",
  "#80AAC6",
  "#B4C978",
  "#CADFFE",
  "#E7E6A0",
  "#F66864",
  "#929292",
  "#03FCFE",
  "#F2C6F7",
  "#E3F6FF",
  "#9CC4DF",
  "#CDE28C",
  "#73DFFD",
  "#DF82FC",
  "#06DEFD",
  "#00DA9A",
  "#38ACE2",
  "#72DA9B",
  "#72FDFE",
  "#35C240",
  "#16BEA1",
  "#00D825",
  "#0ABFFC",
  "#00F72C",
  "#99FABF",
  "#72FABE",
  "#BCFBBF",
  "#DF9DBC",
  "#00F99C",
  "#BDC1FD",
  "#71F72D",
  "#98F82F",
  "#BDE0FE",
  "#BCF830",
  "#FFA3FD",
  "#BDBB9A",
  "#FFBB2A",
  "#BDDB9C",
  "#E664FC",
  "#BDFEFE",
  "#DFFEFF",
  "#BD9CBC",
  "#E866B6",
  "#DEFA9E",
  "#FFC3FE",
  "#DF7BBC",
  "#FFE1FE",
  "#FFDEBF",
  "#FF7DBC",
  "#FF7620",
  "#FFDB2F",
  "#FEF935",
  "#FFFB9E",
  "#FFFFFF"
];

const sessionCache = {};

export const hashNickToColor = nick => {
  if (sessionCache[nick]) {
    return sessionCache[nick];
  }

  const hash = parseInt(sha256(nick), 16);
  const nickColor = AVAILABLE_COLORS[hash % AVAILABLE_COLORS.length];
  sessionCache[nick] = nickColor;

  return nickColor;
};
