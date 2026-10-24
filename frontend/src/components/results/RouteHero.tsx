import { motion } from "framer-motion";
import { BedDouble, Flag, MapPin } from "lucide-react";
import { prefersReducedMotion } from "../../animations/motion";
import type { Itinerary, MissionSummary } from "../../types/api";
import { formatClock, formatDayLabel } from "../../utils/format";
import { MODE_META } from "../../utils/mission";

function End({ icon, place, time, day, align }: {
  icon: React.ReactNode; place: string; time: string; day: string; align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "min-w-0 text-right" : "min-w-0"}>
      <p className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50 ${align === "right" ? "justify-end" : ""}`}>
        {icon}{day}
      </p>
      <p className="mt-0.5 text-[20px] font-semibold leading-none text-white tnum sm:text-[22px]">{time}</p>
      <p className="mt-1 max-w-[9rem] truncate text-[12.5px] text-white/65 sm:max-w-[14rem]" title={place}>{place}</p>
    </div>
  );
}

/** Origin ●- - - vehicle - - -● venue, with the vehicle travelling the route. Door-to-venue times at each end. */
export function RouteHero({ itinerary: it, mission }: { itinerary: Itinerary; mission: MissionSummary }) {
  const Icon = MODE_META[it.mode].icon;
  const start = it.timeline[0]?.time ?? it.main.departure_time;
  const reduced = prefersReducedMotion();
  // a night-before journey stops at a hotel on the way — mark where, proportionally to the time spent getting there
  const hotelAt = it.hotel && it.strategy === "night_before"
    ? Math.min(0.85, Math.max(0.35, (Date.parse(it.main.arrival_time) - Date.parse(start))
        / Math.max(1, Date.parse(it.arrival.venue_arrival) - Date.parse(start))))
    : null;

  return (
    <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5" aria-label={
      `From ${mission.origin.city} at ${formatClock(start)} to ${mission.venue.name} at ${formatClock(it.arrival.venue_arrival)}`}>
      <End align="left" icon={<MapPin className="size-3" aria-hidden />} place={mission.origin.city}
        time={formatClock(start)} day={formatDayLabel(start, mission.travel_date)} />

      <div className="relative h-10" aria-hidden>
        <div className="absolute inset-x-1 top-1/2 h-[2px] -translate-y-1/2 rounded-full route-track" />
        <span className="absolute left-0 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-white" />
        <span className="absolute right-0 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-amber shadow-[0_0_0_4px_rgb(245_158_11_/_0.25)]" />
        {hotelAt !== null && (
          <span className="absolute top-1/2 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-ink-3 text-white/80"
            style={{ left: `${hotelAt * 100}%` }} title={it.hotel?.name}>
            <BedDouble className="size-3.5" />
          </span>
        )}
        <motion.span className="absolute top-1/2 grid size-9 place-items-center rounded-full bg-amber text-ink shadow-[0_8px_24px_-6px_rgb(245_158_11_/_0.7)]"
          style={{ x: "-50%", y: "-50%" }}
          initial={{ left: reduced ? "50%" : "4%" }}
          animate={reduced ? { left: "50%" } : { left: ["4%", "96%"] }}
          transition={reduced ? undefined : { duration: 4.2, ease: [0.45, 0, 0.55, 1], repeat: Infinity, repeatDelay: 1.4 }}>
          <Icon className="size-4" strokeWidth={2.2} />
        </motion.span>
      </div>

      <End align="right" icon={<Flag className="size-3" aria-hidden />} place={mission.venue.name}
        time={formatClock(it.arrival.venue_arrival)} day={formatDayLabel(it.arrival.venue_arrival, mission.travel_date)} />
    </div>
  );
}
