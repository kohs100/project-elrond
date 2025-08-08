import { BlockCoord, BlockOffset } from "../../util/canvasUtil";
import { type MapMetadata, LinearRepr, buildColumn as rawBuildColumn } from "../../util/mapType";
import { ALL_FW_UPPER } from "../../util/searchType";

type COL_TYP = "46" | "48" | "12" | "24"

const COL_TEMPLATE = {
  "46": LinearRepr.fromStr("YB L2 YC"),
  "48": LinearRepr.fromStr("YC L2 YC"),
  "12": LinearRepr.fromStr("L2 Y6"),
  "24": LinearRepr.fromStr("L2 YC"),
}

function buildColumn(ctyp: COL_TYP, x: number, y: number) {
  return rawBuildColumn(COL_TEMPLATE[ctyp], x, y)
}

const metadata: MapMetadata = {
  backgroundUrl: "images/c106_day1_e7.png",
  size: new BlockOffset({ x: 62, y: 68 }),
  event_id: 1,
  location_top: "東",
  location_prefix: ALL_FW_UPPER,
  blockDict: {
    "Ａ": {
      blocks: [
        {
          origin: new BlockCoord({ x: 35, y: 61 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y2")
        },{
          origin: new BlockCoord({ x: 36, y: 59 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y2")
        },{
          origin: new BlockCoord({ x: 38, y: 56 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y2")
        },{
          origin: new BlockCoord({ x: 39, y: 54 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y2")
        },{
          origin: new BlockCoord({ x: 42, y: 47 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y1")
        },{
          origin: new BlockCoord({ x: 43, y: 46 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y2")
        },{
          origin: new BlockCoord({ x: 45, y: 43 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y2")
        },{
          origin: new BlockCoord({ x: 46, y: 41 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y2")
        },{
          origin: new BlockCoord({ x: 48, y: 37 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y1")
        },{
          origin: new BlockCoord({ x: 49, y: 36 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y2")
        },{
          origin: new BlockCoord({ x: 33, y: 1 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y4")
        },{
          origin: new BlockCoord({ x: 15, y: 1 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y4 N1 Y4 N1 Y4")
        },{
          origin: new BlockCoord({ x: 2, y: 40 }),
          axis: "y",
          dir: "+",
          repr: LinearRepr.fromStr("Y4 N1 Y4 N1 Y2 N4 Y4")
        },
      ],
      maxNum: 48,
      labelCoords: []
    },
    "Ｂ": buildColumn("48", 45, 31),
    "Ｃ": buildColumn("48", 42, 31),
    "Ｄ": buildColumn("48", 39, 31),
    "Ｅ": buildColumn("48", 36, 31),
    "Ｆ": buildColumn("48", 33, 31),

    "Ｇ": buildColumn("48", 27, 31),
    "Ｈ": buildColumn("48", 24, 31),
    "Ｉ": buildColumn("48", 21, 31),

    "Ｊ": buildColumn("48", 16, 31),
    "Ｋ": buildColumn("48", 13, 31),
    "Ｌ": buildColumn("48", 10, 31),
    "Ｍ": buildColumn("48", 7, 31),

    "Ｎ": buildColumn("12", 39, 42),
    "Ｏ": buildColumn("24", 36, 48),
    "Ｐ": buildColumn("24", 33, 48),

    "Ｑ": buildColumn("46", 27, 59),
    "Ｒ": buildColumn("46", 24, 59),
    "Ｓ": buildColumn("46", 21, 59),

    "Ｔ": buildColumn("48", 16, 60),
    "Ｕ": buildColumn("48", 13, 60),
    "Ｖ": buildColumn("48", 10, 60),
    "Ｗ": buildColumn("48", 7, 60),
  }
};


export default metadata;