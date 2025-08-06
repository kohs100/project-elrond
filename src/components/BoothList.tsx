import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "tabulator-tables/dist/css/tabulator.min.css";
import type { Database } from "../database.types";

import "./BoothList.css";

type BoothRow = Database["public"]["Tables"]["booth"]["Row"];
type BoothEntryProp = { booth_id: number; markcolor?: string };
type BoothListProp = { booth_ids: number[] };

const URL_CF_R2 = "https://elrond.ster.email";

export function BoothEntry({ booth_id, markcolor = "red" }: BoothEntryProp) {
  const [data, setData] = useState<BoothRow | null>(null);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("booth")
      .select("*")
      .eq("id", booth_id);
    if (error) {
      throw error;
    }
    if (data) {
      if (data.length > 1) {
        throw new Error(`Assertion failed: Too many data in booth_id: ${booth_id}`);
      } else if (data.length === 0) {
        throw new Error(`Assertion failed: No data in booth_id: ${booth_id}`);
      }
      setData(data[0]);
    } else {
      throw new Error(`Failed to query booth_id: ${booth_id}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateURLs = (data: BoothRow) => {
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
        <a key="url-circle" href={`https://portal.circle.ms/Circle/Index/${data.circle_id}`}>
          CMS
        </a>
      );
    }

    const result: React.JSX.Element[] = [];
    urls.forEach((url, i) => {
      result.push(url);
      if (i < urls.length - 1) {
        result.push(<span>{" / "}</span>);
      }
    });

    return result;
  };

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
              :
            "/images/circle_placeholder.jpg"
          }
        />
        <div
          className="booth-img-after"
          style={{
            backgroundColor: markcolor,
          }}
        />
      </div>

      <div
        className="booth-txt"
        style={{
          verticalAlign: "top",
          display: "inline-block",
        }}
      >
        <p>{data.jname}</p>
        <p>{data.location_top + data.location}</p>
        <p>{generateURLs(data)}</p>
      </div>
    </div>
  ) : (
    <></>
  );
}

export const BoothTable: React.FC<BoothListProp> = (props) => {
  const { booth_ids } = props;

  return (
    <div className="booth-table">
      {booth_ids.map((booth_id) => (
        <div
          key={booth_id}
          className="booth-table-entry"
        >
          <BoothEntry booth_id={booth_id} />
        </div>
      ))}
    </div>
  );
};
