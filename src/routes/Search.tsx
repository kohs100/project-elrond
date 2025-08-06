import { useState } from "react";
import { BoothTable } from "../components/BoothList";
import { KR2JP } from "../components/SearchMapping";
import { supabase } from "../supabaseClient";

import "./Search.css";

const VALID_QUERY =
  /[eE동東wW서西sS남南]?[가-힣ぁ-んァ-ンーa-zA-Z][0-9]{2}[Aa]*[Bb]*/;

const ALPHA_LOWER = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
const ALPHA_UPPER = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const ALL_ALPHABETS = ALPHA_LOWER.concat(ALPHA_UPPER);
const ALL_LOCBLKS = Object.values(KR2JP).flat().concat(ALL_ALPHABETS);

type SearchBarProp = {
  boothIds: number[];
  setBoothIds: React.Dispatch<React.SetStateAction<number[]>>;
};

class QueryBuilder {
  hall: Set<string>;
  locblk: Set<string>;
  locnum: string;
  locsubsec: Set<string>;

  constructor() {
    this.hall = new Set(["東", "南", "西"]);
    this.locblk = new Set(ALL_LOCBLKS);
    this.locnum = "00";
    this.locsubsec = new Set(["a", "b", "ab"]);
  }

  intersectHall(halls: string[]) {
    this.hall = new Set(halls.filter((i) => this.hall.has(i)));
  }

  intersectBlk(blks: string[]) {
    this.locblk = new Set(blks.filter((i) => this.locblk.has(i)));
  }

  intersectSubsec(subsecs: string[]) {
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

  setBlk(locblk: string) {
    if (/[あーん]/.test(locblk)) {
      this.intersectHall(["西"]);
      this.intersectBlk([locblk]);
    } else if (/[アーンA-Z]/.test(locblk)) {
      this.intersectHall(["東"]);
      this.intersectBlk([locblk]);
    } else if (/[a-z]/.test(locblk)) {
      this.intersectHall(["南"]);
      this.intersectBlk([locblk]);
    } else if (locblk in KR2JP) {
      console.log(`locblk in KR2JP: ${locblk} -> ${KR2JP[locblk]}`);
      this.intersectHall(["東", "西"]);
      this.intersectBlk(KR2JP[locblk]);
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
      throw new Error (`Invalid subsec string: ${subsec}`);
    } else if (subsec.length > 0) {
      this.intersectSubsec([subsec]);
    }
  }

  doSearch: (day: number) => Promise<null | number[]> = async (day) => {
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
      .eq("event_id", day)
      .in("location_top", Array.from(this.hall))
      .in("location", location_lst);
    if (error) {
      throw error;
    }
    console.log(`found: ${data}`);
    return data.map((obj) => obj.id);
  };
}

const SearchBar: React.FC<SearchBarProp> = (props) => {
  const { setBoothIds } = props;
  const [day, setDay] = useState(1);
  const [query, setQuery] = useState("");
  const [valid, setValid] = useState(true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newQuery = query.normalize("NFKC").replace(/\s/g, "");
    setQuery(newQuery);

    if (!VALID_QUERY.test(newQuery)) {
      setValid(false);
      return;
    } else {
      setValid(true);
    }

    const firstNumIdx = newQuery.search(/[0-9]+/);
    const prefix = newQuery.slice(0, firstNumIdx); // 동히 or 히
    const suffix = newQuery.slice(firstNumIdx); // 09ab or 9a
    console.log(`prefix: ${prefix}, suffix: ${suffix}`);

    const qbuilder = new QueryBuilder();

    if (prefix.length === 1) {
      // 히ひヒ
      console.log(`no hall specifier`);
      qbuilder.setBlk(prefix);
    } else if (prefix.length === 2) {
      // 동히
      console.log(`hall specifier: ${prefix[0]}`);
      qbuilder.setHall(prefix[0]);
      qbuilder.setBlk(prefix[1]);
    }

    const abIdx = suffix.search(/[ab]/);
    if (abIdx < 0) {
      const suffixNum = abIdx < 0 ? suffix : suffix.slice(0, abIdx);
      qbuilder.setNum(suffixNum);
    } else {
      const suffixNum = suffix.slice(0, abIdx);
      qbuilder.setNum(suffixNum);
      const suffixSubsec = suffix.slice(abIdx);
      qbuilder.setSubsec(suffixSubsec);
    }

    console.log(qbuilder);

    qbuilder.doSearch(day).then((bids) => {
      if (bids === null) {
        setValid(false);
      } else {
        setBoothIds(bids);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="searchbar-box"
        style={{ marginTop: "10px", marginBottom: "10px" }}
      >
        <input
          className="searchbar-inp"
          type="text"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        <select
          className="searchbar-drop"
          onChange={(e) => setDay(Number(e.target.value))}
          value={day}
        >
          <option value={1}>1일차</option>
          <option value={2}>2일차</option>
        </select>
        <button
          className="searchbar-submit"
          type="submit"
          style={{ color: valid ? "black" : "red" }}
        >
          OK
        </button>
      </div>
    </form>
  );
};

const Search = () => {
  const [boothIds, setBoothIds] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);

  return (
    <div style={{ width: "100vw", height: "100dvh", overflow: "hidden" }}>
      <div>
        <SearchBar boothIds={boothIds} setBoothIds={setBoothIds} />
      </div>
      <div style={{ width: "100vw", height: "80dvh", overflow: "hidden" }}>
        <BoothTable booth_ids={boothIds} />
      </div>
    </div>
  );
};

export default Search;
