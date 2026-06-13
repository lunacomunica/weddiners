function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase().padStart(4, "0"));
}

function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export interface PixPayloadOptions {
  pixKey: string;
  holderName: string;
  city: string;
  amount: number;
  txId?: string;
  description?: string;
}

export function generatePixPayload(opts: PixPayloadOptions): string {
  const { pixKey, holderName, city, amount, description } = opts;
  const txId = (opts.txId ?? "WEDDINERS").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 25) || "WEDDINERS";

  const merchantAccountInfo = field("00", "BR.GOV.BCB.PIX") + field("01", pixKey) + (description ? field("02", description.slice(0, 72)) : "");
  const amountStr = amount.toFixed(2);
  const nameClean = holderName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 25);
  const cityClean = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 15);

  const additionalData = field("05", txId);

  const payload =
    field("00", "01") +
    field("26", merchantAccountInfo) +
    field("52", "0000") +
    field("53", "986") +
    field("54", amountStr) +
    field("58", "BR") +
    field("59", nameClean) +
    field("60", cityClean) +
    field("62", additionalData) +
    "6304";

  return payload + crc16(payload);
}
