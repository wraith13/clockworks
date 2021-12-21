import { minamo } from "../../nephila/minamo.js/index.js";
import { Locale } from "./tektite-locale";
import { Fullscreen as FullscreenModule } from "./tektite-fullscreen";
import { Screen } from "./tektite-screen";
import { Toast as ToastModule } from "./tektite-toast";
import { Header } from "./tektite-header";
import { Menu } from "./tektite-menu";
import { Key as KeyModule } from "./tektite-key";
import tektiteResource from "../images.json";
export module Tektite
{
    export const $make = minamo.dom.make;
    export const $tag = minamo.dom.tag;
    export const $div = $tag("div");
    export const $span = $tag("span");
    export const $labelSpan = $span("label");
    export const monospace = (classNameOrValue: string | minamo.dom.Source, labelOrValue?: minamo.dom.Source, valueOrNothing?: minamo.dom.Source) =>
        "string" !== typeof classNameOrValue || undefined === labelOrValue ?
            $span("value monospace")(classNameOrValue):
            $div(classNameOrValue)
            ([
                undefined !== valueOrNothing ? labelOrValue: [],
                $span("value monospace")(valueOrNothing ?? labelOrValue),
            ]);
    export interface LocaleEntry
    {
        [key : string] : string;
    }
    export const progressBarStyleObject =
    {
        "header": null,
        "auto": null,
        "horizontal": null,
        "vertical": null,
    };
    export type ProgressBarStyleType = keyof typeof progressBarStyleObject;
    export const ProgressBarStyleList = Object.keys(progressBarStyleObject);
    export type HeaderSegmentSource<PageParams, IconKeyType> = Header.SegmentSource<PageParams, IconKeyType>;
    export type HeaderSource<PageParams, IconKeyType> = Header.Source<PageParams, IconKeyType>;
    export type PrimaryPageSource = { body: minamo.dom.Source, footer?: minamo.dom.Source, };
    export type PageSource = { primary: PrimaryPageSource | minamo.dom.Source, trail?: minamo.dom.Source, };
    export interface ScreenSource<PageParams, IconKeyType>
    {
        className?: string;
        header: HeaderSource<PageParams, IconKeyType>;
        body: PageSource | minamo.dom.Source;
    }
    export type TektiteIconKeyType = keyof typeof tektiteResource;
    export type UpdateWindowEventEype = "high-resolution-timer" | "timer" | "scroll" | "storage" | "focus" | "blur" | "operate";
    export interface TektiteParams<PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        makeUrl: (args: PageParams) => string;
        showUrl: (data: PageParams) => Promise<unknown>;
        showPage: (url: string) => Promise<unknown>;
        loadSvgOrCache: (key: IconKeyType | TektiteIconKeyType) => Promise<SVGElement>;
        localeMaster: LocaleMapType;
        timer?: { resolution?: number, highResolution?: number, };
    }
    export class Tektite<PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public params: TektiteParams<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
            window.addEventListener("compositionstart", this.key.onCompositionStart);
            window.addEventListener("compositionend", this.key.onCompositionEnd);
        }
        public loadSvgOrCache = (key: TektiteIconKeyType) => this.params.loadSvgOrCache(key);
        public onLoad = () =>
        {
            minamo.dom.make
            ({
                parent: document.body,
                tag: "div",
                id: "foundation",
                children:
                {
                    tag: "div",
                    id: "screen",
                    className: "screen",
                    children:
                    [
                        {
                            tag: "header",
                            id: "screen-header",
                            className: "segmented",
                        },
                        {
                            tag: "div",
                            id: "screen-body",
                            className: "screen-body",
                        },
                        {
                            tag: "div",
                            className: "screen-bar",
                            childNodes:
                            {
                                tag: "div",
                                className: "screen-bar-flash-layer",
                            },
                        },
                        {
                            tag: "div",
                            id: "screen-toast",
                        },
                    ]
                }
            });
            this.screen.onLoad();
        };
        public fullscreen = FullscreenModule;
        public key = KeyModule;
        public screen = Screen.make(this);
        public header = Header.make(this);
        public menu = Menu.make(this);
        public locale = Locale.make(this);
        public toast = ToastModule;
        public internalLink = (data: { className?: string, href: PageParams, children: minamo.dom.Source}): minamo.dom.Source =>
        ({
            tag: "a",
            className: data.className,
            href: this.params.makeUrl(data.href),
            children: data.children,
            onclick: (_event: MouseEvent) =>
            {
                // event.stopPropagation();
                this.params.showUrl(data.href);
                return false;
            }
        });
        public externalLink = (data: { className?: string, href: string, children: minamo.dom.Source}) =>
        ({
            tag: "a",
            className: data.className,
            href: data.href,
            children: data.children,
        });
        public onWebkitFullscreenChange = (_event: Event) =>
        {
            if (0 <= navigator.userAgent.indexOf("iPad") || (0 <= navigator.userAgent.indexOf("Macintosh") && "ontouchend" in document))
            {
                document.body.classList.toggle("fxxking-ipad-fullscreen", this.fullscreen.element());
            }
        };
        public reload = async () => await this.params.showPage(location.href);
        public setTitle = (title: string) =>
        {
            if (document.title !== title)
            {
                document.title = title;
            }
        };
        public escape = () =>
        {
            const target = this.screen.getScreenCover() ?? this.header.getCloseButton();
            target?.click();
            return !! target;
        }
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(params: TektiteParams<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Tektite(params);
    export const setHeaderColor = (color: string | null) =>
        minamo.dom.setProperty("#screen-header", "backgroundColor", color ?? "");
    export const setBodyColor = (color: string) =>
    {
        minamo.dom.setStyleProperty(document.body, "backgroundColor", `${color}E8`);
        minamo.dom.setProperty("#theme-color", "content", color);
    };
    export const setFoundationColor = (color: string | null) =>
            minamo.dom.setStyleProperty("#foundation", "backgroundColor", color ?? "");
    let latestColor: string | null;
    export const setBackgroundColor = (color: string | null) =>
    {
        latestColor = color;
        if (document.body.classList.contains("tektite-classic"))
        {
            setHeaderColor(color);
            setFoundationColor(null);
        }
        if (document.body.classList.contains("tektite-modern"))
        {
            setFoundationColor(color);
            setHeaderColor(null);
        }
    };
    export const setStyle = (style: "modern" | "classic") =>
    {
        if
        (
            [
                { className: "tektite-modern", tottle: "modern" === style, },
                { className: "tektite-classic", tottle: "classic" === style, },
            ]
            .map(i => minamo.dom.toggleCSSClass(document.body, i.className, i.tottle).isUpdate)
            .reduce((a, b) => a || b, false)
        )
        {
            setBackgroundColor(latestColor ?? null);
        }
    }
    export const setProgressBarStyle = (progressBarStyle: ProgressBarStyleType) =>
        setStyle("header" !== progressBarStyle ? "modern": "classic");
    export const getProgressElement = () => document.getElementById("screen-header").getElementsByClassName("progress-bar")[0] as HTMLDivElement;
    export const getScreenBarElement = () => document.getElementsByClassName("screen-bar")[0] as HTMLDivElement;
    const resetScreenBarProgress = () =>
    {
        const screenBar = getScreenBarElement();
        minamo.dom.setStyleProperty(screenBar, "display", "none");
    }
    const resetHeaderProgress = () =>
    {
        const progressBar = getProgressElement();
        minamo.dom.setStyleProperty(progressBar, "width", "0%");
        minamo.dom.setStyleProperty(progressBar, "borderRightWidth", "0px");
    }
    export const resetProgress = () =>
    {
        resetScreenBarProgress();
        resetHeaderProgress();
    }
    export const setProgress = (progressBarStyle: ProgressBarStyleType, percent: null | number, color?: string) =>
    {
        setProgressBarStyle(progressBarStyle);
        const screenBar = getScreenBarElement();
        if (null !== percent && "header" !== progressBarStyle)
        {
            if (color)
            {
                minamo.dom.setStyleProperty(screenBar, "backgroundColor", color);
            }
            const percentString = percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
            if ((window.innerHeight < window.innerWidth && "vertical" !== progressBarStyle) || "horizontal" === progressBarStyle)
            {
                minamo.dom.addCSSClass(screenBar, "horizontal");
                minamo.dom.removeCSSClass(screenBar, "vertical");
                minamo.dom.setStyleProperty(screenBar, "height", "initial");
                minamo.dom.setStyleProperty(screenBar, "maxHeight", "initial");
                minamo.dom.setStyleProperty(screenBar, "width", percentString);
                minamo.dom.setStyleProperty(screenBar, "maxWidth", percentString);
            }
            else
            {
                minamo.dom.addCSSClass(screenBar, "vertical");
                minamo.dom.removeCSSClass(screenBar, "horizontal");
                minamo.dom.setStyleProperty(screenBar, "width", "initial");
                minamo.dom.setStyleProperty(screenBar, "maxWidth", "initial");
                minamo.dom.setStyleProperty(screenBar, "height", percentString);
                minamo.dom.setStyleProperty(screenBar, "maxHeight", percentString);
            }
            minamo.dom.setStyleProperty(screenBar, "display", "block");
        }
        else
        {
            resetScreenBarProgress();
        }
        const progressBar = getProgressElement();
        if (null !== percent && "header" === progressBarStyle)
        {
            if (color)
            {
                minamo.dom.setStyleProperty(progressBar, "backgroundColor", color);
            }
            const percentString = percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
            minamo.dom.setStyleProperty(progressBar, "width", percentString);
            minamo.dom.setStyleProperty(progressBar, "borderRightWidth", "1px");
        }
        else
        {
            resetHeaderProgress();
        }
    };
}
