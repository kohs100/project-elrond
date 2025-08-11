import React, { useState } from "react";
import { BoothTable } from "../components/BoothList";

import { QueryBuilder } from "../util/searchType";
import classNames from "classnames";

import "./Search.css";

const VALID_QUERY =
  /[eE동東wW서西sS남南]?[가-힣ぁ-んァ-ンーa-zA-Zａ-ｚＡ-Ｚ][0-9]{2}[Aa]*[Bb]*/;

type SearchBarProp = {
  boothIds: number[];
  setBoothIds: React.Dispatch<React.SetStateAction<number[]>>;
};

const SearchBar: React.FC<SearchBarProp> = (props) => {
  const { setBoothIds } = props;
  const [day, setDay] = useState(1);
  const [query, setQuery] = useState("");
  const [valid, setValid] = useState(false);

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    const newQuery = query.normalize("NFKC").replace(/\s/g, "");
    setQuery(newQuery);
    if (!VALID_QUERY.test(query)) {
      setValid(false);
      return;
    } else {
      setValid(true);
    }
  };

  const commonClassNames = `
  border
  text-sm
  rounded-lg
  block
  w-full
  p-2.5
  `;

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="searchbar-box"
        style={{ marginTop: "10px", marginBottom: "10px" }}
      >
        <input
          className={classNames("searchbar-inp", commonClassNames, {
            "bg-green-50 border-green-300 text-green-900": valid,
            "bg-red-50 border-red-300 text-red-900": !valid,
          })}
          type="text"
          onChange={handleChange}
          value={query}
        />
        <select
          className={classNames(
            `
          searchbar-drop
          bg-gray-50
          border-gray-300
          text-gray-900
          focus:ring-blue-500
          focus:border-blue-500`,
            commonClassNames
          )}
          onChange={(e) => setDay(Number(e.target.value))}
          value={day}
        >
          <option value={1}>1일차</option>
          <option value={2}>2일차</option>
        </select>
        <button
          className={classNames(
            `
            searchbar-submit
          bg-gray-50
          border-gray-300
          text-gray-900
          focus:ring-blue-500
          focus:border-blue-500`,
            commonClassNames
          )}
          type="submit"
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
    <div className="search-page">
      <div className="search-topbar">
        <SearchBar boothIds={boothIds} setBoothIds={setBoothIds} />
      </div>
      <div className="search-list">
        <BoothTable boothIds={boothIds} scrollable={true} isTouch={false}/>
      </div>
    </div>
  );
};

export default Search;
