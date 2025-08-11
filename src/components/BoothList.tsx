import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "tabulator-tables/dist/css/tabulator.min.css";

import "./BoothList.css";

import type { SingletonContextType } from "../hooks/useSupabaseAuth";
import { useOutletContext } from "react-router-dom";
import type { Circle } from "../circle";

const URL_CF_R2 = "https://elrond.ster.email";
export const FAVORITE_COLORS = [
  "red",
  "blue",
  "orange",
  "purple",
  "yellow",
  "aqua",
  "green",
  null,
] as const;

// type FavBoothRow = MergeDeep<
//   BoothRow,
//   {
//     favorites: {
//       booth_id: number;
//       user_id: string;
//       color: string;
//     }[];
//   }
// >;

export type FavBoothRow = {
  id: number;
  circle_id: number;
  location: string;
  location_top: string | null;
  jname: string;
  favorites: {
    color: string;
  }[];
  data: Circle;
};

type BoothEntryProp = {
  boothId: number;
  isTouch: boolean;
  initData?: FavBoothRow;
  triggerOverlayReload?: () => void;
};
export function BoothEntry({
  boothId,
  isTouch,
  initData,
  triggerOverlayReload,
}: BoothEntryProp) {
  const [data, setData] = useState<FavBoothRow | null>(initData ? initData : null);
  const [color, setColor] = useState<string | null>(null);
  const { singleton } = useOutletContext<SingletonContextType>();

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("booth")
      .select(
        `
        *,
        favorites(
          booth_id,
          user_id,
          color
        )
        `
      )
      .eq("id", boothId)
      .eq("favorites.user_id", singleton.uid);
    if (error) throw error;
    if (data === null) throw new Error("Fetch data failed!!!");

    if (data.length > 1)
      throw new Error(
        `Assertion failed: Too many data in booth_id: ${boothId}`
      );
    else if (data.length === 0)
      throw new Error(`Assertion failed: No data in booth_id: ${boothId}`);

    return data[0];
  };

  const initializeData = async () => {
    const initRow = data ? data : await fetchData();

    if (initRow.favorites.length > 1)
      throw new Error(
        `Assertion failed: Too many favorites of booth_id: ${boothId}`
      );
    else if (initRow.favorites.length == 1) {
      setColor(initRow.favorites[0].color);
    }
    setData(initRow);
  };

  useEffect(() => {
    initializeData();
  }, []);

  const generateURLs = (data: FavBoothRow) => {
    const urls: React.JSX.Element[] = [];

    if (data.data.IsTwitterRegistered) {
      urls.push(
        <a key="url-x" href={data.data.TwitterUrl}>
          Twitter
        </a>
      );
    }
    if (data.data.IsPixivRegistered) {
      urls.push(
        <a key="url-pixiv" href={data.data.PixivUrl}>
          Pixiv
        </a>
      );
    }
    if (data.circle_id !== 0) {
      urls.push(
        <a
          key="url-circle"
          href={`https://portal.circle.ms/Circle/Index/${data.circle_id}`}
        >
          CMS
        </a>
      );
    }

    const result: React.JSX.Element[] = [];
    urls.forEach((url, i) => {
      result.push(url);
      if (i < urls.length - 1) {
        result.push(<span key={i}>{" / "}</span>);
      }
    });

    return result;
  };

  const handleClick = async (_: React.MouseEvent, newcolor: null | string) => {
    console.log(`${color} -> ${newcolor}`);
    if (color != newcolor) {
      if (newcolor === null) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", singleton.uid)
          .eq("booth_id", boothId);
      } else {
        await supabase.from("favorites").upsert({
          user_id: singleton.uid,
          booth_id: boothId,
          color: newcolor,
        });
      }
      setColor(newcolor);
      if (triggerOverlayReload) triggerOverlayReload();
    }
  };

  const generatedColors = FAVORITE_COLORS.map((color, idx) => {
    if (color === null) {
      return (
        <div
          style={{ color: "red" }}
          className="booth-info-colorbar-elem"
          key={`favorite-color-${idx}`}
          onClick={(e) => handleClick(e, color)}
        >
          ❌
        </div>
      );
    } else {
      return (
        <div
          style={{ backgroundColor: color }}
          className="booth-info-colorbar-elem"
          key={`favorite-color-${idx}`}
          onClick={(e) => handleClick(e, color)}
        ></div>
      );
    }
  });

  return data ? (
    <div className="booth-box">
      <div className="booth-img">
        <img
          alt={data.jname}
          crossOrigin={"anonymous"}
          style={{
            width: "100%",
            height: "100%",
            left: 0,
            right: 0,
          }}
          src={
            data.data.CircleCutUrls.length > 0
              ? `${URL_CF_R2}${data.data.CircleCutUrls[0]}`
              : "/images/circle_placeholder.jpg"
          }
        />
        {color ? (
          <div
            className="booth-img-after"
            style={{
              backgroundColor: color,
            }}
          />
        ) : (
          <></>
        )}
      </div>

      <div className="booth-info-container">
        <div className="booth-info-text">
          <p>{data.jname}</p>
          <p>{data.location_top + data.location}</p>
          <p>{generateURLs(data)}</p>
        </div>
        <div className="booth-info-colorbar">{generatedColors}</div>
      </div>
    </div>
  ) : (
    <></>
  );
}

type BoothTableProp = {
  boothIds?: number[];
  initDatas?: FavBoothRow[];
  scrollable: boolean;
  isTouch: boolean;
  triggerOverlayReload?: () => void;
};
export function BoothTable({
  boothIds,
  initDatas,
  scrollable,
  isTouch,
  triggerOverlayReload,
}: BoothTableProp) {
  if (initDatas)
    return (
      <div
        className="booth-table"
        style={{
          overflowY: scrollable ? "scroll" : "hidden",
        }}
      >
        {initDatas.map((initData) => (
          <div key={initData.id} className="booth-table-entry">
            <BoothEntry
              key={`ENTRY-${initData.id}`}
              boothId={initData.id}
              initData={initData}
              isTouch={isTouch}
              triggerOverlayReload={triggerOverlayReload}
            />
          </div>
        ))}
      </div>
    );
  else if (boothIds)
    return (
      <div
        className="booth-table"
        style={{
          overflowY: scrollable ? "scroll" : "hidden",
        }}
      >
        {boothIds.map((boothId) => (
          <div key={boothId} className="booth-table-entry">
            <BoothEntry
              key={`ENTRY-${boothId}`}
              boothId={boothId}
              isTouch={isTouch}
              triggerOverlayReload={triggerOverlayReload}
            />
          </div>
        ))}
      </div>
    );
  else return <>No available data source!!</>;
}
