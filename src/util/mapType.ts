import { BlockCoord, BlockOffset } from "./canvasUtil";

interface Dictionary<T> {
  [Key: string]: T;
}

// Y: 부스
// N: 공백
// F: 부스가 아니지만 숫자를 증가시킴
// L: F와 동일, 라벨 위치 표현
type LinearElem = { typ: "Y" | "N" | "F" | "L", n: number };
export class LinearRepr {
  arrData: LinearElem[]

  constructor(arrData: LinearElem[] = []) {
    this.arrData = arrData
  }

  static fromStr(reprStr: string) {
    const arrData: LinearElem[] = [];

    const nrepr = reprStr.replace(/\s/g, "");
    if (nrepr.length % 2 !== 0) {
      throw new Error(`Invalid nrepr: odd nrepr length`);
    }
    for (let i = 0; i < nrepr.length; i += 2) {
      const pair = nrepr.slice(i, i + 2);

      const ovltype = pair[0];
      const nvalid = Number(`0x${pair[1]}`);

      if (isNaN(nvalid)) {
        throw new Error(`Invalid nvalid: NaN: ${pair[1]}`)
      }

      if (ovltype !== "Y" && ovltype !== "N" && ovltype !== "F" && ovltype != "L") {
        throw new Error(`Invalid nrepr: invalid ovltype: ${ovltype}`)
      }

      arrData.push({
        typ: ovltype,
        n: nvalid
      });
    }

    return new LinearRepr(arrData);
  }

  iterate(func: (lm: LinearElem) => {}) {
    this.arrData.forEach(func)
  }

  toReversed() {
    const reversed = [...this.arrData].reverse();
    return new LinearRepr(reversed);
  }
}

export type LinMeta = {
  axis: "y" | "x",
  dir: "+" | "-",
  repr: LinearRepr,
  origin: BlockCoord
}

export type BlockMeta = {
  blocks: LinMeta[],
  maxNum: number,
  labelCoords: BlockCoord[]
}

// Build standard column-type block metadata based on template.
export function buildColumn(rightRepr: LinearRepr, x: number, y: number): BlockMeta {
  let blknum = 0;
  let dispos = 0;

  const labelR = {
    y: 0,
    n: 0,
    v: false,
  };

  rightRepr.arrData.forEach(({ typ, n }) => {
    if (typ === "L") {
      if (labelR.v) {
        throw new Error(`Invalid column metadata: Multiple L mark in [${rightRepr}]`)
      } else {
        labelR.y = y - dispos;
        labelR.n = n;
        labelR.v = true;
      }
    }
    if (typ === "Y" || typ === "F") blknum += n;
    dispos += n;
  })

  if (!labelR.v) {
    throw new Error(`Invalid column metadata: No label metadata: [${rightRepr}]`)
  }

  const leftRepr = rightRepr.toReversed();
  return {
    blocks: [
      {
        origin: new BlockCoord({ x, y }),
        axis: "y",
        dir: "-",
        repr: rightRepr
      },
      {
        origin: new BlockCoord({ x: x - 1, y: y - dispos + 1 }),
        axis: "y",
        dir: "+",
        repr: leftRepr
      }
    ],
    maxNum: blknum * 2,
    labelCoords: [new BlockCoord({ x: x - 1, y: labelR.y - labelR.n + 1 })]
  }
}

export type MapMetadata = {
  backgroundUrl?: string,
  size: BlockOffset,
  blockDict: Dictionary<BlockMeta>
}