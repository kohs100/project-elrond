import React, { useEffect, useState, useRef } from "react";

import {
  AbsCoord,
  AbsOffset,
  type BlockXY,
  type ClientXY,
  CoordMap,
  fromBlockCoord,
  getBlockCoord,
  getCanvasOffset,
  getClientCoord,
  getMidpoint,
  getTouchDistance,
  limitOffset,
} from "../util/canvasUtil";

import { type MapMetadata } from "../util/mapType";

import d1_e456 from "./mapData/c106_day1_e456";
import d1_w from "./mapData/c106_day1_w";

const mapNameDict: Dictionary<MapMetadata> = {
  d1_e456: d1_e456,
  d1_w: d1_w,
};

interface Dictionary<T> {
  [Key: string]: T;
}

type MapBlock = BlockXY & { inside: string };
type Overlay = {
  locstring: string;
  is2sp: boolean;
  color: string;
};

type MapCanvasProp = {
  mapName: string;
};

function MapCanvas({ mapName }: MapCanvasProp) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [viewScale, setViewScale] = useState(1);
  const [viewOffset, setViewOffset] = useState(new AbsOffset({ x: 0, y: 0 }));

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingStarted, setIsDraggingStarted] = useState(false);
  const [dragStart, setDragStart] = useState(new AbsCoord({ x: 0, y: 0 }));

  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  const [coordDict, setCoordDict] = useState<CoordMap | null>(null);
  const [mapblocks, setMapblocks] = useState<MapBlock[] | null>(null);
  const [overlays, ] = useState<Overlay[]>([
    {
      locstring: "ヤ17",
      is2sp: false,
      color: "red",
    },
    {
      locstring: "ヤ16",
      is2sp: true,
      color: "blue",
    },
  ]);

  const [touchCoord, setTouchCoord] = useState("");

  useEffect(() => {
    setupMapmetadata();
  }, []);

  const setupMapmetadata = () => {
    const { blockDict, backgroundUrl } = mapNameDict[mapName];
    const boothlist: MapBlock[] = [];
    const newCoordDict: CoordMap = new CoordMap();

    if (backgroundUrl) {
      const img = new Image();
      img.src = backgroundUrl;
      img.onload = () => setImage(img);
    }

    Object.entries(blockDict).forEach(([blkid, blkmeta]) => {
      let blknum = 1;
      blkmeta.blocks.forEach((linmeta) => {
        const { origin, axis, dir, repr } = linmeta;
        const ptr: BlockXY = { blockX: origin.blockX, blockY: origin.blockY };

        repr.arrData.forEach(({ n: nvalid, typ: ovltype }) => {
          for (let j = 0; j < nvalid; j++) {
            if (ovltype === "Y") {
              const locnum = blknum.toString().padStart(2, "0");
              boothlist.push({ inside: locnum, ...ptr });
              newCoordDict.set(ptr, `${blkid}${locnum}`);
              blknum += 1;
            } else if (ovltype === "F") {
              blknum += 1;
            }
            if (axis === "x") {
              ptr.blockX += dir === "+" ? 1 : -1;
            } else {
              ptr.blockY += dir === "+" ? 1 : -1;
            }
          }
        });
      });
      if (blknum !== blkmeta.max_num + 1) {
        console.log(
          `blknum-blkmeta mismatch: ${blknum - 1} vs ${blkmeta.max_num} in ${blkid}`
        );
      }
    });
    setMapblocks(boothlist);
    setCoordDict(newCoordDict);
  };

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

    if (mapblocks === null) return;
    mapblocks.forEach((blockdata: MapBlock) => {
      const { inside } = blockdata;
      const { x, y } = fromBlockCoord(blockdata);
      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 20, 20);

      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillText(inside, x + 10, y + 10);
    });

    if (coordDict === null) return;
    overlays.forEach((ovl: Overlay) => {
      const { locstring, color, is2sp } = ovl;
      const coord = coordDict.getCoord(locstring);
      if (coord === undefined) {
        console.log(`${locstring} not found!!`);
        return;
      }
      const { x, y } = fromBlockCoord(coord);

      ctx.fillStyle = color;

      if (is2sp) {
        ctx.fillRect(x, y, 20, 20);
      } else {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y);
        ctx.lineTo(x, y + 20);
        ctx.closePath();
        ctx.fill();
      }
    });
  }, [image, viewScale, viewOffset, mapblocks, overlays, coordDict]);

  const handleDown = (clientxy: ClientXY) => {
    setIsDragging(false);
    setIsDraggingStarted(true);

    const clientCoord = getClientCoord(clientxy);

    setDragStart(clientCoord.subOffset(viewOffset));
  };
  const handleMove = ({ clientX, clientY }: ClientXY) => {
    const clientCoord = new AbsCoord({ x: clientX, y: clientY });

    const dx = clientX - viewOffset.x - dragStart.x;
    const dy = clientY - viewOffset.y - dragStart.y;

    if (isDraggingStarted && Math.sqrt(dx * dx + dy * dy) > 5) {
      setIsDragging(true);
      const { size } = mapNameDict[mapName];

      const canvas = canvasRef.current;
      if (!canvas) return;

      const offsetLimitX = canvas.width - size.blockX * 20 * viewScale;
      const offsetLimitY = canvas.height - size.blockY * 20 * viewScale;

      const dViewCoord = clientCoord.sub(dragStart);
      setViewOffset(
        limitOffset(
          dViewCoord,
          { x: offsetLimitX, y: offsetLimitY },
          { x: 0, y: 0 }
        )
      );
    }
  };
  const handleUp = ({ clientX, clientY }: ClientXY) => {
    setIsDraggingStarted(false);
    if (!isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const canvasOffset = getCanvasOffset(canvas);

      const clientCoord = new AbsCoord({ x: clientX, y: clientY });
      const pixelCoord = clientCoord
        .subOffset(canvasOffset)
        .subOffset(viewOffset)
        .scale(viewScale);
      const blockCoord = getBlockCoord(pixelCoord);

      if (coordDict === null) return;
      const locstring = coordDict.getLocstring(blockCoord);
      if (locstring) {
        setTouchCoord(locstring);
      }
    }
    setIsDragging(false);
  };

  function zoomCanvas(clientCoord: AbsCoord, zoom: number) {
    const nextScale = viewScale * zoom;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { size } = mapNameDict[mapName];

    const scaleLimitX = canvas.width / (size.blockX * 20);
    const scaleLimitY = canvas.height / (size.blockY * 20);

    const scaleLimit = Math.min(scaleLimitX, scaleLimitY);
    const newScale = nextScale > scaleLimit ? nextScale : scaleLimit;

    const newClientCoord = clientCoord
      .subOffset(getCanvasOffset(canvas))
      .subOffset(viewOffset)
      .scale(viewScale)
      .unscale(newScale);

    setViewScale(newScale);
    setViewOffset(clientCoord.sub(newClientCoord));
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
    handleUp(e);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleUp(touch);
  };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    zoomCanvas(getClientCoord(e), zoom);
  };

  return (
    <div style={{ width: "100vw", height: "80dvh" }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ width: "100%", height: "100%", touchAction: "none" }}
        className="map-canvas"
      />
      <h2>{touchCoord}</h2>
    </div>
  );
}

export default MapCanvas;
