import React, { useEffect, useState } from "react";
import {
  BoothTable,
  FAVORITE_COLORS,
  type FavBoothRow,
} from "../components/BoothList";

import "./Favorite.css";
import { supabase } from "../supabaseClient";
import { useOutletContext } from "react-router-dom";
import type { SingletonContextType } from "../hooks/useSupabaseAuth";

const PAGESIZE = 12;

type FavoriteSelectProp = {
  page: number;
  setBoothIds: React.Dispatch<React.SetStateAction<FavBoothRow[]>>;
  setMaxPage: React.Dispatch<React.SetStateAction<number>>;
};

type ValueDay = "DAY1" | "DAY2" | "ALL";
type ValueHall = "ALL" | "S" | "W" | "E456" | "E7";

function FavoriteSelect(props: FavoriteSelectProp) {
  const { page, setBoothIds, setMaxPage } = props;

  const [day, setDay] = useState<ValueDay>("ALL");
  const [hall, setHall] = useState<ValueHall>("ALL");
  const [color, setColor] = useState<string>("ALL");

  const { singleton } = useOutletContext<SingletonContextType>();

  const fetchFavorite = async () => {
    const startIdx = (page - 1) * PAGESIZE;
    const endIdx = page * PAGESIZE - 1;

    let query = supabase.from("favorites").select(`
        *,
        booth!inner(
          id,
          circle_id,
          location,
          location_top,
          jname,
          data
    )`, {count: "exact"})
    .eq("user_id", singleton.uid);
    if (color !== "ALL") query = query.eq("color", color);
    if (day !== "ALL") query = query.eq("booth.event_id", day === "DAY1" ? 1 : 2);
    if (hall !== "ALL") {
      const location_dict = {
        S: "南",
        W: "西",
        E456: "東",
        E7: "東",
      };

      query = query.eq("booth.location_top", location_dict[hall]);
    }

    const { error, data, count } = await query
      .order("updated_at", { ascending: false })
      .range(startIdx, endIdx);

    if (error) throw error;
    if (data === null || count === null)
      throw new Error("Favorite lookup failed!!");

    setMaxPage(Math.ceil(count / PAGESIZE));
    setBoothIds(data.map(fobj => {
      return {
        favorites: [{
          color: fobj.color
        }],
        ...fobj.booth
      }
    }));
  };

  useEffect(() => {
    fetchFavorite();
  }, [day, hall, color, page]);

  const generatedColors = FAVORITE_COLORS.map((color, idx) => {
    if (color === null) return;
    return (
      <option key={color} value={color} style={{ backgroundColor: color }}>
        {color}
      </option>
    );
  });

  return (
    <div className="favorite-topbar-select">
      <select
        className="favorite-topbar-select-day favorite-box"
        onChange={(e) => setDay(e.target.value as ValueDay)}
        value={day}
      >
        <option value="ALL">DAY</option>
        <option value="DAY1">1일차</option>
        <option value="DAY2">2일차</option>
      </select>
      <select
        className="favorite-topbar-select-hall favorite-box"
        onChange={(e) => setHall(e.target.value as ValueHall)}
        value={hall}
      >
        <option value="ALL">HALL</option>
        <option value="S">南</option>
        <option value="W">西</option>
        <option value="E456">東456</option>
        <option value="E7">東7</option>
      </select>
      <select
        className="favorite-topbar-select-color favorite-box"
        onChange={(e) => setColor(e.target.value)}
        value={color}
      >
        <option key="ALL" value="ALL">
          COLOR
        </option>
        {generatedColors}
      </select>
    </div>
  );
}

type FavoritePaginationProp = {
  maxPage: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
};

function FavoritePagination({
  maxPage,
  page,
  setPage,
}: FavoritePaginationProp) {
  const handleClick = (dir: "l" | "r") => {
    if (dir === "l" && page > 1) setPage(page - 1);
    if (dir === "r" && page < maxPage) setPage(page + 1);
  };
  return (
    <div className="favorite-topbar-pagination">
      <div className="favorite-box lptr" onClick={() => handleClick("l")}>
        {"<|"}
      </div>
      <div className="ind">{`${page} / ${maxPage}`}</div>
      <div className="favorite-box rptr" onClick={() => handleClick("r")}>
        {"|>"}
      </div>
    </div>
  );
}

function Favorite() {
  const [page, setPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(2);
  const [boothIds, setBoothIds] = useState<FavBoothRow[]>([]);

  return (
    <div className="favorite-page">
      <div className="favorite-topbar">
        <FavoriteSelect
          page={page}
          setMaxPage={setMaxPage}
          setBoothIds={setBoothIds}
        />
        {maxPage !== null && page !== null && maxPage > 1 ? (
          <FavoritePagination maxPage={maxPage} page={page} setPage={setPage} />
        ) : (
          <></>
        )}
      </div>
      <div className="favorite-list">
        <BoothTable initDatas={boothIds} scrollable={true} isTouch={false} />
      </div>
    </div>
  );
}

export default Favorite;
