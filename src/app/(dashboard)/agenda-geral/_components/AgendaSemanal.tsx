"use client";

import { useMemo, useState, useTransition } from "react";
import type { AgendaGeralEvento } from "@/lib/google-calendar/agenda";
import { addDaysToDateString } from "@/lib/utils/timezone";
import { listarAgendaGeralSemana } from "../actions";

const START_HOUR = 6;
const END_HOUR = 23;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
const HOUR_LABELS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, index) => START_HOUR + index,
);

interface TimedSegment {
  event: AgendaGeralEvento;
  startMinutes: number;
  endMinutes: number;
  column: number;
  columns: number;
}

function getBrazilDateKey(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function getBrazilMinutes(value: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value || 0,
  );

  return hour * 60 + minute;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

function formatWeekRange(weekStart: string): string {
  const weekEnd = addDaysToDateString(weekStart, 6);
  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  };

  return `${formatDate(weekStart)} a ${formatDate(weekEnd)}`;
}

function getTimedSegments(
  events: AgendaGeralEvento[],
  day: string,
): TimedSegment[] {
  return events
    .filter((event) => !event.diaInteiro)
    .flatMap((event) => {
      const eventStartDay = getBrazilDateKey(new Date(event.inicio));
      const eventEndDay = getBrazilDateKey(new Date(event.fim));

      if (day < eventStartDay || day > eventEndDay) {
        return [];
      }

      const startMinutes =
        day === eventStartDay ? getBrazilMinutes(event.inicio) : 0;
      const endMinutes =
        day === eventEndDay ? getBrazilMinutes(event.fim) : 24 * 60;

      if (endMinutes <= startMinutes) {
        return [];
      }

      return [{ event, startMinutes, endMinutes, column: 0, columns: 1 }];
    });
}

function layOutOverlaps(segments: TimedSegment[]): TimedSegment[] {
  const sorted = [...segments].sort(
    (first, second) =>
      first.startMinutes - second.startMinutes ||
      first.endMinutes - second.endMinutes,
  );
  const result: TimedSegment[] = [];
  let cluster: TimedSegment[] = [];
  let clusterEnd = -1;

  const finalizeCluster = () => {
    if (cluster.length === 0) return;

    const columnEnds: number[] = [];
    const laidOut = cluster.map((segment) => {
      const availableColumn = columnEnds.findIndex(
        (end) => end <= segment.startMinutes,
      );
      const column =
        availableColumn === -1 ? columnEnds.length : availableColumn;
      columnEnds[column] = segment.endMinutes;
      return { ...segment, column };
    });

    result.push(
      ...laidOut.map((segment) => ({
        ...segment,
        columns: columnEnds.length,
      })),
    );
    cluster = [];
    clusterEnd = -1;
  };

  for (const segment of sorted) {
    if (cluster.length > 0 && segment.startMinutes >= clusterEnd) {
      finalizeCluster();
    }

    cluster.push(segment);
    clusterEnd = Math.max(clusterEnd, segment.endMinutes);
  }

  finalizeCluster();
  return result;
}

function EventCard({ segment }: { segment: TimedSegment }) {
  const boundedStart = Math.min(
    Math.max(segment.startMinutes, START_HOUR * 60),
    END_HOUR * 60 - 1,
  );
  const boundedEnd = Math.max(
    Math.min(segment.endMinutes, END_HOUR * 60),
    boundedStart + 1,
  );
  const top = ((boundedStart - START_HOUR * 60) / TOTAL_MINUTES) * 100;
  const height = Math.max(
    ((boundedEnd - boundedStart) / TOTAL_MINUTES) * 100,
    2.75,
  );

  return (
    <article
      className="absolute overflow-hidden rounded-md border border-blue-200 bg-blue-100 p-1.5 text-xs text-blue-950 shadow-sm dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-100"
      style={{
        top: `${top}%`,
        height: `${height}%`,
        left: `calc(${(segment.column / segment.columns) * 100}% + 2px)`,
        width: `calc(${100 / segment.columns}% - 4px)`,
      }}
      title={`${segment.event.titulo} — ${segment.event.espacoNome}, ${formatTime(segment.event.inicio)} às ${formatTime(segment.event.fim)}`}
    >
      <p className="truncate font-semibold">{segment.event.titulo}</p>
      <p className="truncate">{segment.event.espacoNome}</p>
      <p className="truncate">
        {formatTime(segment.event.inicio)}–{formatTime(segment.event.fim)}
      </p>
    </article>
  );
}

