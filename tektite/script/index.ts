import { minamo } from "../../script/minamo.js";
import { Locale } from "./locale";
import { Fullscreen as FullscreenModule } from "./fullscreen";
import { Screen } from "./screen";
import { Toast as ToastModule } from "./toast";
import { Header } from "./header";
import { Menu } from "./menu";
import { Key as KeyModule } from "./key";
export module Tektite
{
    export interface LocaleEntry
    {
        [key : string] : string;
    }
    export type HeaderSegmentSource<PageParams, IconKeyType> = Header.SegmentSource<PageParams, IconKeyType>;
    export type HeaderSource<PageParams, IconKeyType> = Header.Source<PageParams, IconKeyType>;
    export interface ScreenSource<PageParams, IconKeyType>
    {
        className?: string;
        header: HeaderSource<PageParams, IconKeyType>;
        body: minamo.dom.Source;
    }
    export type TektiteIconKeyType = "cross-icon" | "ellipsis-icon" | "down-triangle-icon";
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
        $make = minamo.dom.make;
        $tag = minamo.dom.tag;
        $div = this.$tag("div");
        $span = this.$tag("span");
        $labelSpan = this.$span("label");
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
                            tag: "h1",
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
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(params: TektiteParams<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Tektite(params);
}
