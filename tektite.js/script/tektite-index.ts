import { minamo } from "../../nephila/minamo.js/index.js";
import { Locale } from "./tektite-locale";
import { TektiteDate } from "./tektite-date";
import { Fullscreen as FullscreenModule } from "./tektite-fullscreen";
import { Screen } from "./tektite-screen";
import { Header } from "./tektite-header";
import { Menu } from "./tektite-menu";
import { Key as KeyModule } from "./tektite-key";
import tektiteResource from "../images.json";
import { ViewModel } from "./tektite-view-model.js";
export module Tektite
{
    export const $make = minamo.dom.make;
    export const $tag = minamo.dom.tag;
    export const $div = $tag("div");
    export const $span = $tag("span");
    export const $labelSpan = $span("label");
    export const monospace = (classNameOrValue: string | minamo.dom.Source, labelOrValue?: minamo.dom.Source, valueOrNothing?: minamo.dom.Source) =>
        "string" !== typeof classNameOrValue || undefined === labelOrValue ?
            $span("value tektite-monospace")(classNameOrValue):
            $div(classNameOrValue)
            ([
                undefined !== valueOrNothing ? labelOrValue: [],
                $span("value tektite-monospace")(valueOrNothing ?? labelOrValue),
            ]);
    export const isAppleMobileWebApp = () => !! (<any>navigator).standalone;
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
    export type UpdateScreenEventEype = "high-resolution-timer" | "timer" | "scroll" | "storage" | "focus" | "blur" | "operate";
    export interface TektiteParams<PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        makeUrl: (args: PageParams) => string;
        showUrl: (data: PageParams) => Promise<unknown>;
        showPage: (url: string) => Promise<unknown>;
        loadIconOrCache: (key: IconKeyType | TektiteIconKeyType) => Promise<SVGElement>;
        localeMaster: LocaleMapType;
        timer?: { resolution?: number, highResolution?: number, };
    }
    export interface PopupInstance<ResultType>
    {
        set: (result: ResultType) => PopupInstance<ResultType>;
        close: () => PopupInstance<ResultType>;
        getDom: () => HTMLDivElement;
    }
    export interface PopupArguments<ResultType>
    {
        initialValue?: ResultType;
        className?: string;
        children: minamo.dom.Source;
        onClose?: () => Promise<unknown>;
    }
    export interface ViewModelBase<ViewModelTypeName>
    {
        type: ViewModelTypeName & string;
        key: string;
        data: unknown;
        children: ViewModelBase<ViewModelTypeName>[];
    }
    export interface ViewRenderer<ViewModelTypeName, Model extends ViewModelBase<ViewModelTypeName>>
    {
        make: () => Promise<Element>;
        update: (path: string, cache: ViewModel.DomCache<ViewModelTypeName>, model: Model) => Promise<Element>;
        getChildModelContainer: (dom: Element, key: ViewModelTypeName) => Element;
        isListContainer?: boolean;
    }
    ;
    export type ViewEventHandler<Model extends ViewModelBase<ViewModelTypeName>, EventType = UpdateScreenEventEype> = (event: EventType, path: string, cache: ViewModel.DomCache<ViewModelTypeName>, model: Model) => Promise<Element>;
    export interface ViewEventHandlers<ViewModelTypeName, Model extends ViewModelBase<ViewModelTypeName>>
    {
        highResolutionTimer?: ViewEventHandler<Model, "high-resolution-timer">;
        timer?: ViewEventHandler<Model, "timer">;
        scroll?: ViewEventHandler<Model, "scroll">;
        storage?: ViewEventHandler<Model, "storage">;
        focus?: ViewEventHandler<Model, "focus">;
        blur?: ViewEventHandler<Model, "blur">;
        operate?: ViewEventHandler<Model, "operate">;
    }
    export class Tektite<PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public params: TektiteParams<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
            window.addEventListener("compositionstart", this.key.onCompositionStart);
            window.addEventListener("compositionend", this.key.onCompositionEnd);
        }
        public loadIconOrCache = (key: TektiteIconKeyType) => this.params.loadIconOrCache(key);
        public fullscreen = FullscreenModule;
        public key = KeyModule;
        public screen = Screen.make(this);
        public menu = Menu.make(this);
        public locale = Locale.make(this);
        public date = TektiteDate.make(this);
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
        lastMouseMouseAt = 0;
        onMouseMove = (_evnet: MouseEvent) =>
        {
            if (this.fullscreen.enabled())
            {
                const now = this.lastMouseMouseAt = new Date().getTime();
                if (document.body.classList.contains("tektite-sleep-mouse"))
                {
                    document.body.classList.remove("tektite-sleep-mouse");
                }
                if (this.fullscreen.element())
                {
                    setTimeout
                    (
                        () =>
                        {
                            if (this.fullscreen.element() && now === this.lastMouseMouseAt)
                            {
                                if ( ! document.body.classList.contains("tektite-sleep-mouse"))
                                {
                                    document.body.classList.add("tektite-sleep-mouse");
                                }
                            }
                        },
                        3000
                    );
                }
            }
        };
        public onFullscreenChange = (_event: Event) =>
        {
            this.screen.onWindowResize();
        };
        public onWebkitFullscreenChange = (_event: Event) =>
        {
            this.screen.onWindowResize();
            if (0 <= navigator.userAgent.indexOf("iPad") || (0 <= navigator.userAgent.indexOf("Macintosh") && "ontouchend" in document))
            {
                document.body.classList.toggle("tektite-fxxking-ipad-fullscreen", this.fullscreen.element());
            }
        };
        public onKeydown = (event: KeyboardEvent) =>
        {
            if ( ! this.key.isComposing(event))
            {
                switch(event.key)
                {
                    case "Enter":
                        minamo.dom.getElementsByClassName<HTMLDivElement>(document, "popup")
                            .filter((_i, ix, list) => (ix +1) === list.length)
                            .forEach(popup => minamo.dom.getElementsByClassName<HTMLButtonElement>(popup, "tektite-default-button")?.[0]?.click());
                        break;
                    case "Escape":
                        if (this.escape())
                        {
                            event.preventDefault();
                        }
                        break;
                }
                const focusedElementTagName = document.activeElement?.tagName?.toLowerCase() ?? "";
                if (["input", "textarea"].indexOf(focusedElementTagName) < 0)
                {
                    switch(event.key.toLowerCase())
                    {
                        case "f":
                            if (this.fullscreen.enabled())
                            {
                                if(null === this.fullscreen.element())
                                {
                                    this.fullscreen.request();
                                }
                                else
                                {
                                    this.fullscreen.exit();
                                }
                            }
                            break;
                    }
                }
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
        //  Window > Foundation > Screen
        public setWindowColor = (color: string) =>
        {
            minamo.dom.setStyleProperty(document.body, "backgroundColor", `${color}E8`);
            minamo.dom.setProperty("#tektite-theme-color", "content", color);
        };

        foundation: HTMLDivElement;
        public setFoundationColor = (color: string | null) =>
            minamo.dom.setStyleProperty(this.foundation, "backgroundColor", color ?? "");
        latestColor: string | null;
        public setBackgroundColor = (color: string | null) =>
        {
            this.latestColor = color;
            if (document.body.classList.contains("tektite-style-classic"))
            {
                this.screen.header.setColor(color);
                this.setFoundationColor(null);
            }
            if (document.body.classList.contains("tektite-style-modern"))
            {
                this.setFoundationColor(color);
                this.screen.header.setColor(null);
            }
        };
        public setStyle = (style: "modern" | "classic") =>
        {
            if
            (
                [
                    { className: "tektite-style-modern", tottle: "modern" === style, },
                    { className: "tektite-style-classic", tottle: "classic" === style, },
                ]
                .map(i => minamo.dom.toggleCSSClass(document.body, i.className, i.tottle).isUpdate)
                .reduce((a, b) => a || b, false)
            )
            {
                this.setBackgroundColor(this.latestColor ?? null);
            }
        }
        public setProgressBarStyle = (progressBarStyle: Tektite.ProgressBarStyleType) =>
            this.setStyle("header" !== progressBarStyle ? "modern": "classic");
        public getScreenBarElement = () => document.getElementsByClassName("tektite-screen-bar")[0] as HTMLDivElement;
        public resetScreenBarProgress = () =>
        {
            const screenBar = this.getScreenBarElement();
            minamo.dom.setStyleProperty(screenBar, "display", "none");
        }
        public resetProgress = () =>
        {
            this.resetScreenBarProgress();
            this.screen.header.resetProgress();
        }
        public setProgress = (progressBarStyle: Tektite.ProgressBarStyleType, percent: null | number, color?: string) =>
        {
            this.setProgressBarStyle(progressBarStyle);
            if (null !== percent && "header" !== progressBarStyle)
            {
                const screenBar = this.getScreenBarElement();
                if (color)
                {
                    minamo.dom.setStyleProperty(screenBar, "backgroundColor", color);
                }
                const percentString = makePercentString(percent);
                if ((window.innerHeight < window.innerWidth && "vertical" !== progressBarStyle) || "horizontal" === progressBarStyle)
                {
                    minamo.dom.addCSSClass(screenBar, "tektite-horizontal");
                    minamo.dom.removeCSSClass(screenBar, "tektite-vertical");
                    minamo.dom.setStyleProperty(screenBar, "height", "initial");
                    minamo.dom.setStyleProperty(screenBar, "maxHeight", "initial");
                    minamo.dom.setStyleProperty(screenBar, "width", percentString);
                    minamo.dom.setStyleProperty(screenBar, "maxWidth", percentString);
                }
                else
                {
                    minamo.dom.addCSSClass(screenBar, "tektite-vertical");
                    minamo.dom.removeCSSClass(screenBar, "tektite-horizontal");
                    minamo.dom.setStyleProperty(screenBar, "width", "initial");
                    minamo.dom.setStyleProperty(screenBar, "maxWidth", "initial");
                    minamo.dom.setStyleProperty(screenBar, "height", percentString);
                    minamo.dom.setStyleProperty(screenBar, "maxHeight", percentString);
                }
                minamo.dom.setStyleProperty(screenBar, "display", "block");
            }
            else
            {
                this.resetScreenBarProgress();
            }
            if (null !== percent && "header" === progressBarStyle)
            {
                this.screen.header.setProgress(percent, color);
            }
            else
            {
                this.screen.header.resetProgress();
            }
            // minamo.dom.toggleCSSClass(this.header.getElement(), "with-screen-prgress", null !== percent);
        };
        public flash = () =>
        {
            document.body.classList.add("tektite-flash");
            setTimeout(() => document.body.classList.remove("tektite-flash"), 1500);
        };
        private updateTimer = undefined;
        private updateHighResolutionTimer = undefined;
        onWindowFocus = () =>
        {
            this.screen.update?.("focus");
        };
        onWindowBlur = () =>
        {
            this.screen.update?.("blur");
        };
        private onUpdateStorageCount = 0;
        onUpdateStorage = () =>
        {
            const onUpdateStorageCountCopy = this.onUpdateStorageCount = this.onUpdateStorageCount +1;
            setTimeout
            (
                () =>
                {
                    if (onUpdateStorageCountCopy === this.onUpdateStorageCount)
                    {
                        this.screen.update?.("storage");
                    }
                },
                50,
            );
        };
        public onLoad = () =>
        {
            this.screen.onLoad();
            this.foundation = minamo.dom.make(HTMLDivElement)
            ({
                parent: document.body,
                className: "tektite-foundation",
                children: this.screen.element,
            });
            if (isAppleMobileWebApp())
            {
                document.body.classList.add("tektite-apple-mobile-web-app");
            }
            window.addEventListener("focus", this.onWindowFocus);
            window.addEventListener("blur", this.onWindowBlur);
            window.addEventListener("storage", this.onUpdateStorage);
            window.addEventListener("resize", this.screen.onWindowResize);
            window.addEventListener("mousemove", this.onMouseMove);
            window.addEventListener("mousedown", this.screen.onMouseDown);
            window.addEventListener("mouseup", this.screen.onMouseUp);
            window.addEventListener("keydown", this.onKeydown);
            document.addEventListener("fullscreenchange", this.onFullscreenChange);
            document.addEventListener("webkitfullscreenchange", this.onWebkitFullscreenChange);
            document.getElementById("tektite-screen-body").addEventListener
            (
                "scroll",
                () =>
                {
                    this.screen.adjustPageFooterPosition();
                    this.screen.adjustDownPageLinkDirection();
                    if (document.getElementById("tektite-screen-body").scrollTop <= 0)
                    {
                        this.screen.update?.("scroll");
                    }
                }
            );
            this.screen.header.onLoad(this.screen);
            if (undefined === this.updateTimer)
            {
                this.updateTimer = setInterval
                (
                    () => this.screen.update?.("timer"),
                    360
                );
            }
            if (undefined === this.updateHighResolutionTimer)
            {
                this.updateHighResolutionTimer = setInterval
                (
                    () => this.screen.update?.("high-resolution-timer"),
                    36
                );
            }
            window.onpopstate = () => this.params.showPage(location.href);
        };
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(params: TektiteParams<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Tektite(params);
    export const makePercentString = (percent: number) =>
        percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
}
