import { minamo } from "../nephila/minamo.js";
import { Type } from "./type";
import { Base } from "./base";
import config from "../resource/config.json";
export module Domain
{
    export const makePageParams = (application: Type.ApplicationType, item: Type.PageItemType): Type.PageParams =>
    ({
        application,
        item
    });
    export const makeUrl =
    (
        args: Type.PageParams,
        href: string = location.href
    ) => Base.makeUrlRaw
    (
        {
            hash: args.application ?
                (
                    args.item ?
                        `${args.application}/${encodeURIComponent(JSON.stringify(args.item))}`:
                        args.application
                ):
                "",
        },
        href
    );
    export const getFlashIntervalPreset = () =>
        config.flashIntervalPreset.map(i => parseTimer(i)).filter(i => null !== i) as number[];
    export const getTimerPreset = () => minamo.core.existFilter(config.timerPreset.map(i => parseTimer(i)));
    export const utcOffsetRate = 60 *1000;
    export const getTicks = (date: Date = new Date()) => date.getTime();
    export const getUTCTicks = (date: Date = new Date()) => getTicks(date) +(date.getTimezoneOffset() *utcOffsetRate);
    export const getAppropriateTicks = (date: Date = new Date()) =>
    {
        const TenMinutesLater = date.getTime() +(10 *60 *1000);
        const FloorHour = new Date(TenMinutesLater);
        FloorHour.setMinutes(0);
        FloorHour.setSeconds(0);
        FloorHour.setMilliseconds(0);
        return FloorHour.getTime() +(60 *60 *1000);
    };
    const timezoneOffsetSignString = (offset: number): string => 0 === offset ? "±": (0 < offset ? "-": "+"); // ※ JavaScript 上のタイムゾーンオフセットとUTC表記は + / - が逆転する
    const timezoneOffsetTimeString = (offset: number): string =>
    {
        if (offset < 0)
        {
            return timezoneOffsetTimeString(-offset);
        }
        const hours = `00${Math.floor(offset /60)}`.slice(-2);
        const minutes = `00${offset %60}`.slice(-2);
        return `${hours}:${minutes}`;
    };
    export const timezoneOffsetString = (offset: number) => `UTC${timezoneOffsetSignString(offset)}${timezoneOffsetTimeString(offset)}`;
    export const parseOrNull = (json: string) =>
    {
        if (null !== json && undefined !== json)
        {
            try
            {
                return JSON.parse(json);
            }
            catch(error)
            {
                console.error(error);
            }
        }
        return null;
    };
    export const parseStampCore = (item: any): number | null =>
    {
        const now = Domain.getTicks();
        if ("new" === item)
        {
            return now;
        }
        if ("number" === typeof item && item <= now)
        {
            return item;
        }
        return null;
    };
    export const makeStampUrl = (item: "new" | number) => makeUrl(makePageParams("NeverStopwatch", item));
    export const parseStamp = (json: string): number | null => parseStampCore(parseOrNull(json));
    export const parseTimer = (timer: any) =>
    {
        try
        {
            switch(typeof timer)
            {
            case "number":
                return timer;
            case "string":
                if (timer.endsWith("ms"))
                {
                    return parseFloat(timer.substring(0, timer.length -2).trim());
                }
                else
                if (timer.endsWith("s"))
                {
                    return parseFloat(timer.substring(0, timer.length -1).trim()) *1000;
                }
                else
                if (timer.endsWith("m"))
                {
                    return parseFloat(timer.substring(0, timer.length -1).trim()) *60 *1000;
                }
                else
                if (timer.endsWith("h"))
                {
                    return parseFloat(timer.substring(0, timer.length -1).trim()) *60 *60 *1000;
                }
                else
                if (timer.endsWith("d"))
                {
                    return parseFloat(timer.substring(0, timer.length -1).trim()) *24 *60 *60 *1000;
                }
                else
                {
                    return parseInt(timer.trim());
                }
            }
        }
        catch(err)
        {
            console.error(err);
        }
        return null;
    };
    export const parseAlarmCore = (item: any): Type.AlarmEntry | null =>
    {
        if (null !== item && undefined !== item && "object" === typeof item)
        {
            if
            (
                "timer" === item.type &&
                "number" === typeof item.start &&
                "number" === typeof item.end &&
                item.start < item.end
            )
            {
                const result =
                {
                    type: item.type,
                    start: item.start,
                    end: item.end,
                };
                return result;
            }
            const newTimer = parseTimer(item.end);
            if
            (
                "timer" === item.type &&
                "new" === item.start &&
                "number" === typeof newTimer &&
                0 < newTimer
            )
            {
                const start = getTicks();
                const result =
                {
                    type: item.type,
                    start: start,
                    end: start +newTimer,
                };
                return result;
            }
            if
            (
                "schedule" === item.type &&
                "string" === typeof item.title &&
                "number" === typeof item.start &&
                "number" === typeof item.end &&
                item.start < item.end
            )
            {
                const result =
                {
                    type: item.type,
                    title: item.title,
                    start: item.start,
                    end: item.end,
                };
                return result;
            }
        }
        return null;
    };
    export const makeNewTimerUrl = (timer: string) => makeUrl
    (
        makePageParams
        (
            "CountdownTimer",
            {
                type: "timer",
                start: "new",
                end: timer,
            },
        )
    );
    // export const makeNewTimerUrl = (timer: string) => `?application=CountdownTimer&item=%7B%22type%22%3A%22timer%22%2C%22start%22%3A%22new%22%2C%22end%22%3A%22${timer}%22%7D`;
    export const parseAlarm = (json: string): Type.AlarmEntry | null => parseAlarmCore(parseOrNull(json));
    export const parseEventCore = (item: any): Type.EventEntry | null =>
    {
        if (null !== item && undefined !== item && "object" === typeof item)
        {
            if
            (
                "string" === typeof item.title &&
                0 < item.title.trim().length &&
                "new" === item.start
            )
            {
                const result =
                {
                    title: item.title.trim(),
                    tick: getTicks(),
                };
                return result;
            }
            if
            (
                "string" === typeof item.title &&
                0 < item.title.trim().length &&
                "number" === typeof item.tick
            )
            {
                const result =
                {
                    title: item.title.trim(),
                    tick: item.tick,
                };
                return result;
            }
        }
        return null;
    };
    export const parseEvent = (json: string): Type.EventEntry | null => parseEventCore(parseOrNull(json));
    export const parseTimezoneCore = (item: any): Type.TimezoneEntry | null =>
    {
        if (null !== item && undefined !== item && "object" === typeof item)
        {
            if
            (
                "string" === typeof item.title &&
                0 < item.title.trim().length &&
                "number" === typeof item.offset &&
                -960 <= item.offset && item.offset <= 960
            )
            {
                const result =
                {
                    title: item.title.trim(),
                    offset: item.offset,
                };
                return result;
            }
        }
        return null;
    };
    export const parseTimezone = (json: string): Type.TimezoneEntry | null => parseTimezoneCore(parseOrNull(json));
}
