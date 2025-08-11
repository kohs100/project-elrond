import { BlockCoord, BlockOffset } from "../../util/canvasUtil";
import { type MapMetadata, LinearRepr, buildColumn as rawBuildColumn } from "../../util/mapType";
import { ALL_FW_LOWER } from "../../util/searchType";

type COL_TYP = "44" | "46" | "42"

const COL_TEMPLATE = {
  "42": LinearRepr.fromStr("Y9 L2 Y7 N2 Y5"),
  "44": LinearRepr.fromStr("Y9 L2 Y7 N2 Y6"),
  "46": LinearRepr.fromStr("Y9 L2 Y7 N2 Y7"),
}

function buildColumn(ctyp: COL_TYP, x: number, y: number) {
  return rawBuildColumn(COL_TEMPLATE[ctyp], x, y)
}

const metadata: MapMetadata = {
  backgroundUrl: "images/c106_day1_s.png",
  size: new BlockOffset({ x: 62, y: 34 }),
  event_id: 1,
  location_top: "南",
  location_prefix: ALL_FW_LOWER,
  blockDict: {
    "ａ": {
      blocks: [
        {
          origin: new BlockCoord({ x: 55, y: 31 }),
          axis: "x",
          dir: "+",
          repr: LinearRepr.fromStr("Y2 N1 Y2")
        },
        {
          origin: new BlockCoord({ x: 60, y: 28 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y1 N1 Y2 N1 Y5 N5 Y4 N1 Y2 N1 Y2")
        },
        {
          origin: new BlockCoord({x: 56, y: 1 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y2 N1 Y2 N1 Y2")
        },
        {
          origin: new BlockCoord({x: 45, y: 2 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y3")
        },
        {
          origin: new BlockCoord({x: 38, y: 1 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y1 N1 Y2")
        },
        {
          origin: new BlockCoord({x: 25, y: 1 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y2 N1 Y2 N1 Y3")
        },
        {
          origin: new BlockCoord({x: 10, y: 1 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y3 N2 Y1 N1 Y3")
        },
        {
          origin: new BlockCoord({x: 0, y:23 }),
          axis: "y",
          dir: "+",
          repr: LinearRepr.fromStr("Y2 N1 Y2 N1 Y2")
        }
        ,
        {
          origin: new BlockCoord({x: 24, y:31 }),
          axis: "x",
          dir: "+",
          repr: LinearRepr.fromStr("Y3")
        }
      ],
      maxNum: 55,
      labelCoords: []
    },
    "ｂ": buildColumn("46", 57, 29),
    "ｃ": buildColumn("46", 54, 29),
    "ｄ": buildColumn("46", 51, 29),
    "ｅ": buildColumn("44", 48, 29),
    "ｆ": buildColumn("44", 45, 29),
    "ｇ": buildColumn("44", 42, 29),
    "ｈ": buildColumn("46", 39, 29),
    "ｉ": buildColumn("46", 36, 29),
    "ｊ": buildColumn("46", 33, 29),
    "ｋ": buildColumn("46", 30, 29),
    "ｌ": buildColumn("46", 27, 29),
    "ｍ": buildColumn("46", 24, 29),
    "ｎ": buildColumn("46", 21, 29),
    "ｏ": buildColumn("44", 18, 29),
    "ｐ": buildColumn("44", 15, 29),
    "ｑ": buildColumn("44", 12, 29),
    "ｒ": buildColumn("44", 9, 29),
    "ｓ": buildColumn("44", 6, 29),
    "ｔ": buildColumn("44", 3, 29),
  }
};


export default metadata;