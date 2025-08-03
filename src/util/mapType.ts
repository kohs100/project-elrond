import type { BlockXY } from "./canvasUtil";

interface Dictionary<T> {
  [Key: string]: T;
}

// Y: 부스
// N: 공백
// F: 부스가 아니지만 숫자를 증가시킴
type LinearElem = { typ: "Y" | "N" | "F", n: number };
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

      if (ovltype !== "Y" && ovltype !== "N" && ovltype !== "F") {
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
  origin: BlockXY
}

export type BlockMeta = {
  blocks: LinMeta[],
  max_num: number,
}

// Build standard column-type block metadata based on template.
export function buildColumn(rightRepr: LinearRepr, x: number, y: number): BlockMeta {
  let blknum = 0;
  let dispos = 0;
  rightRepr.arrData.forEach(({ typ, n }) => {
    if (typ === "Y" || typ === "F") blknum += n;
    dispos += n;
  })
  const leftRepr = rightRepr.toReversed();

  return {
    blocks: [
      {
        origin: { blockX: x, blockY: y },
        axis: "y",
        dir: "-",
        repr: rightRepr
      },
      {
        origin: { blockX: x - 1, blockY: y - dispos + 1 },
        axis: "y",
        dir: "+",
        repr: leftRepr
      }
    ],
    max_num: blknum * 2
  }
}

export type MapMetadata = {
  backgroundUrl?: string,
  size: BlockXY,
  blockDict: Dictionary<BlockMeta>
}