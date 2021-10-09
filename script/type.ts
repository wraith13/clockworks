import { locale } from "./locale";
import resource from "../resource/images.json";
export module Type
{
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
        locale?: locale.LocaleType;
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
}
