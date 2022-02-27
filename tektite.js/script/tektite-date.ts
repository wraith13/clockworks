import { Tektite } from "./tektite-index.js";
export module TektiteDate
{
    export type GetTicksOptionType = "elapsed" | "rest" | Date | number;
    export type TimeFormatType =
        "formal-time" | "long-time" | "short-time" |
        "HH:MM:SS.mmm" | "HH:MM:SS" | "HH:MM";
    export type DateFormatType =
        "www" |
        "YYYY-MM-DD" | "YYYY-MM-DD www" |
        "YYYY-MM-DD HH:MM:SS.mmm" | "YYYY-MM-DD HH:MM:SS" | "YYYY-MM-DD HH:MM";
    export class TektiteDate<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        public getDate = (date: Date | number | string = new Date()): Date =>
            "number" === typeof date ? new Date(date):
            "string" === typeof date ? this.parseDate(date):
            date;
        public getTicks = (date: Date | number | string = new Date(), option?: GetTicksOptionType): number =>
            null === (option ?? null) ?
                "number" === typeof date ? date: // timespan or date
                "string" === typeof date ? this.parseDate(date).getTime(): // date
                date.getTime(): // date
            "elapsed" === option ? this.getTicks() -this.getTicks(date): // timespan
            "rest" === option ? this.getTicks(date) -this.getTicks(): // timespan
            this.getTicks(date) -this.getTicks(option); // timespan
        public utcOffsetRate: number = 60 *1000;
        public getUTCTicks = (date: Date = new Date()): number => this.getTicks(date) +(date.getTimezoneOffset() *this.utcOffsetRate);
        public weekday = (tick: number) =>
            new Intl.DateTimeFormat(this.tektite.locale.get(), { weekday: 'long'}).format(tick);
        private makeFormalTimeText = (timer: number) =>
        {
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
        private makeYYYYMMDD = (date: Date): string =>
            `${date.getFullYear()}-${("0" +(date.getMonth() +1)).substr(-2)}-${("0" +date.getDate()).substr(-2)}`;
        public getTime = (tick: null | number | Date | string): null | number =>
        {
            if (null === tick)
            {
                return null;
            }
            else
            if (tick instanceof Date || "string" === typeof tick)
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
        private makeHHMM = (tick: number): string =>
        {
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
        private makeHHMMSS = (tick: number): string =>
        {
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
        private makeHHMMSSmmm = (tick: number): string =>
        {
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
        private makeTimeTextBase = (tick: number, defaultFormat: TimeFormatType): string =>
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
        private makeShortTimeText = (tick: number): string => this.makeTimeTextBase(tick, "HH:MM:SS");
        private makeLongTimeText = (tick: number): string => this.makeTimeTextBase(tick, "HH:MM:SS.mmm");
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
                    return this.parseDate(`2020-01-01T${time}`).getTime() -this.parseDate(`2020-01-01T00:00:00`).getTime();
                }
                catch
                {
                    return null;
                }
            }
            return null;
        };
        public format(format :TimeFormatType, timespan: number | null): string
        public format(format :TimeFormatType, date: Date | number | string | null, option: GetTicksOptionType): string
        public format(format :"days", days: number | null): string
        public format(format :DateFormatType, date: Date | number | string | null): string
        public format(format :TimeFormatType | "days" | DateFormatType, date: Date | number | string | null, option?: GetTicksOptionType): string
        {
            if (null === date)
            {
                return "N/A";
            }
            else
            {
                switch(format)
                {
                case "formal-time":
                    return this.makeFormalTimeText(this.getTicks(date, option));
                case "long-time":
                    return this.makeLongTimeText(this.getTicks(date, option));
                case "short-time":
                    return this.makeShortTimeText(this.getTicks(date, option));
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
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
        (tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new TektiteDate(tektite);
}