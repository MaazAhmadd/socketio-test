
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";

const VideoPlayer = () => {
  const [open, setOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null)
  // transition: transform .5s cubic-bezier(.32, .72, 0, 1);
  //   transform: translate(0px, -224px);
  return (
    <div style={{
      transform: !open ? `translate(0px, -${containerRef.current?.offsetHeight}px)` : "translate(0px, 0px)"
      , transition: "transform .5s cubic-bezier(.32, .72, 0, 1)"
    }}>
      <div ref={containerRef} className={cn("h-[208px] w-full bg-red-800 sm:h-[224px]")}>
        videoplayer
      </div>
      {open && <div onClick={() => setOpen(false)} className="mx-auto flex h-[20px] w-12 cursor-pointer items-center justify-center rounded-b-xl bg-gray-600/50"><TiArrowSortedUp /></div>}
      {!open && <div onClick={() => setOpen(true)} className="mx-auto flex h-[20px] w-12 cursor-pointer items-center justify-center rounded-b-xl bg-gray-600/50"><TiArrowSortedDown /></div>}
    </div>
  )
}

export default VideoPlayer