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
        href?: string | PageParams;
        menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
    }
    export interface Source<PageParams, IconKeyType>
    {
        items: SegmentSource<PageParams, IconKeyType>[];
        menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
        operator?: minamo.dom.Source;
        parent?: PageParams;
    }
    // export class Header<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    export class Header<T extends Tektite.ParamTypes>
    {
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        getElement = () => document.getElementById(elementId) as HTMLDivElement;
        getProgressBarElement = () => this.getElement().getElementsByClassName(progressBarClassName)[0] as HTMLDivElement;
        public onLoad = (screen: Screen.Screen<T>) =>
            this.getElement().addEventListener
            (
                'click',
                async () => await screen.scrollToOffset(minamo.core.existsOrThrow(document.getElementById("tektite-screen-body")), 0)
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
        getLastSegmentClass = (ix: number, items: SegmentSource<T["PageParams"], T["IconKeyType"]>[]) =>
            [
                ix === 0 ? "tektite-first-segment": undefined,
                ix === items.length -1 ? "tektite-last-segment": undefined,
            ]
            .filter(i => undefined !== i)
            .join(" ");
        segmented = async (data: Source<T["PageParams"], T["IconKeyType"]>) =>
        {
            const parent = data.parent;
            const result =
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
                                (item.href && this.linkSegment(item as any, this.getLastSegmentClass(ix, list))) ||
                                (item.menu && this.popupSegment(item, this.getLastSegmentClass(ix, list))) ||
                                (true && this.labelSegment(item, this.getLastSegmentClass(ix, list)))
                        )
                    )
                ).reduce((a, b) => (a as any[]).concat(b), []),
                Tektite.$div("tektite-header-operator")
                ([
                    parent ?
                    {
                        tag: "button",
                        className: "tektite-icon-button tektite-close-button",
                        children:
                        [
                            await this.tektite.loadIconOrCache("tektite-cross-icon"),
                        ],
                        onclick: (event: MouseEvent) =>
                        {
                            event.stopPropagation();
                            // if ("" !== getFilterText() || getHeaderElement().classList.contains("tektite-header-operator-has-focus"))
                            // {
                            //     setFilterText("");
                            //     blurFilterInputElement();
                            // }
                            // else
                            // {
                                this.tektite.params.showUrl(parent);
                            // }
                        },
                    }:
                    [],
                    data.menu ? await this.tektite.menu.button(data.menu): [],
                    data.operator ?? []
                ]),
            ];
            return result;
        };
        getCloseButton = () => minamo.dom.getButtonsByClassName(this.getElement(), "tektite-close-button")[0];
        segmentCore = async (item: SegmentSource<T["PageParams"], T["IconKeyType"]>) =>
        [
            Tektite.$div("tektite-icon-frame")(await this.tektite.params.loadIconOrCache(item.icon)),
            Tektite.$div("tektite-segment-title")(item.title),
        ];
        labelSegment = async (item: SegmentSource<T["PageParams"], T["IconKeyType"]>, className: string = "") =>
        Tektite.$div(`tektite-segment label-tektite-segment ${className}`)(await this.segmentCore(item));
        linkSegment = async (item: SegmentSource<T["PageParams"], T["IconKeyType"]> & { href: T["PageParams"] }, className: string = "") => this.tektite.internalLink
        ({
            className: `tektite-segment ${className}`,
            href: item.href,
            children: await this.segmentCore(item),
        });
        popupSegment = async (item: SegmentSource<T["PageParams"], T["IconKeyType"]>, className: string = "") =>
        {
            let cover: { dom: HTMLDivElement, close: () => Promise<unknown> } | null;
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
                    console.log("tektite-menu-button.click!");
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
                        parent: popup.parentElement,
                        onclick: close,
                    });
                },
            });
            return [ segment, popup, ];
        };
        public replace = async (header: Tektite.HeaderSource<T["PageParams"], T["IconKeyType"]>) => minamo.dom.replaceChildren
        (
            this.getElement(),
            await this.segmented(header)
        );
    }
    // export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
    //     new Header(tektite);
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new Header<T>(tektite);
}
