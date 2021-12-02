import { Clockworks } from "../..";
import { minamo } from "../../../nephila/minamo.js";
import { Type } from "../../type";
import config from "../../../resource/config.json";
export module Storage
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
            ?? config.initialTimezoneList.map(i => ({ title: Clockworks.localeMap(i.title as Clockworks.LocaleKeyType), offset: i.offset }));
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
