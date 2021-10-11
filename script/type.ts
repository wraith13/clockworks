import { Locale } from "./locale";
import { Color } from "./color";
import resource from "../resource/images.json";
export module Type
{
    // export type ApplicationType = keyof typeof applicationList;
    export type ApplicationType = "RainbowClock" | "CountdownTimer" | "ElapsedTimer" | "NeverStopwatch";

    export interface ApplicationEntry<ItemType>
    {
        icon: keyof typeof resource;
        title: string;
        show: (item: ItemType) => Promise<unknown>;
        parseItem: (json: string) => ItemType;
    }
    export const themeObject =
    {
        "auto": null,
        "light": null,
        "dark": null,
    };
    export type ThemeType = keyof typeof themeObject;
    export const ThemeList = Object.keys(themeObject);

    export const progressBarStyleObject =
    {
        "header": null,
        "auto": null,
        "horizontal": null,
        "vertical": null,
    };
    export type ProgressBarStyleType = keyof typeof progressBarStyleObject;
    export const ProgressBarStyleList = Object.keys(progressBarStyleObject);
    export interface Settings
    {
        theme?: ThemeType;
        progressBarStyle?: ProgressBarStyleType;
        locale?: Locale.LocaleType;
    }
    export interface AlarmTimerEntry
    {
        type: "timer";
        start: number;
        end: number;
    }
    export interface AlarmNewTimerEntry // URL インターフェイスとしてのみの利用。
    {
        type: "timer";
        start: "new";
        end: string;
    }
    export interface AlarmScheduleEntry
    {
        type: "schedule";
        title: string;
        start: number;
        end: number;
    }
    export type AlarmEntry = AlarmTimerEntry | AlarmScheduleEntry;
    export interface TimezoneEntry
    {
        title: string;
        offset: number;
    }
    export interface EventEntry
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
    export interface PageParams
    {
        application?: Type.ApplicationType;
        item?: Type.PageItemType;
    }
}
