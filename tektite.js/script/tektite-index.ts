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
                id: "tektite-foundation",
                children:
                {
                    tag: "div",
                    id: "tektite-screen",
                    className: "tektite-screen",
                    children:
                    [
                        Header.domSource,
                        {
                            tag: "div",
                            id: "tektite-screen-body",
                            className: "tektite-screen-body",
                        },
                        {
                            tag: "div",
                            className: "tektite-screen-bar",
                            childNodes:
                            {
                                tag: "div",
                                className: "tektite-screen-bar-flash-layer",
                            },
                        },
                        {
                            tag: "div",
                            id: "tektite-screen-toast",
                        },
                    ]
                }
            });
            this.screen.onLoad();
        };
        public fullscreen = FullscreenModule;
        public key = KeyModule;
        public screen = Screen.make(this);
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
                document.body.classList.toggle("tektite-fxxking-ipad-fullscreen", this.fullscreen.element());
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
            const target = this.screen.getScreenCover() ?? this.screen.header.getCloseButton();
            target?.click();
            return !! target;
        }
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(params: TektiteParams<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Tektite(params);
    export const makePercentString = (percent: number) =>
        percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
}
