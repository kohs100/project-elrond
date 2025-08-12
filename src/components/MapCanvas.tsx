import React, { useEffect, useState, useRef } from "react";

import {
  BlockCoord,
  ViewCoord,
  ViewOffset,
  type ClientXY,
  CoordMap,
  getMidpoint,
  getTouchDistance,
  limitOffset,
  BLOCKSIZE,
  AbsCoord,
  AbsOffset,
} from "../util/canvasUtil";

import { type MapMetadata } from "../util/mapType";

import d1_e456 from "./mapData/c106_day1_e456";
import d1_w from "./mapData/c106_day1_w";
import d1_s from "./mapData/c106_day1_s";
import d1_e7 from "./mapData/c106_day1_e7";

import d2_e456 from "./mapData/c106_day2_e456";
import d2_w from "./mapData/c106_day2_w";
import d2_s from "./mapData/c106_day2_s";
import d2_e7 from "./mapData/c106_day2_e7";

import { supabase } from "../supabaseClient";

import type { Singleton, SingletonContextType } from "../hooks/useSupabaseAuth";
import { useOutletContext } from "react-router-dom";
import { QueryBuilder } from "../util/searchType";
import { BoothTable } from "./BoothList";

import "./MapCanvas.css";

const mapNameDict: Dictionary<MapMetadata> = {
  d1_e456,
  d1_e7,
  d1_w,
  d1_s,
  d2_e456,
  d2_e7,
  d2_w,
  d2_s,
};

interface Dictionary<T> {
  [Key: string]: T;
}

type MapBlock = {
  coord: BlockCoord;
  inside: string;
};
type MapLabel = {
  coord: BlockCoord;
  blkid: string;
};
type Overlay = {
  coord: BlockCoord;
  locstring: string;
  locsubsec: "a" | "b" | "ab";
  color: string;
};

type MapCanvasProp = {
  mapName: string;
  debugRenderImage?: boolean;
  debugFillAll?: boolean;
};

async function fetchOverlay(
  coordDict: CoordMap,
  mapmeta: MapMetadata,
  singleton: Singleton
): Promise<Overlay[] | null> {
  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
        user_id,
        booth!inner(
          id,
          location_top,
          location,
          jname,
          event_id
        ),
        color`
    )
    .eq("user_id", singleton.uid)
    .eq("booth.location_top", mapmeta.location_top)
    .eq("booth.event_id", mapmeta.event_id)
    .order("booth(location)", { ascending: true });

  if (error) throw error;
  if (data === null) throw new Error("Overlay lookup failed!!");

  const overlays: Overlay[] = [];
  data.forEach(({ booth, color }) => {
    if (booth === null) return;
    const { location } = booth;
    const locstring = location.slice(0, 3);
    const locsubsec = location.slice(3);
    if (locsubsec !== "a" && locsubsec !== "b" && locsubsec !== "ab")
      throw new Error(`Found invalid locsubsec: ${location}`);
    const coord = coordDict.getCoord(locstring)!;

    overlays.push({ coord, locsubsec, color, locstring });
  });
  return overlays;
}

const BATCH_SIZE=500;
async function fillAll(
  coordDict: CoordMap,
  mapmeta: MapMetadata
): Promise<Overlay[] | null> {
  if (coordDict === null || mapmeta === null) return null;

  let allbooth: { id: number, location :string }[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("booth")
      .select(`id, location`)
      .eq("location_top", mapmeta.location_top)
      .eq("event_id", mapmeta.event_id)
      .order("id")
      .range(offset, offset + BATCH_SIZE - 1);
    if (error) throw error;
    if (data === null) throw new Error("Booth lookup failed!!");
    allbooth = allbooth.concat(data);
    if (data.length < BATCH_SIZE) {
      break;
    } else {
      offset += BATCH_SIZE;
    }
  }
  console.log(`Fetched all booth: # ${allbooth.length}`)

  const overlays: Overlay[] = [];
  allbooth.forEach(({ location }) => {
    const locblk = location[0];
    const locstring = location.slice(0, 3);
    const locsubsec = location.slice(3);
    if (!mapmeta.location_prefix.includes(locblk)) {
      // console.log(`${locblk} is not valid prefix`)
      return;
    }
    if (locsubsec !== "a" && locsubsec !== "b" && locsubsec !== "ab")
      throw new Error(`Found invalid locsubsec: ${location}`);
    const coord = coordDict.getCoord(locstring);
    if (coord === undefined)
      throw new Error(`location not found!!: ${location}`);

    overlays.push({
      coord,
      locsubsec,
      color: "rgba(0, 255, 0, 0.5)",
      locstring,
    });
  });
  console.log(`Generated full overlay: # ${allbooth.length}`)
  return overlays;
}

