import { BlockCoord, BlockOffset } from "../../util/canvasUtil";
import { type MapMetadata, LinearRepr, buildColumn as rawBuildColumn } from "../../util/mapType";
import { ALL_KATAKANA } from "../../util/searchType";

type COL_TYP = "54" | "66" | "62" | "48"

const COL_TEMPLATE = {
  "54": LinearRepr.fromStr("Y8 N1 Y6 N2 L2 N2 Y6 N1 Y7"),
  "66": LinearRepr.fromStr("Y9 N1 Y8 L2 Y8 N1 Y8"),
  "62": LinearRepr.fromStr("Y8 N1 Y8 L2 Y8 N1 Y7"),
  "48": LinearRepr.fromStr("Y5 N1 Y7 N1 L2 N1 Y7 N1 Y5"),
}

function buildColumn(ctyp: COL_TYP, x: number, y: number) {
  return rawBuildColumn(COL_TEMPLATE[ctyp], x, y)
}

const metadata: MapMetadata = {
  backgroundUrl: "images/c106_day1_e456.png",
  size: new BlockOffset({ x: 117, y: 44 }),
  event_id: 1,
  location_top: "東",
  location_prefix: ALL_KATAKANA,
  blockDict: {
    "ア": {
      blocks: [
        {
          origin: new BlockCoord({ x: 116, y: 39 }),
          axis: "y",
          dir: "-",
          repr: LinearRepr.fromStr("Y3 F3 N5 Y4 N6 Y4 N2 Y1 N1 Y1 N1 Y1 N2 Y3")
        },
        {
          origin: new BlockCoord({ x: 114, y: 1 }),
          axis: "x",
          dir: "-",
          repr: LinearRepr.fromStr("Y2 N1 Y1 N1 Y2 N1 Y2 NB Y3 N1 Y2 N1 Y3 N1 Y2 N7 Y2 N1 Y3 N1 Y2 N2 Y3 N9 Y2 N1 Y3 N1 Y2 N6 Y2 N1 Y3 N1 Y2 N3 Y3 NA Y2 N1 Y3 N2 Y2")
        },
        {
          origin: new BlockCoord({ x: 0, y: 3 }),
          axis: "y",
          dir: "+",
          repr: LinearRepr.fromStr("Y3 N2 Y1 N1 Y1 N1 Y1 N2 Y4 N6 Y4 N1 Y1 N1 Y1 N1 Y1 N2 Y3")
        }
      ],
      maxNum: 91,
      labelCoords: []
    },
    "イ": buildColumn("54", 112, 39),
    "ウ": buildColumn("66", 109, 40),
    "エ": buildColumn("66", 106, 40),
    "オ": buildColumn("62", 103, 39),
    "カ": buildColumn("62", 100, 39),
    "キ": buildColumn("66", 97, 40),
    "ク": buildColumn("66", 94, 40),
    "ケ": buildColumn("66", 91, 40),
    "コ": buildColumn("66", 88, 40),
    "サ": buildColumn("66", 85, 40),
    "シ": buildColumn("62", 82, 39),
    "ス": buildColumn("48", 79, 36),
    "セ": buildColumn("48", 76, 36),
    "ソ": buildColumn("62", 73, 39),
    "タ": buildColumn("66", 70, 40),
    "チ": buildColumn("66", 67, 40),
    "ツ": buildColumn("66", 64, 40),
    "テ": buildColumn("66", 61, 40),
    "ト": buildColumn("66", 58, 40),
    "ナ": buildColumn("62", 55, 39),
    "ニ": buildColumn("62", 52, 39),
    "ヌ": buildColumn("66", 49, 40),
    "ネ": buildColumn("66", 46, 40),
    "ノ": buildColumn("62", 43, 39),
    "ハ": buildColumn("48", 40, 36),
    "ヒ": buildColumn("48", 37, 36),
    "フ": buildColumn("62", 34, 39),
    "ヘ": buildColumn("66", 31, 40),
    "ホ": buildColumn("66", 28, 40),
    "マ": buildColumn("66", 25, 40),
    "ミ": buildColumn("66", 22, 40),
    "ム": buildColumn("66", 19, 40),
    "メ": buildColumn("62", 16, 39),
    "モ": buildColumn("62", 13, 39),
    "ヤ": buildColumn("66", 10, 40),
    "ユ": buildColumn("66", 7, 40),
    "ヨ": buildColumn("54", 4, 39),
  }


}

export default metadata;