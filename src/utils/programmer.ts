import { BitWordSize } from '../types';

export function getBitMask(wordSize: BitWordSize): bigint {
  switch (wordSize) {
    case 'BYTE': return 0xFFn;
    case 'WORD': return 0xFFFFn;
    case 'DWORD': return 0xFFFFFFFFn;
    case 'QWORD': return 0xFFFFFFFFFFFFFFFFn;
  }
}

export function getBitLength(wordSize: BitWordSize): number {
  switch (wordSize) {
    case 'BYTE': return 8;
    case 'WORD': return 16;
    case 'DWORD': return 32;
    case 'QWORD': return 64;
  }
}

export function clampToWordSize(val: bigint, wordSize: BitWordSize): bigint {
  const mask = getBitMask(wordSize);
  return val & mask;
}

export function toSignedDecimal(val: bigint, wordSize: BitWordSize): string {
  const clamped = clampToWordSize(val, wordSize);
  const bitLength = getBitLength(wordSize);
  const signBit = 1n << BigInt(bitLength - 1);
  if ((clamped & signBit) !== 0n) {
    // Negative number in two's complement
    const mask = getBitMask(wordSize);
    const inverted = (clamped ^ mask) + 1n;
    return `-${inverted.toString(10)}`;
  }
  return clamped.toString(10);
}

export function formatBinary(val: bigint, wordSize: BitWordSize): string {
  const bitLength = getBitLength(wordSize);
  const clamped = clampToWordSize(val, wordSize);
  let binStr = clamped.toString(2);
  while (binStr.length < bitLength) {
    binStr = '0' + binStr;
  }
  // Group into nibbles of 4 bits
  return binStr.match(/.{1,4}/g)?.join(' ') || binStr;
}

export function formatHex(val: bigint, wordSize: BitWordSize): string {
  const clamped = clampToWordSize(val, wordSize);
  return clamped.toString(16).toUpperCase();
}

export function formatOctal(val: bigint, wordSize: BitWordSize): string {
  const clamped = clampToWordSize(val, wordSize);
  return clamped.toString(8);
}

export function formatDecimal(val: bigint, wordSize: BitWordSize): string {
  const clamped = clampToWordSize(val, wordSize);
  return clamped.toString(10);
}
