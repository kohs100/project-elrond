import React from "react";

export const BLOCKSIZE = 20;

export type ClientXY = {
  clientX: number;
  clientY: number;
};

interface IRawXY { x: number; y: number; }
interface IView extends IRawXY { intoAbs(scale: number): IAbs }
interface IAbs extends IRawXY { intoView(scale: number): IView; intoBlk(): IBlk }
interface IBlk extends IRawXY { intoAbs(): IAbs }
class RawXY implements IRawXY {
  x: number;
  y: number;
  constructor({ x, y }: IRawXY) {
    this.x = x;
    this.y = y;
  }
  rawsub = (rhs: RawXY) => ({ x: this.x - rhs.x, y: this.y - rhs.y })
  rawadd = (rhs: RawXY) => ({ x: this.x + rhs.x, y: this.y + rhs.y })
  rawdiv = (sc: number) => ({ x: this.x / sc, y: this.y / sc })
  rawmul = (sc: number) => ({ x: this.x * sc, y: this.y * sc })
  rawl2norm = () => Math.sqrt(this.x * this.x + this.y * this.y)
  rawblk = () => ({
    x: Math.floor(this.x / BLOCKSIZE),
    y: Math.floor(this.y / BLOCKSIZE)
  })
  rawunblk = () => ({
    x: this.x * BLOCKSIZE,
    y: this.y * BLOCKSIZE
  })
  rawdivelem = (rhs: IRawXY) => ({ x: this.x / rhs.x, y: this.y / rhs.y })
  rawmulelem = (rhs: IRawXY) => ({ x: this.x * rhs.x, y: this.y * rhs.y })

  // Type dark magic
  static from<T extends typeof RawXY>(this: T, arg: IRawXY): InstanceType<T> {
    return new this(arg) as InstanceType<T>;
  }
}

interface ICoord<T extends IView | IAbs | IBlk> extends IRawXY {
  sub(rhs: ICoord<T> & T): IOffset<T>;
  subOffset(rhs: IOffset<T> & T): ICoord<T> & T;
  addOffset(rhs: IOffset<T> & T): ICoord<T> & T;
};
interface IOffset<T extends IView | IAbs | IBlk> extends IRawXY {
  sub(rhs: this): IOffset<T> & T;
  add(rhs: this): IOffset<T> & T;
  l2norm(): number;
};


export class ViewCoord extends RawXY implements IView, ICoord<IView> {
  intoAbs = (scale: number) => AbsCoord.from(this.rawdiv(scale))
  sub = (rhs: ViewCoord) => ViewOffset.from(this.rawsub(rhs))
  subOffset = (rhs: ViewOffset) => ViewCoord.from(this.rawsub(rhs))
  addOffset = (rhs: ViewOffset) => ViewCoord.from(this.rawadd(rhs))
  static fromClient({ clientX, clientY }: ClientXY) {
    return new ViewCoord({
      x: clientX,
      y: clientY
    })
  }
}
export class ViewOffset extends RawXY implements IView, IOffset<IView> {
  intoAbs = (scale: number) => AbsOffset.from(this.rawdiv(scale))
  sub = (rhs: ViewOffset) => ViewOffset.from(this.rawsub(rhs))
  add = (rhs: ViewOffset) => ViewOffset.from(this.rawadd(rhs))
  l2norm = () => this.rawl2norm()
  static sizeOfCanvas(canvas: HTMLCanvasElement) {
    const canvasRect = canvas.getBoundingClientRect();

  return new ViewOffset({
      x: canvasRect.width,
      y: canvasRect.height
    })
  }
  static offsetOfCanvas(canvas: HTMLCanvasElement) {
    const canvasRect = canvas.getBoundingClientRect();

  return new ViewOffset({
      x: canvasRect.left,
      y: canvasRect.top
    })
  }
}
export class AbsCoord extends RawXY implements IAbs, ICoord<IAbs> {
  intoView = (scale: number) => ViewCoord.from(this.rawmul(scale))
  intoBlk = () => BlockCoord.from(this.rawblk())
  sub = (rhs: AbsCoord) => AbsOffset.from(this.rawsub(rhs))
  subOffset = (rhs: AbsOffset) => AbsCoord.from(this.rawsub(rhs))
  addOffset = (rhs: AbsOffset) => AbsCoord.from(this.rawadd(rhs))
}
export class AbsOffset extends RawXY implements IAbs, IOffset<IAbs> {
  intoView = (scale: number) => ViewOffset.from(this.rawmul(scale))
  intoBlk = () => BlockOffset.from(this.rawblk())
  sub = (rhs: AbsOffset) => AbsOffset.from(this.rawsub(rhs))
  add = (rhs: AbsOffset) => AbsOffset.from(this.rawadd(rhs))
  l2norm = () => this.rawl2norm()
}
export class BlockCoord extends RawXY implements IBlk, ICoord<IBlk> {
  intoAbs = () => AbsCoord.from(this.rawunblk())
  sub = (rhs: BlockCoord) => BlockOffset.from(this.rawsub(rhs))
  subOffset = (rhs: BlockOffset) => BlockCoord.from(this.rawsub(rhs))
  addOffset = (rhs: BlockOffset) => BlockCoord.from(this.rawadd(rhs))
}
export class BlockOffset extends RawXY implements IBlk, IOffset<IBlk> {
  intoAbs = () => AbsOffset.from(this.rawunblk())
  sub = (rhs: BlockOffset) => BlockOffset.from(this.rawsub(rhs))
  add = (rhs: BlockOffset) => BlockOffset.from(this.rawadd(rhs))
  l2norm = () => this.rawl2norm()
}

