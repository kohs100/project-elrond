import { supabase } from "../supabaseClient";


export const ALL_FW_UPPER = [
  "Ａ", "Ｂ", "Ｃ", "Ｄ", "Ｅ", "Ｆ", "Ｇ", "Ｈ", "Ｉ", "Ｊ", "Ｋ", "Ｌ", "Ｍ",
  "Ｎ", "Ｏ", "Ｐ", "Ｑ", "Ｒ", "Ｓ", "Ｔ", "Ｕ", "Ｖ", "Ｗ", "Ｘ", "Ｙ", "Ｚ",
] as const;
export const ALL_FW_LOWER = [
  "ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ", "ｋ", "ｌ", "ｍ",
  "ｎ", "ｏ", "ｐ", "ｑ", "ｒ", "ｓ", "ｔ", "ｕ", "ｖ", "ｗ", "ｘ", "ｙ", "ｚ",
] as const;
export const ALL_FW_ALPHABETS = [...ALL_FW_UPPER, ...ALL_FW_LOWER] as const;
export const ALL_HIRAGANA = [
  "ぁ", "あ", "ぃ", "い", "ぅ", "う", "ぇ", "え", "ぉ", "お",
  "か", "が", "き", "ぎ", "く", "ぐ", "け", "げ", "こ", "ご",
  "さ", "ざ", "し", "じ", "す", "ず", "せ", "ぜ", "そ", "ぞ",
  "た", "だ", "ち", "ぢ", "っ", "つ", "づ", "て", "で", "と", "ど",
  "な", "に", "ぬ", "ね", "の",
  "は", "ば", "ぱ", "ひ", "び", "ぴ", "ふ", "ぶ", "ぷ", "へ", "べ", "ぺ", "ほ", "ぼ", "ぽ",
  "ま", "み", "む", "め", "も",
  "ゃ", "や", "ゅ", "ゆ", "ょ", "よ",
  "ら", "り", "る", "れ", "ろ",
  "ゎ", "わ", "ゐ", "ゑ", "を", "ん"
] as const;
export const ALL_KATAKANA = [
  "ァ", "ア", "ィ", "イ", "ゥ", "ウ", "ェ", "エ", "ォ", "オ",
  "カ", "ガ", "キ", "ギ", "ク", "グ", "ケ", "ゲ", "コ", "ゴ",
  "サ", "ザ", "シ", "ジ", "ス", "ズ", "セ", "ゼ", "ソ", "ゾ",
  "タ", "ダ", "チ", "ヂ", "ッ", "ツ", "ヅ", "テ", "デ", "ト", "ド",
  "ナ", "ニ", "ヌ", "ネ", "ノ",
  "ハ", "バ", "パ", "ヒ", "ビ", "ピ", "フ", "ブ", "プ", "ヘ", "ベ", "ペ", "ホ", "ボ", "ポ",
  "マ", "ミ", "ム", "メ", "モ",
  "ャ", "ヤ", "ュ", "ユ", "ョ", "ヨ",
  "ラ", "リ", "ル", "レ", "ロ",
  "ヮ", "ワ", "ヰ", "ヱ", "ヲ", "ン",
  "ヴ", "ヵ", "ヶ"
] as const;
export const ALL_HATUON = [
  "아", "이", "우", "에", "오",
  "카", "키", "쿠", "케", "코",
  "사", "시", "스", "세", "소",
  "타", "치", "츠", "테", "토",
  "나", "니", "누", "네", "노",
  "하", "히", "후", "헤", "호",
  "마", "미", "무", "메", "모",
  "야", "유", "요",
  "라", "리", "루", "레", "로",
  "와", "응",
] as const;
export const ALL_BLOCKIDS = [
  ...ALL_FW_ALPHABETS,
  ...ALL_HIRAGANA,
  ...ALL_KATAKANA,
  ...ALL_HATUON
] as const;

export type FullwidthLower = typeof ALL_FW_LOWER[number];
export type FullwidthUpper = typeof ALL_FW_UPPER[number];
export type Fullwidth = typeof ALL_FW_ALPHABETS[number];

