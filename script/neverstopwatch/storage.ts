import { minamo } from "../minamo.js/index.js";
import { Base } from "../base";
import config from "../../resource/config.json";
export module Storage
{
    const applicationName = "NeverStopwatch";
    export module Stamps
    {
        export const makeKey = () => `${config.localDbPrefix}:${applicationName}:stamps`;
        export const get = (): number[] => minamo.localStorage.getOrNull<number[]>(makeKey()) ?? [];
        export const set = (list: number[]) => minamo.localStorage.set(makeKey(), list);
        export const removeKey = () => minamo.localStorage.remove(makeKey());
        export const add = (tick: number | number[]) =>
            set(get().concat(tick).sort(Base.simpleReverseComparer).slice(0, 100));
        export const remove = (tick: number) =>
            set(get().filter(i => tick !== i).sort(Base.simpleReverseComparer));
        export const isSaved = (tick: number) => 0 <= get().indexOf(tick);
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
