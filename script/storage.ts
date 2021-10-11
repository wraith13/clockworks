import { minamo } from "./minamo.js/index.js";
import { Type } from "./type";
import { Storage as RainbowClockStorage } from "./application/rainbowclock/storage";
import { Storage as CountdownTimerStorage } from "./application/countdowntimer/storage";
import { Storage as ElapsedTimerStorage } from "./application/elapsedtimer/storage";
import { Storage as NeverStopwatchStorage } from "./application/neverstopwatch/storage";
import config from "../resource/config.json";
export module Storage
{
    export let lastUpdate = 0;
    export const RainbowClock = RainbowClockStorage;
    export const CountdownTimer = CountdownTimerStorage;
    export const ElapsedTimer = ElapsedTimerStorage;
    export const NeverStopwatch = NeverStopwatchStorage;
    export module Settings
    {
        export const makeKey = () => `${config.localDbPrefix}:settings`;
        export const get = () =>
            minamo.localStorage.getOrNull<Type.Settings>(makeKey()) ?? { };
        export const set = (settings: Type.Settings) =>
            minamo.localStorage.set(makeKey(), settings);
    }
}
