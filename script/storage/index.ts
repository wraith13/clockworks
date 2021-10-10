import { minamo } from "../minamo.js";
import { Locale } from "../locale";
import { Type } from "../type";
import { Storage as NeverStopwatchStorage } from "../neverstopwatch/storage";
import config from "../../resource/config.json";
export module Storage
{
    export let lastUpdate = 0;
    export const NeverStopwatch = NeverStopwatchStorage;
    export module CountdownTimer
    {
        const applicationName = "CountdownTimer";
        export module Alarms
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:alarms`;
            export const get = (): Type.AlarmEntry[] => minamo.localStorage.getOrNull<Type.AlarmEntry[]>(makeKey()) ?? [];
            export const set = (list: Type.AlarmEntry[]) => minamo.localStorage.set(makeKey(), list.sort(minamo.core.comparer.make(i => i.end)));
            export const removeKey = () => minamo.localStorage.remove(makeKey());
            export const add = (item: Type.AlarmEntry | Type.AlarmEntry[]) =>
                set(get().concat(item));
            export const remove = (item: Type.AlarmEntry) =>
                set(get().filter(i => JSON.stringify(item) !== JSON.stringify(i)));
            export const isSaved = (item: Type.AlarmEntry) =>
                0 <= get().map(i => JSON.stringify(i)).indexOf(JSON.stringify(item));
        }
        export module flashInterval
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:flashInterval`;
            export const get = () => minamo.localStorage.getOrNull<number>(makeKey()) ?? 0;
            export const set = (value: number) => minamo.localStorage.set(makeKey(), value);
        }
        export module recentlyFlashInterval
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:recentlyFlashInterval`;
            export const get = () => minamo.localStorage.getOrNull<number[]>(makeKey()) ?? [];
            export const set = (list: number[]) => minamo.localStorage.set(makeKey(), list);
            export const add = (value: number) => set
            (
                [value].concat(get())
                    .filter((i, ix, list) => ix === list.indexOf(i))
                    .filter((_i, ix) => ix < config.recentlyFlashIntervalMaxHistory)
            );
        }
        export module recentlyTimer
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:recentlyTimer`;
            export const get = () => minamo.localStorage.getOrNull<number[]>(makeKey()) ?? [];
            export const set = (list: number[]) => minamo.localStorage.set(makeKey(), list);
            export const add = (value: number) => set
            (
                [value].concat(get())
                    .filter((i, ix, list) => ix === list.indexOf(i))
                    .filter((_i, ix) => ix < config.recentlyTimerMaxHistory)
            );
        }
        export module ColorIndex
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:colorIndex`;
            export const get = () => minamo.localStorage.getOrNull<number>(makeKey()) ?? 0;
            export const set = (value: number) => minamo.localStorage.set(makeKey(), value);
        }
    }
    export module ElapsedTimer
    {
        const applicationName = "ElapsedTimer";
        export module Events
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:alarms`;
            export const get = (): Type.EventEntry[] => minamo.localStorage.getOrNull<Type.EventEntry[]>(makeKey()) ?? [];
            export const set = (list: Type.EventEntry[]) => minamo.localStorage.set(makeKey(), list.sort(minamo.core.comparer.make(i => i.tick)));
            export const removeKey = () => minamo.localStorage.remove(makeKey());
            export const add = (item: Type.EventEntry | Type.EventEntry[]) =>
                set(get().concat(item));
            export const remove = (item: Type.EventEntry) =>
                set(get().filter(i => JSON.stringify(item) !== JSON.stringify(i)));
            export const isSaved = (item: Type.EventEntry) =>
                0 <= get().map(i => JSON.stringify(i)).indexOf(JSON.stringify(item));
        }
        export module flashInterval
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:flashInterval`;
            export const get = () => minamo.localStorage.getOrNull<number>(makeKey()) ?? 0;
            export const set = (value: number) => minamo.localStorage.set(makeKey(), value);
        }
        export module recentlyFlashInterval
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:recentlyFlashInterval`;
            export const get = () => minamo.localStorage.getOrNull<number[]>(makeKey()) ?? [];
            export const set = (list: number[]) => minamo.localStorage.set(makeKey(), list);
            export const add = (value: number) => set
            (
                [value].concat(get())
                    .filter((i, ix, list) => ix === list.indexOf(i))
                    .filter((_i, ix) => ix < config.recentlyFlashIntervalMaxHistory)
            );
        }
    }
    export module RainbowClock
    {
        const applicationName = "RainbowClock";
        export module colorPattern
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:colorPattern`;
            export const get = () =>
                minamo.localStorage.getOrNull<Type.rainbowClockColorPatternType>(makeKey()) ?? "gradation";
            export const set = (settings: Type.rainbowClockColorPatternType) =>
                minamo.localStorage.set(makeKey(), settings);
        }
        export module flashInterval
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:flashInterval`;
            export const get = () => minamo.localStorage.getOrNull<number>(makeKey()) ?? (60 * 60 * 1000);
            export const set = (value: number) => minamo.localStorage.set(makeKey(), value);
        }
        export module Timezone
        {
            export const makeKey = () => `${config.localDbPrefix}:${applicationName}:timezones`;
            export const get = (): Type.TimezoneEntry[] =>
                minamo.localStorage.getOrNull<Type.TimezoneEntry[]>(makeKey())
                ?? config.initialTimezoneList.map(i => ({ title: Locale.map(i.title as Locale.LocaleKeyType), offset: i.offset }));
            export const set = (list: Type.TimezoneEntry[]) => minamo.localStorage.set(makeKey(), list.sort(minamo.core.comparer.make([i => i.offset])));
            export const removeKey = () => minamo.localStorage.remove(makeKey());
            export const add = (entry: Type.TimezoneEntry | Type.TimezoneEntry[]) =>
                set(get().concat(entry));
            export const remove = (entry: Type.TimezoneEntry) =>
                set(get().filter(i => JSON.stringify(entry) !== JSON.stringify(i)));
            export const isSaved = (entry: Type.TimezoneEntry) =>
                0 <= get().map(i => JSON.stringify(i)).indexOf(JSON.stringify(entry));
        }
        
    }
    export module Settings
    {
        export const makeKey = () => `${config.localDbPrefix}:settings`;
        export const get = () =>
            minamo.localStorage.getOrNull<Type.Settings>(makeKey()) ?? { };
        export const set = (settings: Type.Settings) =>
            minamo.localStorage.set(makeKey(), settings);
    }
}
