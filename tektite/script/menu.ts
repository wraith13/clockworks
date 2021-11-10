import { minamo } from "../../script/minamo.js";
import { Tektite } from "./index.js";
export module Menu
{
    const $make = minamo.dom.make;
    export class Menu<PageParams, IconKeyType>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType>)
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
                className: "menu-popup",
                children: "function" !== typeof menu ? menu: [ ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-popup.click!");
                    cover?.close();
                    close();
                },
            });
            const button = $make(HTMLButtonElement)
            ({
                tag: "button",
                className: "menu-button",
                children:
                [
                    await this.tektite.params.loadSvgOrCache("ellipsis-icon"),
                ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-button.click!");
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
        public item = (children: minamo.dom.Source, onclick?: (event: MouseEvent | TouchEvent) => unknown, className?: string) =>
        ({
            tag: "button",
            className,
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
    export const make = <PageParams, IconKeyType>(tektite: Tektite.Tektite<PageParams, IconKeyType>) =>
        new Menu(tektite);
}