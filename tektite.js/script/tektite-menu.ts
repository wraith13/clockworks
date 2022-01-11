import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index.js";
export module Menu
{
    const $make = minamo.dom.make;
    export class Menu<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        public button = async (menu: minamo.dom.Source | (() => Promise<minamo.dom.Source>)) =>
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
                className: "tektite-menu-popup",
                children: "function" !== typeof menu ? menu: [ ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("tektite-menu-popup.click!");
                    cover?.close();
                    close();
                },
            });
            const button = $make(HTMLButtonElement)
            ({
                tag: "button",
                className: "tektite-menu-button",
                children:
                [
                    await this.tektite.loadSvgOrCache("tektite-ellipsis-icon"),
                ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("tektite-menu-button.click!");
                    if ("function" === typeof menu)
                    {
                        minamo.dom.replaceChildren(popup, await menu());
                    }
                    popup.classList.add("show");
                    cover = this.tektite.screen.cover
                    ({
                        onclick: close,
                    });
                },
            });
            return [ button, popup, ];
        };
        public item = (children: minamo.dom.Source, onclick?: (event: MouseEvent | TouchEvent) => unknown, className?: string): minamo.dom.Source =>
        ({
            tag: "button",
            className: `tektite-menu-item-button ${className ?? ""}`,
            children,
            onclick,
        });
        public linkItem = (children: minamo.dom.Source, href: PageParams, className?: string) => this.item
        (
            children,
            () => this.tektite.params.showUrl(href),
            className,
        );
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
        (tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Menu(tektite);
}