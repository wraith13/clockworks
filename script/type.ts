import { Color } from "./color";
import resource from "../resource/images.json";
import tektiteResource from "../tektite.js/images.json";
import { Clockworks } from ".";
import { Tektite } from "../tektite.js/script/tektite-index";
import { minamo } from "../nephila/minamo.js";
import { Resource } from "./render/resource";
import localeEn from "../resource/lang.en.json";
import localeJa from "../resource/lang.ja.json";
export module Type
{
    export const applicationList =
    {
        "RainbowClock": <Type.ApplicationEntry>
        {
            icon: "tektite-tick-icon",
            title: "Rainbow Clock",
        },
        "CountdownTimer": <Type.ApplicationEntry>
        {
            icon: "tektite-history-icon",
            title: "Countdown Timer",
        },
        "ElapsedTimer": <Type.ApplicationEntry>
        {
            icon: "tektite-elapsed-icon",
            title: "Elapsed Timer",
        },
        "NeverStopwatch": <Type.ApplicationEntry>
        {
            icon: "never-stopwatch-icon",
            title: "Never Stopwatch",
        },
    };
    export type ApplicationType = keyof typeof applicationList;
    export const applicationIdList = Object.freeze(minamo.core.objectKeys(applicationList));

    export interface ApplicationEntry//<ItemType>
    {
        icon: keyof typeof resource | keyof typeof tektiteResource;
        title: string;
        // show: (item: ItemType) => Promise<unknown>;
        // parseItem: (json: string) => ItemType;
    }
    export const themeObject =
    {
        "auto": null as null,
        "light": null as null,
        "dark": null as null,
    };
    export type ThemeType = keyof typeof themeObject;
    export const ThemeList = minamo.core.objectKeys(themeObject);

    export interface Settings extends minamo.core.JsonableObject
    {
        theme?: ThemeType;
        progressBarStyle?: Tektite.ProgressBarStyleType;
        locale?: Clockworks.LocaleType;
    }
    export interface AlarmTimerEntry extends minamo.core.JsonableObject
    {
        type: "timer";
        start: number;
        end: number;
    }
    export interface AlarmNewTimerEntry extends minamo.core.JsonableObject // URL インターフェイスとしてのみの利用。
    {
        type: "timer";
        start: "new";
        end: string;
    }
    export interface AlarmScheduleEntry extends minamo.core.JsonableObject
    {
        type: "schedule";
        title: string;
        start: number;
        end: number;
    }
    export type AlarmEntry = AlarmTimerEntry | AlarmScheduleEntry;
    export interface TimezoneEntry extends minamo.core.JsonableObject
    {
        title: string;
        offset: number;
    }
    export interface EventEntry extends minamo.core.JsonableObject
    {
        title: string;
        tick: number;
    }
    export type PageItemType = number | "new" | AlarmEntry | AlarmNewTimerEntry | EventEntry | TimezoneEntry;
    export const rainbowClockColorPatternMap =
    {
        "gradation": (index: number) => Color.getRainbowColor(index, 0),
        "solid": (index: number) => Color.getSolidRainbowColor(index, 0),
    };
    export type rainbowClockColorPatternType = keyof typeof rainbowClockColorPatternMap;
    export interface PageParams extends minamo.core.JsonableObject
    {
        application?: Type.ApplicationType;
        item?: Type.PageItemType;
        // hash?: string;
    }
    export type TektiteParams = Tektite.ParamTypes<PageParams, Resource.KeyType, typeof localeEn | typeof localeJa, typeof Clockworks.localeMaster>;
}