export function limitOffset(
  offset: ViewOffset,
  lower: ViewOffset | null,
  upper: ViewOffset | null
) {
  const newOffset = {
    x: offset.x,
    y: offset.y
  };

  const { x: ux, y: uy } = upper ? upper : { x: 0, y: 0 };
  const { x: lx, y: ly } = lower ? lower : { x: 0, y: 0 };

  newOffset.x = newOffset.x < lx ? lx : newOffset.x;
  newOffset.y = newOffset.y < ly ? ly : newOffset.y;

  newOffset.x = newOffset.x > ux ? ux : newOffset.x;
  newOffset.y = newOffset.y > uy ? uy : newOffset.y;

  return new ViewOffset(newOffset);
}

export function getTouchDistance(touches: React.TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getMidpoint(touches: React.TouchList): ViewCoord {
  return new ViewCoord({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });
}

export class CoordMap {
  private map: Map<number, Map<number, string>> = new Map();
  private rmap: Map<string, BlockCoord> = new Map();

  set(coord: BlockCoord, locstring: string) {
    const foundLocstring = this.getLocstring(coord);
    const foundCoord = this.getCoord(locstring);

    if (foundLocstring) {
      console.log(`Duplicated coord: ${coord}: existing ${foundLocstring} -> ${locstring}`)
    }
    if (foundCoord) {
      console.log(`Duplicated locstring: ${locstring}: existing ${foundCoord} -> ${coord}`)
    }
    if (!this.map.has(coord.x)) {
      this.map.set(coord.x, new Map());
    }
    this.map.get(coord.x)!.set(coord.y, locstring);
    this.rmap.set(locstring, new BlockCoord(coord));
  }

  getLocstring(coord: BlockCoord): string | undefined {
    return this.map.get(coord.x)?.get(coord.y);
  }

  getCoord(locstring: string): BlockCoord | undefined {
    const found = this.rmap.get(locstring);

    if (found) {
      return new BlockCoord(found);
    } else {
      return undefined;
    }
  }

  hasCoord({ x, y }: BlockCoord): boolean {
    return this.map.has(x) && this.map.get(x)!.has(y);
  }

  hasLocstring(locstring: string): boolean {
    return this.rmap.has(locstring);
  }

  deleteInner({ x, y }: BlockCoord, locstring: string) {
    this.rmap.delete(locstring);
    this.map.get(x)!.delete(y);
    if (this.map.get(x)!.size === 0) {
      this.map.delete(x);
    }
  }

  deleteCoord(coord: BlockCoord): boolean {
    const locstring = this.getLocstring(coord);
    if (locstring) {
      this.deleteInner(coord, locstring);
      return true;
    } else {
      return false;
    }
  }

  deleteLocstring(locstring: string): boolean {
    const coord = this.rmap.get(locstring);
    if (coord) {
      this.deleteInner(coord, locstring);
      return true;
    } else {
      return false;
    }
  }
}