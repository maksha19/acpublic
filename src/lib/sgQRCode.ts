/**
 * sgqrCode.ts
 * Singapore Quick Response (SGQR) Code generator for PayNow transactions.
 *
 * Reimplements the standard EMVCo TLV payload + CRC16-CCITT checksum
 * structure used by PayNow QR codes, matching the public API shape of
 * the `sgqr-code` npm package (getPaynowQRCode(options)).
 *
 * Usage in a React component:
 *   import { getPaynowQRCode } from './sgqrCode';
 *   const payload = getPaynowQRCode({ uen: '123456789A', amount: 25.99 });
 *   <QRCode value={payload} /> // e.g. from 'qrcode.react'
 */

export interface PaynowQRCodeOptions {
  initiationMethod?: '11' | '12'; // '11' static, '12' dynamic
  referenceNumber?: string; // max length 99
  merchantName?: string; // max length 25
  amount?: number | null;
  amountEditable?: '0' | '1';
  uen?: string | null; // max length 16
  phone?: string | null; // max length 16, must start with +65
  transactionCurrency?: string; // ISO 4217 numeric, default '702' (SGD)
  countryCode?: string; // default 'SG'
  merchantCity?: string; // default 'Singapore'
  uniqueIdentifier?: string; // default 'SG.PAYNOW'
  expiryDate?: string | null; // YYYYMMDD or YYYYMMDDHHMMSS
}

interface TLVField {
  id: string;
  value: string;
}

// ---- Helpers -------------------------------------------------------------

function padLeft(value: string | number, length: number, pad = '0'): string {
  const str = String(value);
  return str.length >= length ? str : pad.repeat(length - str.length) + str;
}

/** Wraps a value into a Tag-Length-Value segment: [2-digit tag][2-digit length][value] */
function tlv(id: string, value: string): string {
  return `${id}${padLeft(value.length, 2)}${value}`;
}

/** Builds a nested TLV block (e.g. Merchant Account Info template) from sub-fields. */
function buildNestedTLV(fields: TLVField[]): string {
  return fields.map((f) => tlv(f.id, f.value)).join('');
}

/**
 * CRC16-CCITT (polynomial 0x1021, initial value 0xFFFF), used as the
 * final checksum tag (63) required by the EMVCo QR Code spec.
 */
function crc16(input: string): string {
  let crc = 0xffff;

  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c > 255) {
      throw new RangeError('crc16: input contains non-Latin1 character');
    }
    crc ^= c << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return padLeft(crc.toString(16).toUpperCase(), 4);
}

function generateReferenceNumber(): string {
  // Simple timestamp + random suffix; replace with your own scheme if needed.
  return `REF${Date.now().toString(36).toUpperCase()}`;
}

function validate(opts: Required<PaynowQRCodeOptions>): void {
  if (!opts.uen && !opts.phone) {
    throw new Error('Either "uen" or "phone" must be provided.');
  }
  if (opts.phone && !/^\+65\d{8}$/.test(opts.phone)) {
    throw new Error('"phone" must be a Singapore number in the format +65XXXXXXXX.');
  }
  if (opts.merchantName.length > 25) {
    throw new Error('"merchantName" must be 25 characters or fewer.');
  }
  if (opts.uen && opts.uen.length > 16) {
    throw new Error('"uen" must be 16 characters or fewer.');
  }
  if (opts.phone && opts.phone.length > 16) {
    throw new Error('"phone" must be 16 characters or fewer.');
  }
  if (opts.referenceNumber.length > 99) {
    throw new Error('"referenceNumber" must be 99 characters or fewer.');
  }
  if (opts.expiryDate) {
    if (!/^\d{8}(\d{6})?$/.test(opts.expiryDate)) {
      throw new Error('"expiryDate" must be in format YYYYMMDD or YYYYMMDDHHMMSS.');
    }
    const year = Number(opts.expiryDate.slice(0, 4));
    const month = Number(opts.expiryDate.slice(4, 6));
    const day = Number(opts.expiryDate.slice(6, 8));
    const expiry = new Date(year, month - 1, day);
    if (expiry.getTime() < Date.now()) {
      throw new Error('"expiryDate" must be in the future.');
    }
  }
}

// ---- Main API --------------------------------------------------------------

export function getPaynowQRCode(options: PaynowQRCodeOptions): string {
  const hasAmount = options.amount !== undefined && options.amount !== null;

  const opts: Required<PaynowQRCodeOptions> = {
    initiationMethod: options.initiationMethod ?? '12',
    referenceNumber: options.referenceNumber ?? generateReferenceNumber(),
    merchantName: options.merchantName ?? 'NA',
    amount: hasAmount ? (options.amount as number) : null,
    amountEditable: hasAmount ? options.amountEditable ?? '0' : '0',
    uen: options.uen ?? null,
    phone: options.phone ?? null,
    transactionCurrency: options.transactionCurrency ?? '702',
    countryCode: options.countryCode ?? 'SG',
    merchantCity: options.merchantCity ?? 'Singapore',
    uniqueIdentifier: options.uniqueIdentifier ?? 'SG.PAYNOW',
    expiryDate: options.expiryDate ?? null,
  };

  validate(opts);

  // Merchant Account Info template (nested TLV, tag 26)
  const merchantAccountInfo = buildNestedTLV([
    { id: '00', value: opts.uniqueIdentifier },
    { id: '01', value: opts.uen ? '2' : '0' }, // 0 = mobile, 2 = UEN
    { id: '02', value: opts.uen ?? (opts.phone as string) },
    { id: '03', value: opts.amountEditable },
    ...(opts.expiryDate ? [{ id: '04', value: opts.expiryDate }] : []),
  ]);

  // Additional Data Field Template (tag 62) — carries the reference number
  const additionalData = buildNestedTLV([{ id: '01', value: opts.referenceNumber }]);

  const fields: TLVField[] = [
    { id: '00', value: '01' }, // Payload Format Indicator, fixed
    { id: '01', value: opts.initiationMethod },
    { id: '26', value: merchantAccountInfo },
    { id: '52', value: '0000' }, // Merchant Category Code, unused for P2P
    { id: '53', value: opts.transactionCurrency },
    ...(hasAmount ? [{ id: '54', value: (opts.amount as number).toFixed(2) }] : []),
    { id: '58', value: opts.countryCode },
    { id: '59', value: opts.merchantName },
    { id: '60', value: opts.merchantCity },
    { id: '62', value: additionalData },
  ];

  const payloadWithoutCRC = fields.map((f) => tlv(f.id, f.value)).join('') + '6304';
  const checksum = crc16(payloadWithoutCRC);

  return payloadWithoutCRC + checksum;
}