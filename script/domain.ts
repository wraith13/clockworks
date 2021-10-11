import { Locale } from "./locale";
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
    export const getFlashIntervalPreset = () => config.flashIntervalPreset.map(i => parseTimer(i));
    export const getTimerPreset = () => config.timerPreset.map(i => parseTimer(i));
    export const utcOffsetRate = 60 *1000;
    // export const makeMinutesTimerLabel = (minutes: number) => makeTimerLabel(minutes *60 *1000);
    export const makeTimerLabel = (timer: number) =>
    {
        if (timer < 0)
        {
            return `-${makeTimerLabel(-timer)}`;
        }
        const days = Math.floor(timer / (24 * 60 * 60 * 1000));
        const hours = Math.floor(timer / (60 * 60 * 1000)) % 24;
        const minutes = Math.floor(timer / (60 * 1000)) % 60;
        const seconds = Math.floor(timer / 1000) % 60;
        const milliseconds = Math.floor(timer) % 1000;
        let result = "";
        if ("" !== result || 0 < days)
        {
            if ("" === result)
            {
                result = `${days} ` +Locale.map("days");
            }
            else
            {
                result += ` ${days} ` +Locale.map("days");
            }
        }
        if (("" !== result && (0 < minutes || 0 < seconds || 0 < milliseconds)) || 0 < hours)
        {
            if ("" === result)
            {
                result = `${hours} ` +Locale.map("hours");
            }
            else
            {
                result += ` ` +`0${hours}`.substr(-2) +` ` +Locale.map("hours");
            }
        }
        if (("" !== result && (0 < seconds || 0 < milliseconds)) || 0 < minutes)
        {
            if ("" === result)
            {
                result = `${minutes} ` +Locale.map("minutes");
            }
            else
            {
                result += ` ` +`0${minutes}`.substr(-2) +` ` +Locale.map("minutes");
            }
        }
        if (0 < seconds || 0 < milliseconds)
        {
            let trail = "";
            if (0 < milliseconds)
            {
                trail = `.` +`00${milliseconds}`.substr(-3);
                trail = trail.replace(/0+$/, "");
            }
            if ("" === result)
            {
                result = `${seconds}${trail} ` +Locale.map("seconds");
            }
            else
            {
                result += ` ` +`0${seconds}`.substr(-2) +trail +` ` +Locale.map("seconds");
            }
        }
        if ("" === result)
        {
            result = `${minutes} ${Locale.map("m(minutes)")}`;
        }
        // console.log({ timer, result, });
        return result;
    };
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
    export const weekday = (tick: number) =>
        new Intl.DateTimeFormat(Locale.get(), { weekday: 'long'}).format(tick);
    export const dateCoreStringFromTick = (tick: null | number): string =>
    {
        if (null === tick)
        {
            return "N/A";
        }
        else
        {
            const date = new Date(tick);
            return `${date.getFullYear()}-${("0" +(date.getMonth() +1)).substr(-2)}-${("0" +date.getDate()).substr(-2)}`;
        }
    };
    export const getTime = (tick: null | number): null | number =>
    {
        if (null === tick)
        {
            return null;
        }
        else
        if (tick < 0)
        {
            return -getTime(tick);
        }
        else
        if (tick < 24 *60 *60 *1000)
        {
            return tick;
        }
        else
        {
            const date = new Date(tick);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return tick -getTicks(date);
        }
    };
    export const dateStringFromTick = (tick: null | number): string =>
    {
        if (null === tick)
        {
            return "N/A";
        }
        else
        {
            return `${dateCoreStringFromTick(tick)} ${timeLongCoreStringFromTick(getTime(tick))}`;
        }
    };
    export const dateFullStringFromTick = (tick: null | number): string =>
    {
        if (null === tick)
        {
            return "N/A";
        }
        else
        {
            return `${dateCoreStringFromTick(tick)} ${timeFullCoreStringFromTick(getTime(tick))}`;
        }
    };
    export const timeShortCoreStringFromTick = (tick: null | number): string =>
    {
        if (null === tick)
        {
            return "N/A";
        }
        else
        if (tick < 0)
        {
            return `-${timeShortCoreStringFromTick(-tick)}`;
        }
        else
        {
            const hour = Math.floor(tick /(60 *60 *1000)) %24;
            const minute = Math.floor(tick /(60 *1000)) %60;
            return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}`;
        }
    };
    export const timeLongCoreStringFromTick = (tick: null | number): string =>
    {
        if (null === tick)
        {
            return "N/A";
        }
        else
        if (tick < 0)
        {
            return `-${timeLongCoreStringFromTick(-tick)}`;
        }
        else
        {
            const hour = Math.floor(tick /(60 *60 *1000)) %24;
            const minute = Math.floor(tick /(60 *1000)) %60;
            const second = Math.floor(tick /(1000)) %60;
            return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}:${("00" +second).slice(-2)}`;
        }
    };
    export const timeFullCoreStringFromTick = (tick: null | number): string =>
    {
        if (null === tick)
        {
            return "N/A";
        }
        else
        if (tick < 0)
        {
            return `-${timeFullCoreStringFromTick(-tick)}`;
        }
        else
        {
            const hour = Math.floor(tick /(60 *60 *1000)) %24;
            const minute = Math.floor(tick /(60 *1000)) %60;
            const second = Math.floor(tick /(1000)) %60;
            const milliseconds = tick %1000;
            return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}:${("00" +second).slice(-2)}.${("000" +milliseconds).slice(-3)}`;
        }
    };
    export const timeShortStringFromTick = (tick: null | number): string =>
    {
        if (null === tick)
        {
            return "N/A";
        }
        else
        if (tick < 0)
        {
            return `-${timeShortStringFromTick(-tick)}`;
        }
        else
        {
            // if (tick < 60 *1000)
            // {
            //     return timeFullCoreStringFromTick(tick);
            // }
            if (tick < 60 *60 *1000)
            {
                return timeLongCoreStringFromTick(tick);
            }
            const days = Math.floor(tick / (24 *60 *60 *1000));
            if (days < 1)
            {
                return timeLongCoreStringFromTick(tick);
            }
            return `${days.toLocaleString()} ${Locale.map("days")} ${timeLongCoreStringFromTick(tick)}`;
        }
    };
    export const timeLongStringFromTick = (tick: null | number): string =>
    {
        if (null === tick)
        {
            return "N/A";
        }
        else
        if (tick < 0)
        {
            return `-${timeLongStringFromTick(-tick)}`;
        }
        else
        {
            const days = Math.floor(tick / (24 *60 *60 *1000));
            return 0 < days ?
                `${days.toLocaleString()} ${Locale.map("days")} ${10 < days ? timeShortCoreStringFromTick(tick): timeLongCoreStringFromTick(tick)}`:
                timeFullCoreStringFromTick(tick);
        }
    };
    export const parseDate = (date: string | null): Date | null =>
    {
        if (null !== date)
        {
            try
            {
                return new Date(Date.parse(date));
            }
            catch
            {
                return null;
            }
        }
        return null;
    };
    export const parseTime = (time: string | null): number | null =>
    {
        if (null !== time)
        {
            try
            {
                return parseDate(`2020-01-01T${time}`).getTime() -parseDate(`2020-01-01T00:00:00`).getTime();
            }
            catch
            {
                return null;
            }
        }
        return null;
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
                    return parseFloat(timer.substr(0, timer.length -2).trim());
                }
                else
                if (timer.endsWith("s"))
                {
                    return parseFloat(timer.substr(0, timer.length -1).trim()) *1000;
                }
                else
                if (timer.endsWith("m"))
                {
                    return parseFloat(timer.substr(0, timer.length -1).trim()) *60 *1000;
                }
                else
                if (timer.endsWith("h"))
                {
                    return parseFloat(timer.substr(0, timer.length -1).trim()) *60 *60 *1000;
                }
                else
                if (timer.endsWith("d"))
                {
                    return parseFloat(timer.substr(0, timer.length -1).trim()) *24 *60 *60 *1000;
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
