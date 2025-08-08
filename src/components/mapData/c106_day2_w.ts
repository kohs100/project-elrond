import { BlockCoord, BlockOffset } from "../../util/canvasUtil";
import { type MapMetadata, LinearRepr, buildColumn as rawBuildColumn } from "../../util/mapType";
import { ALL_HIRAGANA } from "../../util/searchType";

type COL_TYP = "52TOP" | "52BOT" | "26" | "28"

const COL_TEMPLATE = {
  "52TOP": LinearRepr.fromStr("YB N1 Y7 L2 Y8"),
  "52BOT": LinearRepr.fromStr("Y6 L2 Y7 N1 Y6 N1 Y7"),
  "26": LinearRepr.fromStr("Y5 L2 Y8"),
  "28": LinearRepr.fromStr("Y6 L2 Y8"),
}

function buildColumn(ctyp: COL_TYP, x: number, y: number) {
  return rawBuildColumn(COL_TEMPLATE[ctyp], x, y)
}

const metadata: MapMetadata = {
  backgroundUrl: "images/c106_day2_w.png",
  size: new BlockOffset({ x: 90, y: 67 }),
  event_id: 2,
  location_top: "西",
  location_prefix: ALL_HIRAGANA,
  blockDict: {
    "あ": {
      blocks: [
        {
          origin: new BlockCoord({ x: 71, y: 65 }),
          axis: "x",
          dir: "+",
          repr: LinearRepr.fromStr("YF")
        },
        {
          origin: new BlockCoord({ x: 89, y: 61 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("F3 N3 F3 N4 Y3 N8 Y3 N7 Y3 N7 Y3 N3 Y3 N3 Y3")
        },
        {
          origin: new BlockCoord({ x: 84, y: 0 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y3 N2 Y3 N2 Y3 N8 Y3 N3 Y3 N2 Y3")
        },
        {
          origin: new BlockCoord({ x: 59, y: 22 }),
          axis: "x",
          dir: "+",
          repr: LinearRepr.fromStr("Y4 F4")
        },
        {
          origin: new BlockCoord({ x: 67, y: 46 }),
          axis: "y",
          dir: "+",
          repr: LinearRepr.fromStr("Y4 N8 Y4")
        }
      ],
      maxNum: 73,
      labelCoords: []
    },
    "め": {
      blocks: [
        {
          origin: new BlockCoord({ x: 18, y: 65 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("YF")
        },
        {
          origin: new BlockCoord({ x: 0, y: 61 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y3 N3 Y3 N4 Y3 N8 Y3 N7 Y3 N7 Y3 N3 Y3 N3 Y3")
        },
        {
          origin: new BlockCoord({ x: 3, y: 0 }),
          axis: "x",
          dir: "+",
          repr: LinearRepr.fromStr("Y3 N4 Y3 N2 Y3 N8 Y3 N3 Y3 N1 Y3")
        },
        {
          origin: new BlockCoord({ x: 30, y: 22 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y4 F4")
        },
        {
          origin: new BlockCoord({ x: 22, y: 47 }),
          axis: "y",
          dir: "+",
          repr: LinearRepr.fromStr("Y4 N7 Y4")
        }
      ],
      maxNum: 73,
      labelCoords: []
    },
    "い": buildColumn("52BOT", 85, 62),
    "う": buildColumn("52BOT", 82, 62),
    "え": buildColumn("52BOT", 79, 62),
    "お": buildColumn("52BOT", 75, 62),
    "か": buildColumn("52BOT", 72, 62),

    "き": buildColumn("52TOP", 85, 30),
    "く": buildColumn("52TOP", 82, 30),
    "け": buildColumn("52TOP", 79, 30),
    "こ": buildColumn("52TOP", 75, 30),
    "さ": buildColumn("52TOP", 72, 30),

    "し": buildColumn("26", 68, 16),
    "す": buildColumn("26", 65, 16),
    "せ": buildColumn("28", 62, 17),
    "そ": buildColumn("28", 59, 17),
    "た": buildColumn("28", 54, 17),
    "ち": buildColumn("28", 51, 17),

    "つ": buildColumn("28", 39, 17),
    "て": buildColumn("28", 36, 17),
    "と": buildColumn("28", 31, 17),
    "な": buildColumn("28", 28, 17),
    "に": buildColumn("26", 25, 16),
    "ぬ": buildColumn("26", 22, 16),

    "ね": buildColumn("52TOP", 18, 30),
    "の": buildColumn("52TOP", 15, 30),
    "は": buildColumn("52TOP", 11, 30),
    "ひ": buildColumn("52TOP", 8, 30),
    "ふ": buildColumn("52TOP", 5, 30),

    "へ": buildColumn("52BOT", 18, 62),
    "ほ": buildColumn("52BOT", 15, 62),
    "ま": buildColumn("52BOT", 11, 62),
    "み": buildColumn("52BOT", 8, 62),
    "む": buildColumn("52BOT", 5, 62),
  }
};


export default metadata;