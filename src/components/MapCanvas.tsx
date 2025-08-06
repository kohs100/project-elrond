import React, { useEffect, useState, useRef } from "react";

import {
  BlockCoord,
  ViewCoord,
  ViewOffset,
  type ClientXY,
  CoordMap,
  getCanvasOffset,
  getMidpoint,
  getTouchDistance,
  limitOffset,
  BLOCKSIZE,
  getCanvasSize,
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

type MapBlock = {
  coord: BlockCoord;
  inside: string;
};
type MapLabel = {
  coord: BlockCoord;
  blkid: string;
};
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
  const [viewOffset, setViewOffset] = useState(new ViewOffset({ x: 0, y: 0 }));

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingStarted, setIsDraggingStarted] = useState(false);
  const [dragStart, setDragStart] = useState(new ViewCoord({ x: 0, y: 0 }));

  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  const [coordDict, setCoordDict] = useState<CoordMap | null>(null);
  const [mapblocks, setMapblocks] = useState<MapBlock[]>([]);
  const [maplabels, setMaplabels] = useState<MapLabel[]>([]);
  const [overlays] = useState<Overlay[]>([
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
    const mapblocks: MapBlock[] = [];
    const maplabels: MapLabel[] = [];
    const newCoordDict: CoordMap = new CoordMap();

    if (backgroundUrl) {
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

    if (coordDict === null) return;
    overlays.forEach((ovl: Overlay) => {
      const { locstring, color, is2sp } = ovl;
      const coord = coordDict.getCoord(locstring);
      if (coord === undefined) {
        console.log(`${locstring} not found!!`);
        return;
      }
      const { x, y } = coord.intoAbs();

      ctx.fillStyle = color;

      if (is2sp) {
        ctx.fillRect(x, y, BLOCKSIZE, BLOCKSIZE);
      } else {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + BLOCKSIZE, y);
        ctx.lineTo(x, y + BLOCKSIZE);
        ctx.closePath();
        ctx.fill();
      }
    });
  }, [image, viewScale, viewOffset, mapblocks, overlays, coordDict]);

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
      const offsetLimit = getCanvasSize(canvas).sub(viewSize);

      const dViewCoord = clientCoord.sub(dragStart);
      setViewOffset(limitOffset(dViewCoord, offsetLimit, null));
    }
  };
  const handleUp = (clientxy: ClientXY) => {
    setIsDraggingStarted(false);
    if (!isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const canvasOffset = getCanvasOffset(canvas);

      const clientCoord = ViewCoord.fromClient(clientxy);
      const blockCoord = clientCoord
        .subOffset(canvasOffset)
        .subOffset(viewOffset)
        .intoAbs(viewScale)
        .intoBlk();

      if (coordDict === null) return;
      const locstring = coordDict.getLocstring(blockCoord);
      if (locstring) {
        setTouchCoord(locstring);
      }
    }
    setIsDragging(false);
  };

  function zoomCanvas(clientCoord: ViewCoord, zoom: number) {
    const nextScale = viewScale * zoom;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { size } = mapNameDict[mapName];
    const viewSize = size.intoAbs().intoView(viewScale);

    const { x: limitX, y: limitY } = getCanvasSize(canvas).rawdivelem(
      size.intoAbs()
    );

    const scaleLimit = Math.min(limitX, limitY);
    const newScale = nextScale > scaleLimit ? nextScale : scaleLimit;

    const newClientCoord = clientCoord
      .subOffset(getCanvasOffset(canvas))
      .subOffset(viewOffset)
      .intoAbs(viewScale)
      .intoView(newScale);
    const newViewOffset = clientCoord.sub(newClientCoord);
    const offsetLimit = getCanvasSize(canvas).sub(viewSize);
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
    zoomCanvas(ViewCoord.fromClient(e), zoom);
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
