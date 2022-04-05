import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index.js";
export module TektiteDate
{
    export type DateSourceType = Date | number | string;
    export type GetTicksDirectionOptionType = "elapsed" | "clip-elapsed" | "rest" | "clip-rest";
    export type GetTicksOperandOptionType = Date | number;
    export type GetTicksOptionType = GetTicksDirectionOptionType | GetTicksOperandOptionType;
    export type VariableTimespanFormatType = "formal-time" | "long-time" | "short-time";
    export type StaticTimespanFormatType = "HH:MM:SS.mmm" | "HH:MM:SS" | "HH:MM";
    export type TimespanFormatType = VariableTimespanFormatType | StaticTimespanFormatType;
    export type DateFormatType =
        "www" |
        "YYYY-MM-DD" | "YYYY-MM-DD www" |
        "YYYY-MM-DD HH:MM:SS.mmm" | "YYYY-MM-DD HH:MM:SS" | "YYYY-MM-DD HH:MM";
    // export class TektiteDate<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    export class TektiteDate<T extends Tektite.ParamTypes>
    {
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        public getDate(): Date;
        public getDate(date: Date | number): Date;
        public getDate(date: DateSourceType | null): Date | null;
        public getDate(date?: DateSourceType | null): Date | null
        {
            if (minamo.core.exists(date))
            {
                switch(typeof date)
                {
                case "number":
                    return new Date(date);
                case "string":
                    return this.parseDate(date);
                default:
                    return date;
                }
            }
            else
            {
                return new Date();
            }
        }
        public getTicks(date?: Date | number | null, option?: GetTicksOperandOptionType): number;
        public getTicks(date?: DateSourceType | null, option?: GetTicksOperandOptionType): number | null;
        public getTicks(date: Date | number | null, option: GetTicksDirectionOptionType, now?: Date | number): number;
        public getTicks(date: DateSourceType | null, option: GetTicksDirectionOptionType, now?: Date | number): number | null;
        public getTicks(date?: DateSourceType | null, option?: GetTicksOptionType, now?: Date | number): number | null
        {
            if (null === (option ?? null))
            {
                switch(typeof date)
                {
                case "number":
                    return date; // timespan or date
                case "string":
                    return this.parseDate(date)?.getTime() ?? null; // date
                default:
                    return (date ?? new Date()).getTime() // date;
                }
            }
            else
            {
                const getNowTicks = () => this.getTicks(now ?? new Date());
                const targetTicks = this.getTicks(date ?? Date());
                if (null === targetTicks)
                {
                    return null;
                }
                switch(option)
                {
                case "elapsed":
                    return getNowTicks() -targetTicks; // timespan
                case "clip-elapsed":
                    return Math.max(getNowTicks() -targetTicks, 0); // timespan
                case "rest":
                    return targetTicks -getNowTicks(); // timespan
                case "clip-rest":
                    return Math.max(targetTicks -getNowTicks(), 0); // timespan
                default:
                    return targetTicks -this.getTicks(option); // timespan
                }
            }
            // return null === (option ?? null) ?
            //     "number" === typeof date ? date: // timespan or date
            //     "string" === typeof date ? this.parseDate(date)?.getTime() ?? null: // date
            //     (date ?? new Date()).getTime(): // date
            // "elapsed" === option ? this.getTicks(now ?? new Date()) -this.getTicks(date ?? Date()): // timespan
            // "clip-elapsed" === option ? Math.max(this.getTicks(now ?? new Date()) -this.getTicks(date ?? Date()), 0): // timespan
            // "rest" === option ? this.getTicks(date ?? Date()) -this.getTicks(now ?? new Date()): // timespan
            // "clip-rest" === option ? Math.max(this.getTicks(date ?? Date()) -this.getTicks(now ?? new Date()), 0): // timespan
            // this.getTicks(date ?? Date()) -this.getTicks(option); // timespan
        }
        public utcOffsetRate: number = 60 *1000;
        public getUTCTicks = (date: Date = new Date()): number => this.getTicks(date) +(date.getTimezoneOffset() *this.utcOffsetRate);
        public weekday(tick: number): string
        public weekday(tick: number | null): string | null;
        public weekday(tick: number | null): string | null
        {
            if (null === tick)
            {
                return null;
            }
            else
            {
                return new Intl.DateTimeFormat(this.tektite.locale.get(), { weekday: 'long'}).format(tick);
            }
        }
        private makeFormalTimeText(timer: null): null;
        private makeFormalTimeText(timer: number): string;
        private makeFormalTimeText(timer: number | null): string | null;
        private makeFormalTimeText(timer: number | null): string | null
        {
            if (null === timer)
            {
                return null;
            }
            if (timer < 0)
            {
                return `-${this.makeFormalTimeText(-timer)}`;
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
                    result = `${days} ` +this.tektite.locale.map("days");
                }
                else
                {
                    result += ` ${days} ` +this.tektite.locale.map("days");
                }
            }
            if (("" !== result && (0 < minutes || 0 < seconds || 0 < milliseconds)) || 0 < hours)
            {
                if ("" === result)
                {
                    result = `${hours} ` +this.tektite.locale.map("hours");
                }
                else
                {
                    result += ` ` +`0${hours}`.substr(-2) +` ` +this.tektite.locale.map("hours");
                }
            }
            if (("" !== result && (0 < seconds || 0 < milliseconds)) || 0 < minutes)
            {
                if ("" === result)
                {
                    result = `${minutes} ` +this.tektite.locale.map("minutes");
                }
                else
                {
                    result += ` ` +`0${minutes}`.substr(-2) +` ` +this.tektite.locale.map("minutes");
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
                    result = `${seconds}${trail} ` +this.tektite.locale.map("seconds");
                }
                else
                {
                    result += ` ` +`0${seconds}`.substr(-2) +trail +` ` +this.tektite.locale.map("seconds");
                }
            }
            if ("" === result)
            {
                result = `${minutes} ${this.tektite.locale.map("m(minutes)")}`;
            }
            // console.log({ timer, result, });
            return result;
        };
        private makeYYYYMMDD(date: Date): string;
        private makeYYYYMMDD(date: Date | null): string | null;
        private makeYYYYMMDD(date: Date | null): string | null
        {
            if (null === date)
            {
                return null;
            }
            else
            {
                return `${date.getFullYear()}-${("0" +(date.getMonth() +1)).substr(-2)}-${("0" +date.getDate()).substr(-2)}`;
            }
        }
        public getTime(tick: null): null;
        public getTime(tick: string): null | number;
        public getTime(tick: number | Date): number;
        public getTime(tick: null | number | Date | string): null | number;
        public getTime(tick: null | number | Date | string): null | number
        {
            if (null === tick)
            {
                return null;
            }
            else
            if (tick instanceof Date)
            {
                return this.getTime(this.getTicks(tick));
            }
            else
            if ("string" === typeof tick)
            {
                return this.getTime(this.getTicks(tick));
            }
            else
            if (tick < 0)
            {
                return -this.getTime(tick);
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
                return tick -this.getTicks(date);
            }
        };
        private makeHHMM(tick: number): string;
        private makeHHMM(tick: number | null): string | null;
        private makeHHMM(tick: number | null): string | null
        {
            if (null === tick)
            {
                return null;
            }
            if (tick < 0)
            {
                return `-${this.makeHHMM(-tick)}`;
            }
            else
            {
                const hour = Math.floor(tick /(60 *60 *1000)) %24;
                const minute = Math.floor(tick /(60 *1000)) %60;
                return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}`;
            }
        };
        private makeHHMMSS(tick: number): string;
        private makeHHMMSS(tick: number | null): string | null;
        private makeHHMMSS(tick: number | null): string | null
        {
            if (null === tick)
            {
                return null;
            }
            if (tick < 0)
            {
                return `-${this.makeHHMMSS(-tick)}`;
            }
            else
            {
                const hour = Math.floor(tick /(60 *60 *1000)) %24;
                const minute = Math.floor(tick /(60 *1000)) %60;
                const second = Math.floor(tick /(1000)) %60;
                return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}:${("00" +second).slice(-2)}`;
            }
        };
        private makeHHMMSSmmm(tick: number): string;
        private makeHHMMSSmmm(tick: number | null): string | null;
        private makeHHMMSSmmm(tick: number): string | null
        {
            if (null === tick)
            {
                return null;
            }
            if (tick < 0)
            {
                return `-${this.makeHHMMSSmmm(-tick)}`;
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
        private makeDaysText = (days: number) => `${days.toLocaleString()} ${this.tektite.locale.map("days")}`;
        private makeTimeTextBase = (tick: number, defaultFormat: StaticTimespanFormatType): string =>
        {
            if (tick < 0)
            {
                return `-${this.makeTimeTextBase(-tick, defaultFormat)}`;
            }
            else
            {
                const days = Math.floor(tick / (24 *60 *60 *1000));
                if (days <= 0)
                {
                    return this.format(defaultFormat, tick);
                }
                else
                if (days < 10)
                {
                    return `${this.format("days", days)} ${this.format("HH:MM:SS", tick)}`;
                }
                else
                {
                    return `${this.format("days", days)} ${this.format("HH:MM", tick)}`;
                }
            }
        };
        private makeShortTimeText(tick: number): string;
        private makeShortTimeText(tick: number | null): string | null;
        private makeShortTimeText(tick: number | null): string | null
        {
            if (null === tick)
            {
                return null;
            }
            return this.makeTimeTextBase(tick, "HH:MM:SS");
        }
        private makeLongTimeText(tick: number): string;
        private makeLongTimeText(tick: number | null): string | null;
        private makeLongTimeText(tick: number | null): string | null
        {
            if (null === tick)
            {
                return null;
            }
            return this.makeTimeTextBase(tick, "HH:MM:SS.mmm");
        }
        public parseDate = (date: string | null): Date | null =>
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
        public parseTime = (time: string | null): number | null =>
        {
            if (null !== time)
            {
                try
                {
                    const target = this.parseDate(`2020-01-01T${time}`)?.getTime();
                    const base = this.parseDate(`2020-01-01T00:00:00`)?.getTime();
                    return undefined !== target && undefined !== base ? target -base: null;
                }
                catch
                {
                    return null;
                }
            }
            return null;
        };
        public format(format :TimespanFormatType, timespan: number | null): string
        public format(format :VariableTimespanFormatType, dateOrTimespan: Date | number | null, option: GetTicksOperandOptionType): string
        public format(format :VariableTimespanFormatType, dateOrTimespan: DateSourceType | null, option: GetTicksOperandOptionType): string | null
        public format(format :VariableTimespanFormatType, dateOrTimespan: Date | number | null, option: GetTicksDirectionOptionType, now?: Date | number): string
        public format(format :VariableTimespanFormatType, dateOrTimespan: DateSourceType | null, option: GetTicksDirectionOptionType, now?: Date | number): string | null
        public format(format :"days", days: number | null): string
        public format(format :DateFormatType, date: DateSourceType | null): string
        public format(format :TimespanFormatType | "days" | DateFormatType, date: DateSourceType | null, option?: GetTicksOptionType, now?: Date | number): string | null
        {
            if (null === (date ?? null))
            {
                if
                (
                    ("formal-time" === format || "long-time" === format || "short-time" === format) &&
                    ("clip-elapsed" === option || "clip-rest" === option)
                )
                {
                    return this.format(format, 0, option, 0);
                }
                return "N/A";
            }
            else
            {
                switch(format)
                {
                case "formal-time":
                    return this.makeFormalTimeText
                    (
                        "string" !== typeof option ?
                            this.getTicks(date, option):
                            this.getTicks(date, option, now)
                    );
                case "long-time":
                    return this.makeLongTimeText
                    (
                        "string" !== typeof option ?
                            this.getTicks(date, option):
                            this.getTicks(date, option, now)
                    );
                case "short-time":
                    return this.makeShortTimeText
                    (
                        "string" !== typeof option ?
                            this.getTicks(date, option):
                            this.getTicks(date, option, now)
                    );
                case "HH:MM:SS.mmm":
                    return this.makeHHMMSSmmm(this.getTicks(date));
                case "HH:MM:SS":
                    return this.makeHHMMSS(this.getTicks(date));
                case "HH:MM":
                    return this.makeHHMM(this.getTicks(date));
                case "days":
                    return this.makeDaysText(date as number);
                case "www":
                    return this.weekday(this.getTicks(date));
                case "YYYY-MM-DD":
                    return this.makeYYYYMMDD(this.getDate(date));
                case "YYYY-MM-DD www":
                    return `${this.format("YYYY-MM-DD", date)} ${this.format("www", date)}`;
                case "YYYY-MM-DD HH:MM:SS.mmm":
                    return `${this.format("YYYY-MM-DD", date)} ${this.format("HH:MM:SS.mmm", this.getTime(date))}`;
                case "YYYY-MM-DD HH:MM:SS":
                    return `${this.format("YYYY-MM-DD", date)} ${this.format("HH:MM:SS", this.getTime(date))}`;
                case "YYYY-MM-DD HH:MM":
                    return `${this.format("YYYY-MM-DD", date)} ${this.format("HH:MM", this.getTime(date))}`;
                }
                console.error(`tektite-date:unknown-date-format: ${JSON.stringify(format)}`);
                return `${date}`;
            }
        };
    }
    // export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    //     (tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
    //     new TektiteDate(tektite);
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new TektiteDate(tektite);
}