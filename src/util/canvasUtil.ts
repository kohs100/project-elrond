import React from "react";

interface IRawXY { x: number; y: number; }
interface IAbsolute extends IRawXY { scale(scale: number): IScaled }
interface IScaled extends IRawXY { unscale(scale: number): IAbsolute }
interface ICoord<T extends IAbsolute | IScaled> extends IRawXY {
  sub(rhs: ICoord<T> & T): IOffset<T>;
  subOffset(rhs: IOffset<T> & T): ICoord<T> & T;
  addOffset(rhs: IOffset<T> & T): ICoord<T> & T;
};
interface IOffset<T extends IAbsolute | IScaled> extends IRawXY {
  sub(rhs: this): IOffset<T> & T;
  add(rhs: this): IOffset<T> & T;
  l2norm(): number;
};

class RawXY implements IRawXY {
  x: number;
  y: number;
  constructor({ x, y }: IRawXY) {
    this.x = x;
    this.y = y;
  }
  rawsub = (rhs: RawXY) => ({ x: this.x - rhs.x, y: this.y - rhs.y })
  rawadd = (rhs: RawXY) => ({ x: this.x + rhs.x, y: this.y + rhs.y })
  rawscale = (sc: number) => ({ x: this.x / sc, y: this.y / sc })
  rawunscale = (sc: number) => ({ x: this.x * sc, y: this.y * sc })
  rawl2norm = () => Math.sqrt(this.x * this.x + this.y * this.y)
  static from<T extends typeof RawXY>(this: T, arg: IRawXY): InstanceType<T> {
    return new this(arg) as InstanceType<T>;
  }
}

export class AbsCoord extends RawXY implements IAbsolute, ICoord<IAbsolute> {
  scale = (scale: number) => ScaledCoord.from(this.rawscale(scale))
  sub = (rhs: AbsCoord) => AbsOffset.from(this.rawsub(rhs))
  subOffset = (rhs: AbsOffset) => AbsCoord.from(this.rawsub(rhs))
  addOffset = (rhs: AbsOffset) => AbsCoord.from(this.rawadd(rhs))
}
export class AbsOffset extends RawXY implements IAbsolute, IOffset<IAbsolute> {
  scale = (scale: number) => ScaledOffset.from(this.rawscale(scale))
  sub = (rhs: AbsOffset) => AbsOffset.from(this.rawsub(rhs))
  add = (rhs: AbsOffset) => AbsOffset.from(this.rawadd(rhs))
  l2norm = () => this.rawl2norm()
}
export class ScaledCoord extends RawXY implements IScaled, ICoord<IScaled> {
  unscale = (scale: number) => AbsCoord.from(this.rawunscale(scale))
  sub = (rhs: ScaledCoord) => ScaledOffset.from(this.rawsub(rhs))
  subOffset = (rhs: ScaledOffset) => ScaledCoord.from(this.rawsub(rhs))
  addOffset = (rhs: ScaledOffset) => ScaledCoord.from(this.rawadd(rhs))
}
export class ScaledOffset extends RawXY implements IScaled, IOffset<IScaled> {
  unscale = (scale: number) => AbsOffset.from(this.rawunscale(scale))
  sub = (rhs: ScaledOffset) => ScaledOffset.from(this.rawsub(rhs))
  add = (rhs: ScaledOffset) => ScaledOffset.from(this.rawadd(rhs))
  l2norm = () => this.rawl2norm()
}

export function getCanvasOffset(canvas: HTMLCanvasElement) {
  const canvasRect = canvas.getBoundingClientRect();

  return new AbsOffset({
    x: canvasRect.left,
    y: canvasRect.top
  })
}

export type ClientXY = {
  clientX: number;
  clientY: number;
};

export function getClientCoord({ clientX, clientY }: ClientXY) {
  return new AbsCoord({
    x: clientX,
    y: clientY
  })
}

export function limitOffset(offset: AbsOffset, lower: IRawXY, upper: IRawXY) {
  const newOffset = {
    x: offset.x,
    y: offset.y
  };

  const { x: ux, y: uy } = upper;
  const { x: lx, y: ly } = lower;

  newOffset.x = newOffset.x < lx ? lx : newOffset.x;
  newOffset.y = newOffset.y < ly ? ly : newOffset.y;

  newOffset.x = newOffset.x > ux ? ux : newOffset.x;
  newOffset.y = newOffset.y > uy ? uy : newOffset.y;

  return new AbsOffset(newOffset);
}

export function getBlockCoord({ x, y }: ScaledCoord): BlockXY {
  return {
    blockX: Math.floor(x / 20),
    blockY: Math.floor(y / 20)
  }
}

export function fromBlockCoord({ blockX, blockY }: BlockXY): ScaledCoord {
  return new ScaledCoord({ x: blockX * 20, y: blockY * 20 })
}

// Absolute block coordinate
export type BlockXY = {
  blockX: number;
  blockY: number;
}

export function getTouchDistance(touches: React.TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getMidpoint(touches: React.TouchList): AbsCoord {
  return new AbsCoord({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });
}

export class CoordMap {
  private map: Map<number, Map<number, string>> = new Map();
  private rmap: Map<string, BlockXY> = new Map();

  set(coord: BlockXY, locstring: string) {
    const foundLocstring = this.getLocstring(coord);
    const foundCoord = this.getCoord(locstring);

    if (foundLocstring) {
      console.log(`Duplicated coord: ${coord}: existing ${foundLocstring} -> ${locstring}`)
    }
    if (foundCoord) {
      console.log(`Duplicated locstring: ${locstring}: existing ${foundCoord} -> ${coord}`)
    }
    if (!this.map.has(coord.blockX)) {
      this.map.set(coord.blockX, new Map());
    }
    this.map.get(coord.blockX)!.set(coord.blockY, locstring);
    this.rmap.set(locstring, { blockX: coord.blockX, blockY: coord.blockY });
  }

  getLocstring(coord: BlockXY): string | undefined {
    return this.map.get(coord.blockX)?.get(coord.blockY);
  }

  getCoord(locstring: string): BlockXY | undefined {
    const found = this.rmap.get(locstring);

    if (found) {
      const { blockX, blockY } = found;
      return { blockX, blockY }
    } else {
      return undefined;
    }
  }

  hasCoord(coord: BlockXY): boolean {
    return this.map.has(coord.blockX) && this.map.get(coord.blockX)!.has(coord.blockY);
  }

  hasLocstring(locstring: string): boolean {
    return this.rmap.has(locstring);
  }

  deleteInner(coord: BlockXY, locstring: string) {
    this.rmap.delete(locstring);
    this.map.get(coord.blockX)!.delete(coord.blockY);
    if (this.map.get(coord.blockX)!.size === 0) {
      this.map.delete(coord.blockX);
    }
  }

  deleteCoord(coord: BlockXY): boolean {
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