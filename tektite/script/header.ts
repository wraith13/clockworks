import { minamo } from "../../script/minamo.js";
import { Tektite } from ".";
export module Header
{
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
    const $make = minamo.dom.make;
    const $tag = (tag: string) => (className: string | minamo.dom.AlphaObjectSource) => (children: minamo.dom.Source) =>
        "string" === typeof className ?
        {
            tag,
            children,
            className,
        }:
        Object.assign
        (
            {
                tag,
                children,
            },
            className,
        );
    const $div = $tag("div");
    // const $span = $tag("span");
    // const labelSpan = $span("label");
    export class Header<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        getElement = () => document.getElementById("screen-header") as HTMLDivElement;
        getLastSegmentClass = (ix: number, items: SegmentSource<PageParams, IconKeyType>[]) =>
            [
                ix === 0 ? "first-segment": undefined,
                ix === items.length -1 ? "last-segment": undefined,
            ]
            .filter(i => undefined !== i)
            .join(" ");
        segmented = async (data: Source<PageParams, IconKeyType>) =>
        [
            $div("progress-bar")([]),
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
                    className: "icon-button close-button",
                    children:
                    [
                        await this.tektite.params.loadSvgOrCache("cross-icon"),
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
            data.operator ? $div("header-operator")(data.operator): [],
        ];
        getCloseButton = () => minamo.dom.getButtonsByClassName(this.getElement(), "close-button")[0];
        segmentCore = async (item: SegmentSource<PageParams, IconKeyType>) =>
        [
            $div("icon")(await this.tektite.params.loadSvgOrCache(item.icon)),
            $div("segment-title")(item.title),
        ];
        labelSegment = async (item: SegmentSource<PageParams, IconKeyType>, className: string = "") =>
            $div(`segment label-segment ${className}`)(await this.segmentCore(item));
        linkSegment = async (item: SegmentSource<PageParams, IconKeyType>, className: string = "") => this.tektite.internalLink
        ({
            className: `segment ${className}`,
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
            const popup = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "menu-popup segment-popup",
                children: "function" !== typeof item.menu ? item.menu: [ ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-popup.click!");
                    cover?.close();
                    close();
                },
            });
            const segment = $make(HTMLDivElement)
            ({
                tag: "div",
                className: `segment ${className}`,
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
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Header(tektite);
}