export function AgendaSemanal({
  initialWeekStart,
  initialEvents,
  initialError,
}: {
  initialWeekStart: string;
  initialEvents: AgendaGeralEvento[];
  initialError?: string;
}) {
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [events, setEvents] = useState(initialEvents);
  const [error, setError] = useState(initialError || null);
  const [isPending, startTransition] = useTransition();
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        addDaysToDateString(weekStart, index),
      ),
    [weekStart],
  );
  const today = getBrazilDateKey(new Date());

  const loadWeek = (nextWeekStart: string) => {
    startTransition(async () => {
      setError(null);
      const result = await listarAgendaGeralSemana(nextWeekStart);

      if (!result.success) {
        setError(result.error || "Não foi possível carregar a agenda geral");
        return;
      }

      setWeekStart(nextWeekStart);
      setEvents(result.events || []);
    });
  };

  const allDayByDay = useMemo(
    () =>
      new Map(
        days.map((day) => [
          day,
          events.filter(
            (event) =>
              event.diaInteiro && event.inicio <= day && event.fim > day,
          ),
        ]),
      ),
    [days, events],
  );
  const timedByDay = useMemo(
    () =>
      new Map(
        days.map((day) => [day, layOutOverlaps(getTimedSegments(events, day))]),
      ),
    [days, events],
  );

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Semana de {formatWeekRange(weekStart)}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Todas as reservas confirmadas dos espaços da igreja
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadWeek(addDaysToDateString(weekStart, -7))}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Semana anterior
          </button>
          <button
            type="button"
            onClick={() => loadWeek(initialWeekStart)}
            disabled={isPending || weekStart === initialWeekStart}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => loadWeek(addDaysToDateString(weekStart, 7))}
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Próxima semana
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
          <button
            type="button"
            onClick={() => loadWeek(weekStart)}
            disabled={isPending}
            className="mt-3 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/40"
          >
            Tentar novamente
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center dark:border-gray-600">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Nenhuma reserva nesta semana
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Não há eventos agendados nos espaços da igreja para este período.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[4rem_repeat(7,minmax(8rem,1fr))] border-b border-gray-200 dark:border-gray-700">
              <div className="border-r border-gray-200 dark:border-gray-700" />
              {days.map((day) => {
                const [year, month, date] = day.split("-").map(Number);
                const header = new Intl.DateTimeFormat("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  timeZone: "UTC",
                }).format(new Date(Date.UTC(year, month - 1, date)));

                return (
                  <div
                    key={day}
                    className={`border-r p-3 text-center text-sm font-medium last:border-r-0 dark:border-gray-700 ${
                      day === today
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {header}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-[4rem_repeat(7,minmax(8rem,1fr))] border-b border-gray-200 dark:border-gray-700">
              <div className="border-r p-2 text-xs font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Dia inteiro
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className="min-h-12 border-r p-1 last:border-r-0 dark:border-gray-700"
                >
                  {(allDayByDay.get(day) || []).map((event) => (
                    <div
                      key={`${event.id}-${day}`}
                      className="mb-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-950 dark:bg-blue-900/50 dark:text-blue-100"
                      title={`${event.titulo} — ${event.espacoNome}`}
                    >
                      <p className="truncate font-semibold">{event.titulo}</p>
                      <p className="truncate">{event.espacoNome}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[4rem_repeat(7,minmax(8rem,1fr))]">
              <div className="relative h-[1088px] border-r dark:border-gray-700">
                {HOUR_LABELS.map((hour) => (
                  <span
                    key={hour}
                    className="absolute -translate-y-1/2 px-2 text-xs text-gray-500 dark:text-gray-400"
                    style={{
                      top: `${((hour - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                    }}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </span>
                ))}
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className={`relative h-[1088px] overflow-hidden border-r last:border-r-0 dark:border-gray-700 ${
                    day === today ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                  }`}
                >
                  {HOUR_LABELS.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-800"
                      style={{
                        top: `${((hour - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                      }}
                    />
                  ))}
                  {(timedByDay.get(day) || []).map((segment) => (
                    <EventCard
                      key={`${segment.event.id}-${day}`}
                      segment={segment}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isPending ? (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Carregando agenda...
        </p>
      ) : null}
    </section>
  );
}
