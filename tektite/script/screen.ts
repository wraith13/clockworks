import { minamo } from "../../script/minamo.js";
import { Tektite } from ".";
export module Screen
{
    const $make = minamo.dom.make;
    export class Screen<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        getElement = () => document.getElementById("screen") as HTMLDivElement;
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
            document.getElementById("screen-header").addEventListener
            (
                'click',
                async () => await this.scrollToOffset(document.getElementById("screen-body"), 0)
            );
            document.getElementById("screen-body").addEventListener
            (
                "scroll",
                () =>
                {
                    this.adjustPageFooterPosition();
                    this.adjustDownPageLinkDirection();
                    if (document.getElementById("screen-body").scrollTop <= 0)
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
                    console.log("screen-cover.click!");
                    dom.onclick = undefined;
                    data.onclick();
                    close();
                }
            };
            const dom = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "screen-cover fade-in",
                children: data.children,
                onclick,
            });
            // dom.addEventListener("mousedown", onclick);
            const close = async () =>
            {
                dom.classList.remove("fade-in");
                dom.classList.add("fade-out");
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
        public getScreenCoverList = () => minamo.dom.getDivsByClassName(document, "screen-cover");
        public getScreenCover = () => this.getScreenCoverList().filter((_i, ix, list) => (ix +1) === list.length)[0];
        public hasScreenCover = () => 0 < this.getScreenCoverList().length;
        public popup =
        (
            data:
            {
                className?: string,
                children: minamo.dom.Source,
                onClose?: () => Promise<unknown>
            }
        ) =>
        {
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
                    //minamo.dom.remove(dom);
                },
            });
            const result =
            {
                dom,
                close,
            };
            return result;
        };
        lastMouseDownTarget: EventTarget = null;
        public onMouseDown = (event: MouseEvent) => this.lastMouseDownTarget = event.target;
        public onMouseUp = (_evnet: MouseEvent) => setTimeout(this.clearLastMouseDownTarget, 10);
        public clearLastMouseDownTarget = () => this.lastMouseDownTarget = null;
        public flash = () =>
        {
            document.body.classList.add("flash");
            setTimeout(() => document.body.classList.remove("flash"), 1500);
        };
        replaceBody = (body: minamo.dom.Source) => minamo.dom.replaceChildren
        (
            document.getElementById("screen-body"),
            body
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
        getBodyScrollTop = (topChild = minamo.dom.getDivsByClassName(document, "primary-page")[0]) =>
        {
            const body = document.getElementById("screen-body");
            const primaryPageOffsetTop = Math.min(topChild.offsetTop -body.offsetTop, body.scrollHeight -body.clientHeight);
            return body.scrollTop -primaryPageOffsetTop;
        };
        isStrictShowPrimaryPage = () => 0 === this.getBodyScrollTop();
        downPageLink = async () =>
        ({
            tag: "div",
            className: "down-page-link icon",
            children: await this.tektite.params.loadSvgOrCache("down-triangle-icon"),
            onclick: async () =>
            {
                if (this.isStrictShowPrimaryPage())
                {
                    await this.scrollToElement(minamo.dom.getDivsByClassName(document, "trail-page")[0]);
                }
                else
                {
                    await this.scrollToElement(minamo.dom.getDivsByClassName(document, "primary-page")[0]);
                }
            },
        });
        adjustPageFooterPosition = () =>
        {
            const primaryPage = document.getElementsByClassName("primary-page")[0];
            if (primaryPage)
            {
                const body = document.getElementById("screen-body");
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
            Tektite.resetScreenBarProgress();
            this.setClass(screen.className);
            this.tektite.header.replace(screen.header);
            this.replaceBody(screen.body);
            this.adjustPageFooterPosition();
            this.adjustDownPageLinkDirection();
        };
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Screen(tektite);
}
