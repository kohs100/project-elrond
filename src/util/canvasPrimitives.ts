
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

class Viewolute<T extends RawCoord | RawOffset> extends RawXY {
  scale(scale: number) {
    return new Abs<T>(this.x / scale, this.y / scale)
  }
}
class Abs<T extends RawCoord | RawOffset> extends RawXY {
  unscale(scale: number) {
    return new Abs<T>(this.x * scale, this.y * scale)
  }
}

export class ViewOffset extends Viewolute<RawOffset> implements RawOffset {}
export class ViewCoord extends Viewolute<RawCoord> implements RawCoord {
  sub(rhs: ViewCoord): ViewOffset {
    return new ViewOffset(
      this.x - rhs.x,
      this.y - rhs.y
    )
  }
  addOffset(rhs: ViewOffset): ViewCoord {
    return new ViewCoord(
      this.x + rhs.x,
      this.y + rhs.y
    )
  }
  subOffset(rhs: ViewOffset): ViewCoord {
    return new ViewCoord(
      this.x - rhs.x,
      this.y - rhs.y
    )
  }
}

export class AbsOffset extends Abs<RawOffset> {}
export class AbsCoord extends Abs<RawCoord> {
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