export type Hiragana = typeof ALL_HIRAGANA[number];
export type Katakana = typeof ALL_KATAKANA[number];

export type Hatuon = typeof ALL_HATUON[number];

export type BlockID = Hiragana | Katakana | Fullwidth | Hatuon;

export type Subsec = 'a' | 'b' | 'ab';

export function isFullwidthLower(ch: string): ch is FullwidthLower {
  if (ch.length !== 1) throw new Error(`${ch} is not a character`)
  return ALL_FW_LOWER.includes(ch as FullwidthLower);
}
export function isFullwidthUpper(ch: string): ch is FullwidthUpper {
  if (ch.length !== 1) throw new Error(`${ch} is not a character`)
  return ALL_FW_UPPER.includes(ch as FullwidthUpper);
}
export function isFullwidthAlpha(ch: string): ch is Fullwidth {
  if (ch.length !== 1) throw new Error(`${ch} is not a character`)
  return ALL_FW_ALPHABETS.includes(ch as Fullwidth);
}

export function isHiragana(ch: string): ch is Hiragana {
  if (ch.length !== 1) throw new Error(`${ch} is not a character`)
  return ALL_HIRAGANA.includes(ch as Hiragana);
}
export function isKatakana(ch: string): ch is Katakana {
  if (ch.length !== 1) throw new Error(`${ch} is not a character`)
  return ALL_KATAKANA.includes(ch as Katakana);
}
export function isHatuon(ch: string): ch is Hatuon {
  if (ch.length !== 1) throw new Error(`${ch} is not a character`)
  return ALL_HATUON.includes(ch as Hatuon);
}

export function isBlockID(ch: string): ch is BlockID {
  if (ch.length !== 1) throw new Error(`${ch} is not a character`)
  return ALL_BLOCKIDS.includes(ch as BlockID);
}

