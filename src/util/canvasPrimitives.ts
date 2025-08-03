
export class RawXY {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y
  }
}

interface RawCoord extends RawXY {
  sub(rhs: this): RawOffset
};
interface RawOffset extends RawXY {};

class Absolute<T extends RawCoord | RawOffset> extends RawXY {
  scale(scale: number) {
    return new Scaled<T>(this.x / scale, this.y / scale)
  }
}
class Scaled<T extends RawCoord | RawOffset> extends RawXY {
  unscale(scale: number) {
    return new Scaled<T>(this.x * scale, this.y * scale)
  }
}

export class AbsOffset extends Absolute<RawOffset> implements RawOffset {}
export class AbsCoord extends Absolute<RawCoord> implements RawCoord {
  sub(rhs: AbsCoord): AbsOffset {
    return new AbsOffset(
      this.x - rhs.x,
      this.y - rhs.y
    )
  }
  addOffset(rhs: AbsOffset): AbsCoord {
    return new AbsCoord(
      this.x + rhs.x,
      this.y + rhs.y
    )
  }
  subOffset(rhs: AbsOffset): AbsCoord {
    return new AbsCoord(
      this.x - rhs.x,
      this.y - rhs.y
    )
  }
}

export class ScaledOffset extends Scaled<RawOffset> {}
export class ScaledCoord extends Scaled<RawCoord> {
  sub(rhs: ScaledCoord): ScaledOffset {
    return new ScaledOffset(
      this.x - rhs.x,
      this.y - rhs.y
    )
  }
  addOffset(rhs: ScaledOffset): ScaledCoord {
    return new ScaledCoord(
      this.x + rhs.x,
      this.y + rhs.y
    )
  }
  subOffset(rhs: ScaledOffset): ScaledCoord {
    return new ScaledCoord(
      this.x - rhs.x,
      this.y - rhs.y
    )
  }
}