function MapCanvas({
  mapName,
  debugRenderImage = false,
  debugFillAll = false,
}: MapCanvasProp) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [coordDict, setCoordDict] = useState<CoordMap | null>(null);
  const [mapblocks, setMapblocks] = useState<MapBlock[] | null>(null);
  const [maplabels, setMaplabels] = useState<MapLabel[] | null>(null);
  const [overlays, setOverlays] = useState<Overlay[] | null>(null);
  const [mapmeta, setMapmeta] = useState<MapMetadata | null>(null);

  const [boothIds, setBoothIds] = useState<number[]>([]);
  const [wasTouch, setWasTouch] = useState(false);

  const { singleton } = useOutletContext<SingletonContextType>();

  useEffect(() => {
    setupMapmetadata();
  }, []);

  useEffect(() => {
    triggerOverlayReload();
  }, [coordDict, mapmeta]);

  const triggerOverlayReload = () => {
    if (coordDict && mapmeta)
      if (debugFillAll)
        fillAll(coordDict, mapmeta).then((ovls) => setOverlays(ovls));
      else
        fetchOverlay(coordDict, mapmeta, singleton).then((ovls) =>
          setOverlays(ovls)
        );
  };

  const setupMapmetadata = () => {
    const mapmeta = mapNameDict[mapName];
    const mapblocks: MapBlock[] = [];
    const maplabels: MapLabel[] = [];
    const newCoordDict: CoordMap = new CoordMap();

    const { blockDict, backgroundUrl } = mapmeta;

    if (debugRenderImage && backgroundUrl) {
      const img = new Image();
      img.src = backgroundUrl;
      img.onload = () => setImage(img);
    }

    Object.entries(blockDict).forEach(([blkid, blkmeta]) => {
      const { blocks, maxNum, labelCoords } = blkmeta;
      labelCoords.forEach((lcoord) => {
        maplabels.push({
          coord: new BlockCoord(lcoord),
          blkid,
        });
      });

      let blknum = 1;
      blocks.forEach((linmeta) => {
        const { origin, axis, dir, repr } = linmeta;
        const ptr: BlockCoord = new BlockCoord(origin);

        repr.arrData.forEach(({ n: nvalid, typ: ovltype }) => {
          for (let j = 0; j < nvalid; j++) {
            if (ovltype === "Y") {
              const locnum = blknum.toString().padStart(2, "0");
              mapblocks.push({
                coord: new BlockCoord(ptr),
                inside: locnum,
              });
              newCoordDict.set(new BlockCoord(ptr), `${blkid}${locnum}`);
              blknum += 1;
            } else if (ovltype === "F") {
              blknum += 1;
            }
            if (axis === "x") {
              ptr.x += dir === "+" ? 1 : -1;
            } else {
              ptr.y += dir === "+" ? 1 : -1;
            }
          }
        });
      });
      if (blknum !== maxNum + 1) {
        console.log(
          `blknum-blkmeta mismatch: ${blknum - 1} vs ${maxNum} in ${blkid}`
        );
      }
    });
    setMapblocks(mapblocks);
    setMaplabels(maplabels);
    setCoordDict(newCoordDict);
    setMapmeta(mapmeta);
  };

  const handleClick = (absCoord: AbsCoord, isTouch: boolean) => {
    const blockCoord = absCoord.intoBlk();
    if (coordDict === null) return;
    if (mapmeta === null) return;

    if (isTouch != wasTouch) setWasTouch(isTouch);

    const locstring = coordDict.getLocstring(blockCoord);
    if (locstring) {
      const qb = new QueryBuilder();
      qb.setHall(mapmeta.location_top);
      qb.setBlk(locstring[0]);
      const locnumstr = locstring.slice(1, 3);
      qb.setNum(locnumstr);

      qb.doSearch(mapmeta.event_id).then((booth_ids) => {
        if (booth_ids === null) {
          throw new Error(`Invalid query: ${qb}`);
        }
        setBoothIds(booth_ids);
        console.log("Booth_IDS", booth_ids);
      });
    } else {
      setBoothIds([]);
    }
  };

  if (mapblocks && maplabels && overlays)
    return (
      <div
        style={{
          width: "100vw",
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        <MapCanvasInner
          mapName={mapName}
          image={image}
          mapblocks={mapblocks}
          maplabels={maplabels}
          overlays={overlays}
          handleClick={handleClick}
        />
        {boothIds.length > 0 ? (
          <div className="map-modal-bg" onClick={() => setBoothIds([])}>
            <div
              className="map-modal-dialog-box"
              onClick={(e) => e.stopPropagation()}
            >
              <BoothTable
                boothIds={boothIds}
                scrollable={false}
                isTouch={wasTouch}
                triggerOverlayReload={triggerOverlayReload}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
}

type MapCanvasInnerProp = {
  mapName: string;
  image: HTMLImageElement | null;
  mapblocks: MapBlock[];
  maplabels: MapLabel[];
  overlays: Overlay[];
  handleClick: (absCoord: AbsCoord, isTouch: boolean) => void;
};

function MapCanvasInner({
  mapName,
  image,
  mapblocks,
  maplabels,
  overlays,
  handleClick,
}: MapCanvasInnerProp) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [viewScale, setViewScale] = useState(1);
  const [viewOffset, setViewOffset] = useState(new ViewOffset({ x: 0, y: 0 }));

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingStarted, setIsDraggingStarted] = useState(false);
  const [dragStart, setDragStart] = useState(new ViewCoord({ x: 0, y: 0 }));

  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(viewScale, viewScale);

    if (image) ctx.drawImage(image, 0, 0);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 14px sans-serif";
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.lineWidth = 2;

    mapblocks.forEach(({ coord, inside }: MapBlock) => {
      const { x, y } = coord.intoAbs();

      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, BLOCKSIZE, BLOCKSIZE);

      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillText(inside, x + BLOCKSIZE / 2, y + BLOCKSIZE / 2);
    });

    ctx.font = "bold 40px sans-serif";
    maplabels.forEach(({ coord, blkid }: MapLabel) => {
      const { x, y } = coord.intoAbs();
      ctx.fillStyle = "black";
      ctx.fillText(blkid, x + BLOCKSIZE, y + BLOCKSIZE);
    });

    overlays.forEach((ovl: Overlay) => {
      const { coord, color, locsubsec } = ovl;
      const { x, y } = coord.intoAbs();

      ctx.fillStyle = color;

      if (locsubsec == "ab") {
        ctx.fillRect(x, y, BLOCKSIZE, BLOCKSIZE);
      } else if (locsubsec == "a") {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + BLOCKSIZE, y);
        ctx.lineTo(x, y + BLOCKSIZE);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(x + BLOCKSIZE, y);
        ctx.lineTo(x + BLOCKSIZE, y + BLOCKSIZE);
        ctx.lineTo(x, y + BLOCKSIZE);
        ctx.closePath();
        ctx.fill();
      }
    });
  }, [viewScale, viewOffset, overlays]);

  const handleDown = (clientxy: ClientXY) => {
    setIsDragging(false);
    setIsDraggingStarted(true);

    const clientCoord = ViewCoord.fromClient(clientxy);

    setDragStart(clientCoord.subOffset(viewOffset));
  };
  const handleMove = (clientxy: ClientXY) => {
    const clientCoord = ViewCoord.fromClient(clientxy);
    const diff = clientCoord.subOffset(viewOffset).sub(dragStart).l2norm();

    if (isDraggingStarted && diff > 5) {
      setIsDragging(true);
      const { size } = mapNameDict[mapName];

      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewSize = size.intoAbs().intoView(viewScale);
      const offsetLimit = ViewOffset.sizeOfCanvas(canvas).sub(viewSize);

      const dViewCoord = clientCoord.sub(dragStart);
      setViewOffset(limitOffset(dViewCoord, offsetLimit, null));
    }
  };
  const handleUp = (clientxy: ClientXY, isTouch: boolean) => {
    setIsDraggingStarted(false);
    if (!isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const canvasOffset = ViewOffset.offsetOfCanvas(canvas);
      handleClick(
        ViewCoord.fromClient(clientxy)
          .subOffset(canvasOffset)
          .subOffset(viewOffset)
          .intoAbs(viewScale),
        isTouch
      );
    }
    setIsDragging(false);
  };

  function zoomCanvas(clientCoord: ViewCoord, zoom: number) {
    const nextScale = viewScale * zoom;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { size } = mapNameDict[mapName];
    const viewSize = size.intoAbs().intoView(viewScale);

    const { x: limitX, y: limitY } = ViewOffset.sizeOfCanvas(canvas).rawdivelem(
      size.intoAbs()
    );

    const scaleLimit = Math.min(limitX, limitY);
    const newScale = nextScale > scaleLimit ? nextScale : scaleLimit;

    const newClientCoord = clientCoord
      .subOffset(ViewOffset.offsetOfCanvas(canvas))
      .subOffset(viewOffset)
      .intoAbs(viewScale)
      .intoView(newScale);
    const newViewOffset = clientCoord.sub(newClientCoord);
    const offsetLimit = ViewOffset.sizeOfCanvas(canvas).sub(viewSize);
    setViewScale(newScale);
    setViewOffset(limitOffset(newViewOffset, offsetLimit, null));
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDown(e);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleDown(touch);
    } else if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMove(touch);
    } else if (e.touches.length === 2) {
      const midCoord = getMidpoint(e.touches);
      const newDist = getTouchDistance(e.touches);
      const zoom = newDist / lastTouchDistance;
      zoomCanvas(midCoord, zoom);
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    handleUp(e, false);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleUp(touch, true);
  };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    zoomCanvas(ViewCoord.fromClient(e), zoom);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="map-canvas"
    />
  );
}

export default MapCanvas;
