import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { Header } from "./tektite-header";
export module Screen
{
    const $make = minamo.dom.make;
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
    export class Screen<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        public header = Header.make(this.tektite);
        getElement = () => document.getElementById("tektite-screen") as HTMLDivElement;
        updateWindow: (event: Tektite.UpdateWindowEventEype) => unknown;
        private updateWindowTimer = undefined;
        private updateWindowHighResolutionTimer = undefined;
        onWindowFocus = () =>
        {
            this.updateWindow?.("focus");
        };
        onWindowBlur = () =>
        {
            this.updateWindow?.("blur");
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
                        this.updateWindow?.("storage");
                    }
                },
                50,
            );
        };
        public onLoad = () =>
        {
            window.addEventListener("focus", this.onWindowFocus);
            window.addEventListener("blur", this.onWindowBlur);
            window.addEventListener("storage", this.onUpdateStorage);
            this.header.onLoad(this);
            document.getElementById("tektite-screen-body").addEventListener
            (
                "scroll",
                () =>
                {
                    this.adjustPageFooterPosition();
                    this.adjustDownPageLinkDirection();
                    if (document.getElementById("tektite-screen-body").scrollTop <= 0)
                    {
                        this.updateWindow?.("scroll");
                    }
                }
            );
            if (undefined === this.updateWindowTimer)
            {
                this.updateWindowTimer = setInterval
                (
                    () => this.updateWindow?.("timer"),
                    360
                );
            }
            if (undefined === this.updateWindowHighResolutionTimer)
            {
                this.updateWindowHighResolutionTimer = setInterval
                (
                    () => this.updateWindow?.("high-resolution-timer"),
                    36
                );
            }
        };
        public cover = (data: { children?: minamo.dom.Source, onclick: () => unknown, }) =>
        {
            const onclick = async () =>
            {
                if (dom === (this.lastMouseDownTarget ?? dom))
                {
                    console.log("tektite-screen-cover.click!");
                    dom.onclick = undefined;
                    data.onclick();
                    close();
                }
            };
            const dom = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "tektite-screen-cover tektite-fade-in",
                children: data.children,
                onclick,
            });
            // dom.addEventListener("mousedown", onclick);
            const close = async () =>
            {
                dom.classList.remove("tektite-fade-in");
                dom.classList.add("tektite-fade-out");
                await minamo.core.timeout(500);
                minamo.dom.remove(dom);
            };
            minamo.dom.appendChildren(this.getElement(), dom);
            const result =
            {
                dom,
                close,
            };
            return result;
        };
        public getScreenCoverList = () => minamo.dom.getDivsByClassName(document, "tektite-screen-cover");
        public getScreenCover = () => this.getScreenCoverList().filter((_i, ix, list) => (ix +1) === list.length)[0];
        public hasScreenCover = () => 0 < this.getScreenCoverList().length;
        // public popup =
        // (
        //     data:
        //     {
        //         className?: string,
        //         children: minamo.dom.Source,
        //         onClose?: () => Promise<unknown>
        //     }
        // ) =>
        // {
        //     const dom = $make(HTMLDivElement)
        //     ({
        //         tag: "div",
        //         className: `popup locale-parallel-off ${data.className ?? ""}`,
        //         children: data.children,
        //         onclick: async (event: MouseEvent) =>
        //         {
        //             console.log("popup.click!");
        //             event.stopPropagation();
        //             //getScreenCoverList.forEach(i => i.click());
        //         },
        //     });
        //     const close = async () =>
        //     {
        //         await data.onClose?.();
        //         screenCover.close();
        //     };
        //     // minamo.dom.appendChildren(document.body, dom);
        //     const screenCover = this.cover
        //     ({
        //         children:
        //         [
        //             dom,
        //             { tag: "div", }, // レイアウト調整用のダミー要素 ( この調整がないとポップアップが小さく且つ入力要素がある場合に iPad でキーボードの下に dom が隠れてしまう。 )
        //         ],
        //         onclick: async () =>
        //         {
        //             await data.onClose?.();
        //             //minamo.dom.remove(dom);
        //         },
        //     });
        //     const result =
        //     {
        //         dom,
        //         close,
        //     };
        //     return result;
        // };
        public popup = async <ResultType>(builder: PopupArguments<ResultType> | ((instance: PopupInstance<ResultType>) => Promise<PopupArguments<ResultType>>)) => await new Promise<ResultType>
        (
            async resolve =>
            {
                const instance =
                {
                    set: (value: ResultType) =>
                    {
                        result = value;
                        return instance;
                    },
                    close: () =>
                    {
                        ui.close();
                        return instance;
                    },
                    getDom: () => ui.dom,
                };
                const data = "function" === typeof builder ? await builder(instance): builder;
                let result: ResultType | null = data.initialValue ?? null;
                const dom = $make(HTMLDivElement)
                ({
                    tag: "div",
                    className: `popup locale-parallel-off ${data.className ?? ""}`,
                    children: data.children,
                    onclick: async (event: MouseEvent) =>
                    {
                        console.log("popup.click!");
                        event.stopPropagation();
                        //getScreenCoverList.forEach(i => i.click());
                    },
                });
                const close = async () =>
                {
                    await data.onClose?.();
                    resolve(result);
                    screenCover.close();
                };
                // minamo.dom.appendChildren(document.body, dom);
                const screenCover = this.cover
                ({
                    children:
                    [
                        dom,
                        { tag: "div", }, // レイアウト調整用のダミー要素 ( この調整がないとポップアップが小さく且つ入力要素がある場合に iPad でキーボードの下に dom が隠れてしまう。 )
                    ],
                    onclick: async () =>
                    {
                        await data.onClose?.();
                        resolve(result);
                        //minamo.dom.remove(dom);
                    },
                });
                const ui =
                {
                    dom,
                    close,
                };
            }
        );
        lastMouseDownTarget: EventTarget = null;
        public onMouseDown = (event: MouseEvent) => this.lastMouseDownTarget = event.target;
        public onMouseUp = (_evnet: MouseEvent) => setTimeout(this.clearLastMouseDownTarget, 10);
        public clearLastMouseDownTarget = () => this.lastMouseDownTarget = null;
        public flash = () =>
        {
            document.body.classList.add("tektite-flash");
            setTimeout(() => document.body.classList.remove("tektite-flash"), 1500);
        };
        replaceBody = async (body: Tektite.PageSource | minamo.dom.Source) => minamo.dom.replaceChildren
        (
            document.getElementById("tektite-screen-body"),
            await this.makeBody(body)
        );
        scrollToOffset = async (target: HTMLElement, offset: number) =>
        {
            let scrollTop = target.scrollTop;
            let diff = offset -scrollTop;
            for(let i = 0; i < 25; ++i)
            {
                diff *= 0.8;
                target.scrollTo(0, offset -diff);
                await minamo.core.timeout(10);
            }
            target.scrollTo(0, offset);
        };
        scrollToElement = async (target: HTMLElement) =>
        {
            const parent = target.parentElement;
            const targetOffsetTop = Math.min(target.offsetTop -parent.offsetTop, parent.scrollHeight -parent.clientHeight);
            await this.scrollToOffset(parent, targetOffsetTop);
        };
        getBodyScrollTop = (topChild = minamo.dom.getDivsByClassName(document, "tektite-primary-page")[0]) =>
        {
            const body = document.getElementById("tektite-screen-body");
            const primaryPageOffsetTop = Math.min(topChild.offsetTop -body.offsetTop, body.scrollHeight -body.clientHeight);
            return body.scrollTop -primaryPageOffsetTop;
        };
        isStrictShowPrimaryPage = () => 0 === this.getBodyScrollTop();
        downPageLink = async () =>
        ({
            tag: "div",
            className: "down-page-link icon",
            children: await this.tektite.loadSvgOrCache("tektite-down-triangle-icon"),
            onclick: async () =>
            {
                if (this.isStrictShowPrimaryPage())
                {
                    await this.scrollToElement(minamo.dom.getDivsByClassName(document, "tektite-trail-page")[0]);
                }
                else
                {
                    await this.scrollToElement(minamo.dom.getDivsByClassName(document, "tektite-primary-page")[0]);
                }
            },
        });
        adjustPageFooterPosition = () =>
        {
            const primaryPage = document.getElementsByClassName("tektite-primary-page")[0];
            if (primaryPage)
            {
                const body = document.getElementById("tektite-screen-body");
                const delta = Math.max(primaryPage.clientHeight -(body.clientHeight +this.getBodyScrollTop()), 0);
                minamo.dom.getDivsByClassName(document, "page-footer")
                    .forEach(i => minamo.dom.setStyleProperty(i, "paddingBottom", `calc(1rem + ${delta}px)`));
                // minamo.dom.getDivsByClassName(document, "down-page-link")
                //     .forEach(i => minamo.dom.setStyleProperty(i, "bottom", `calc(1rem + ${delta}px)`));
            }
        };
        adjustDownPageLinkDirection = () =>
            minamo.dom.getDivsByClassName(document, "down-page-link")
                .forEach(i => minamo.dom.toggleCSSClass(i, "reverse-down-page-link", ! this.isStrictShowPrimaryPage()));
        public lastScreenName?: string;
        public setClass = (className?: string) =>
        {
            if (undefined !== this.lastScreenName)
            {
                this.getElement().classList.remove(this.lastScreenName);
            }
            if (undefined !== className)
            {
                this.getElement().classList.add(className);
            }
            this.lastScreenName = className;
        }
        public show = async (screen: Tektite.ScreenSource<PageParams, IconKeyType>, updateWindow?: (event: Tektite.UpdateWindowEventEype) => unknown) =>
        {
            if (undefined !== updateWindow)
            {
                this.updateWindow = updateWindow;
            }
            else
            {
                this.updateWindow = async (event: Tektite.UpdateWindowEventEype) =>
                {
                    if ("storage" === event || "operate" === event)
                    {
                        await this.tektite.reload();
                    }
                };
            }
            this.resetProgress();
            this.setClass(screen.className);
            this.header.replace(screen.header);
            await this.replaceBody(screen.body);
            this.adjustPageFooterPosition();
            this.adjustDownPageLinkDirection();
        };
        public makeBody = async (body: Tektite.PageSource | minamo.dom.Source) =>
            undefined === (body as Tektite.PageSource).primary ?
                body as minamo.dom.Source:
                await this.makePage((body as Tektite.PageSource).primary, (body as Tektite.PageSource).trail);
        public makePage = async (primary: Tektite.PrimaryPageSource | minamo.dom.Source, trail?: minamo.dom.Source) =>
        [
            Tektite.$div("tektite-primary-page")
            ([
                Tektite.$div("page-body")
                (
                    Tektite.$div("main-panel")
                    (
                        undefined === (primary as Tektite.PrimaryPageSource).body ?
                            primary as minamo.dom.Source:
                            (primary as Tektite.PrimaryPageSource).body
                    )
                ),
                Tektite.$div("page-footer")
                (
                    undefined !== (primary as Tektite.PrimaryPageSource).footer ?
                        (primary as Tektite.PrimaryPageSource).footer:
                        (
                            undefined !== trail ?
                            await this.downPageLink():
                            []
                        )
                ),
            ]),
            undefined !== trail ?
                Tektite.$div("tektite-trail-page")(trail):
                [],
        ];
        public setBodyColor = (color: string) =>
        {
            minamo.dom.setStyleProperty(document.body, "backgroundColor", `${color}E8`);
            minamo.dom.setProperty("#tektite-theme-color", "content", color);
        };
        public setFoundationColor = (color: string | null) =>
                minamo.dom.setStyleProperty("#tektite-foundation", "backgroundColor", color ?? "");
        latestColor: string | null;
        public setBackgroundColor = (color: string | null) =>
        {
            this.latestColor = color;
            if (document.body.classList.contains("tektite-style-classic"))
            {
                this.header.setColor(color);
                this.setFoundationColor(null);
            }
            if (document.body.classList.contains("tektite-style-modern"))
            {
                this.setFoundationColor(color);
                this.header.setColor(null);
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
            this.header.resetProgress();
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
                const percentString = Tektite.makePercentString(percent);
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
                this.resetScreenBarProgress();
            }
            if (null !== percent && "header" === progressBarStyle)
            {
                this.header.setProgress(percent, color);
            }
            else
            {
                this.header.resetProgress();
            }
        };
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Screen(tektite);
}
