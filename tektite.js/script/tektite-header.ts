import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { Screen } from "./tektite-screen";
export module Header
{
    export const elementId = "tektite-screen-header";
    export const progressBarClassName = "tektite-progress-bar";
    export const domSource =
    {
        tag: "header",
        id: elementId,
        className: "tektite-segmented",
    };
    export interface SegmentSource<PageParams, IconKeyType>
    {
        icon: IconKeyType;
        title: string;
        href?: PageParams;
        menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
    }
    export interface Source<PageParams, IconKeyType>
    {
        items: SegmentSource<PageParams, IconKeyType>[];
        menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
        operator?: minamo.dom.Source;
        parent?: PageParams;
    }
    export class Header<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        getElement = () => document.getElementById(elementId) as HTMLDivElement;
        getProgressBarElement = () => this.getElement().getElementsByClassName(progressBarClassName)[0] as HTMLDivElement;
        public onLoad = (screen: Screen.Screen<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
            this.getElement().addEventListener
            (
                'click',
                async () => await screen.scrollToOffset(document.getElementById("tektite-screen-body"), 0)
            );
        public setColor = (color: string | null) =>
            minamo.dom.setStyleProperty(this.getElement(), "backgroundColor", color ?? "");
        public resetProgress = () =>
        {
            const progressBar = this.getProgressBarElement();
            minamo.dom.setStyleProperty(progressBar, "width", "0%");
            minamo.dom.setStyleProperty(progressBar, "borderRightWidth", "0px");
        }
        public setProgress = (percent: null | number, color?: string) =>
        {
            if (null !== percent)
            {
                const progressBar = this.getProgressBarElement();
                if (color)
                {
                    minamo.dom.setStyleProperty(progressBar, "backgroundColor", color);
                }
                const percentString = Tektite.makePercentString(percent);
                minamo.dom.setStyleProperty(progressBar, "width", percentString);
                minamo.dom.setStyleProperty(progressBar, "borderRightWidth", "1px");
            }
            else
            {
                this.resetProgress();
            }
        };
        getLastSegmentClass = (ix: number, items: SegmentSource<PageParams, IconKeyType>[]) =>
            [
                ix === 0 ? "tektite-first-segment": undefined,
                ix === items.length -1 ? "tektite-last-segment": undefined,
            ]
            .filter(i => undefined !== i)
            .join(" ");
        segmented = async (data: Source<PageParams, IconKeyType>) =>
        [
            Tektite.$div(progressBarClassName)([]),
            (
                await Promise.all
                (
                    data.items
                    .filter(i => i)
                    .map
                    (
                        async (item, ix, list) =>
                            (item.href && this.linkSegment(item, this.getLastSegmentClass(ix, list))) ||
                            (item.menu && this.popupSegment(item, this.getLastSegmentClass(ix, list))) ||
                            (true && this.labelSegment(item, this.getLastSegmentClass(ix, list)))
                    )
                )
            ).reduce((a, b) => (a as any[]).concat(b), []),
            data.parent ?
                {
                    tag: "button",
                    className: "tektite-icon-button tektite-close-button",
                    children:
                    [
                        await this.tektite.loadSvgOrCache("tektite-cross-icon"),
                    ],
                    onclick: (event: MouseEvent) =>
                    {
                        event.stopPropagation();
                        // if ("" !== getFilterText() || getHeaderElement().classList.contains("header-operator-has-focus"))
                        // {
                        //     setFilterText("");
                        //     blurFilterInputElement();
                        // }
                        // else
                        // {
                            this.tektite.params.showUrl(data.parent);
                        // }
                    },
                }:
                [],
            data.menu ? await this.tektite.menu.button(data.menu): [],
            data.operator ? Tektite.$div("header-operator")(data.operator): [],
        ];
        getCloseButton = () => minamo.dom.getButtonsByClassName(this.getElement(), "tektite-close-button")[0];
        segmentCore = async (item: SegmentSource<PageParams, IconKeyType>) =>
        [
            Tektite.$div("icon")(await this.tektite.params.loadSvgOrCache(item.icon)),
            Tektite.$div("tektite-segment-title")(item.title),
        ];
        labelSegment = async (item: SegmentSource<PageParams, IconKeyType>, className: string = "") =>
        Tektite.$div(`tektite-segment label-tektite-segment ${className}`)(await this.segmentCore(item));
        linkSegment = async (item: SegmentSource<PageParams, IconKeyType>, className: string = "") => this.tektite.internalLink
        ({
            className: `tektite-segment ${className}`,
            href: item.href,
            children: await this.segmentCore(item),
        });
        popupSegment = async (item: SegmentSource<PageParams, IconKeyType>, className: string = "") =>
        {
            let cover: { dom: HTMLDivElement, close: () => Promise<unknown> };
            const close = () =>
            {
                popup.classList.remove("show");
                cover = null;
            };
            const popup = Tektite.$make(HTMLDivElement)
            ({
                tag: "div",
                className: "tektite-menu-popup tektite-segment-popup",
                children: "function" !== typeof item.menu ? item.menu: [ ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("tektite-menu-popup.click!");
                    cover?.close();
                    close();
                },
            });
            const segment = Tektite.$make(HTMLDivElement)
            ({
                tag: "div",
                className: `tektite-segment ${className}`,
                children: await this.segmentCore(item),
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-button.click!");
                    if ("function" === typeof item.menu)
                    {
                        minamo.dom.replaceChildren(popup, await item.menu());
                    }
                    popup.classList.add("show");
                    //popup.style.height = `${popup.offsetHeight -2}px`;
                    popup.style.width = `${popup.offsetWidth -2}px`;
                    popup.style.top = `${segment.offsetTop +segment.offsetHeight}px`;
                    popup.style.left = `${Math.max(segment.offsetLeft, 4)}px`;
                    cover = this.tektite.screen.cover
                    ({
                        onclick: close,
                    });
                },
            });
            return [ segment, popup, ];
        };
        public replace = async (header: Tektite.HeaderSource<PageParams, IconKeyType>) => minamo.dom.replaceChildren
        (
            this.getElement(),
            await this.segmented(header)
        );
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Header(tektite);
}
