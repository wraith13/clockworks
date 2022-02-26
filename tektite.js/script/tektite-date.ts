import { Tektite } from "./tektite-index.js";
export module TektiteDate
{
    export type DateFormatType = "formal-time" | "smart-time";
    export class TektiteDate<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        public getDate = (date: Date | number = new Date()): Date => "number" === typeof date ? new Date(date): date;
        public getTicks = (date: Date | number = new Date()): number => "number" === typeof date ? date: date.getTime();
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
        public dateCoreStringFromTick = (tick: null | number): string =>
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
        public getTime = (tick: null | number): null | number =>
        {
            if (null === tick)
            {
                return null;
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
        public dateStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            {
                return `${this.dateCoreStringFromTick(tick)} ${this.timeLongCoreStringFromTick(this.getTime(tick))}`;
            }
        };
        public dateFullStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            {
                return `${this.dateCoreStringFromTick(tick)} ${this.timeFullCoreStringFromTick(this.getTime(tick))}`;
            }
        };
        public timeShortCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${this.timeShortCoreStringFromTick(-tick)}`;
            }
            else
            {
                const hour = Math.floor(tick /(60 *60 *1000)) %24;
                const minute = Math.floor(tick /(60 *1000)) %60;
                return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}`;
            }
        };
        public timeLongCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${this.timeLongCoreStringFromTick(-tick)}`;
            }
            else
            {
                const hour = Math.floor(tick /(60 *60 *1000)) %24;
                const minute = Math.floor(tick /(60 *1000)) %60;
                const second = Math.floor(tick /(1000)) %60;
                return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}:${("00" +second).slice(-2)}`;
            }
        };
        public timeFullCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${this.timeFullCoreStringFromTick(-tick)}`;
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
        public timeShortStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${this.timeShortStringFromTick(-tick)}`;
            }
            else
            {
                // if (tick < 60 *1000)
                // {
                //     return timeFullCoreStringFromTick(tick);
                // }
                if (tick < 60 *60 *1000)
                {
                    return this.timeLongCoreStringFromTick(tick);
                }
                const days = Math.floor(tick / (24 *60 *60 *1000));
                if (days < 1)
                {
                    return this.timeLongCoreStringFromTick(tick);
                }
                return `${days.toLocaleString()} ${this.tektite.locale.map("days")} ${this.timeLongCoreStringFromTick(tick)}`;
            }
        };
    
        private makeSmartTimeText = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${this.makeSmartTimeText(-tick)}`;
            }
            else
            {
                const days = Math.floor(tick / (24 *60 *60 *1000));
                return 0 < days ?
                    `${days.toLocaleString()} ${this.tektite.locale.map("days")} ${10 < days ? this.timeShortCoreStringFromTick(tick): this.timeLongCoreStringFromTick(tick)}`:
                    this.timeFullCoreStringFromTick(tick);
            }
        };
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
        public format = (format :DateFormatType, date: Date | number | null) =>
        {
            if (null === date)
            {
                return null;
            }
            else
            {
                switch(format)
                {
                case "formal-time":
                    return this.makeFormalTimeText(this.getTicks(date));
                case "smart-time":
                    return this.makeSmartTimeText(this.getTicks(date));
                }
                return `${date}`;
            }
        };
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
        (tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new TektiteDate(tektite);
}