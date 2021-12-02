import { minamo } from "../../../nephila/minamo.js";
import { Type } from "../../type";
import config from "../../../resource/config.json";
export module Storage
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