export function toBlockID(ch: string): BlockID {
  if (ch.length !== 1) throw new Error(`${ch} is not a character`)
  ch.replace(/[A-Za-z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
  if (isBlockID(ch)) return ch;
  else throw new Error(`${ch} is not a valid blockid`)
}

export const HatuonToKana: Map<Hatuon, (Hiragana|Katakana)[]> = new Map([
  ["아", ["あ", "ア"]],
  ["이", ["い", "イ"]],
  ["우", ["う", "ウ"]],
  ["에", ["え", "エ"]],
  ["오", ["お", "を", "オ", "ヲ"]],

  ["카", ["か", "カ"]],
  ["키", ["き", "キ"]],
  ["쿠", ["く", "ク"]],
  ["케", ["け", "ケ"]],
  ["코", ["こ", "コ"]],

  ["사", ["さ", "サ"]],
  ["시", ["し", "シ"]],
  ["스", ["す", "ス"]],
  ["세", ["せ", "セ"]],
  ["소", ["そ", "ソ"]],

  ["타", ["た", "タ"]],
  ["치", ["ち", "チ"]],
  ["츠", ["つ", "ツ"]],
  ["테", ["て", "テ"]],
  ["토", ["と", "ト"]],

  ["나", ["な", "ナ"]],
  ["니", ["に", "ニ"]],
  ["누", ["ぬ", "ヌ"]],
  ["네", ["ね", "ネ"]],
  ["노", ["の", "ノ"]],

  ["하", ["は", "ハ"]],
  ["히", ["ひ", "ヒ"]],
  ["후", ["ふ", "フ"]],
  ["헤", ["へ", "ヘ"]],
  ["호", ["ほ", "ホ"]],

  ["마", ["ま", "マ"]],
  ["미", ["み", "ミ"]],
  ["무", ["む", "ム"]],
  ["메", ["め", "メ"]],
  ["모", ["も", "モ"]],

  ["야", ["や", "ヤ"]],
  ["유", ["ゆ", "ユ"]],
  ["요", ["よ", "ヨ"]],

  ["라", ["ら", "ラ"]],
  ["리", ["り", "リ"]],
  ["루", ["る", "ル"]],
  ["레", ["れ", "レ"]],
  ["로", ["ろ", "ロ"]],

  ["와", ["わ", "ワ"]],
  ["응", ["ん", "ン"]]
])


export class QueryBuilder {
  hall: Set<string>;
  locblk: Set<BlockID>;
  locnum: string;
  locsubsec: Set<Subsec>;

  constructor() {
    this.hall = new Set(["東", "南", "西"]);
    this.locblk = new Set(ALL_BLOCKIDS);
    this.locnum = "00";
    this.locsubsec = new Set(["a", "b", "ab"]);
  }

  intersectHall(halls: string[]) {
    this.hall = new Set(halls.filter((i) => this.hall.has(i)));
  }

  intersectBlk(blks: BlockID[]) {
    this.locblk = new Set(blks.filter((i) => this.locblk.has(i)));
  }

  intersectSubsec(subsecs: Subsec[]) {
    this.locsubsec = new Set(subsecs.filter((i) => this.locsubsec.has(i)));
  }

  setHall(hall: string) {
    if (/[eE동東]/.test(hall)) {
      this.intersectHall(["東"]);
    } else if (/[wW서西]/.test(hall)) {
      this.intersectHall(["西"]);
    } else if (/[sS남南]/.test(hall)) {
      this.intersectHall(["南"]);
    } else {
      throw new Error(`Invalid hall string: ${hall}`);
    }
  }

  setBlk(qlocblk: string) {
    const locblk = toBlockID(qlocblk);

    if (isHiragana(locblk)) {
      this.intersectHall(["西"]);
      this.intersectBlk([locblk]);
    } else if (isKatakana(locblk) || isFullwidthUpper(locblk)) {
      this.intersectHall(["東"]);
      this.intersectBlk([locblk]);
    } else if (isFullwidthLower(locblk)) {
      this.intersectHall(["南"]);
      this.intersectBlk([locblk]);
    } else if (isHatuon(locblk)) {
      this.intersectHall(["東", "西"]);
      this.intersectBlk(HatuonToKana.get(locblk)!);
    } else {
      throw new Error(`Invalid locblk string: ${locblk}`);
    }
  }

  setNum(numstr: string) {
    const num = Number(numstr);
    if (isNaN(num)) {
      throw new Error(`Invalid locnum: ${num}`);
    } else if (num < 0 || 99 < num) {
      throw new Error(`Invalid locnum: ${num}`);
    }
    this.locnum = String(num).padStart(2, "0");
  }

  setSubsec(subsec: string) {
    if (subsec.length >= 2) {
      throw new Error(`Invalid subsec string: ${subsec}`);
    } else if (subsec.length > 0) {
      if (/[aA]/.test(subsec)) this.intersectSubsec(["a", "ab"]);
      else if (/[bB]/.test(subsec)) this.intersectSubsec(["b"]);
      else if (/[aA][bB]/.test(subsec)) this.intersectSubsec(["ab"]);
      else throw new Error(`Invalid subsec string: ${subsec}`);
    }
  }

  doSearch: (event_id: number) => Promise<null | number[]> = async (event_id) => {
    const location_lst: string[] = [];
    if (
      this.hall.size === 0 ||
      this.locblk.size === 0 ||
      this.locnum === "00" ||
      this.locsubsec.size === 0
    ) {
      return null;
    } else {
      this.locblk.forEach((blk) => {
        this.locsubsec.forEach((subsec) => {
          location_lst.push(`${blk}${this.locnum}${subsec}`);
        });
      });
    }
    console.log(`search loclist: ${location_lst}`);
    const { data, error } = await supabase
      .from("booth")
      .select("id")
      .eq("event_id", event_id)
      .in("location_top", Array.from(this.hall))
      .in("location", location_lst);
    if (error) {
      throw error;
    }
    return data.map((obj) => obj.id);
  };
}
