import { minamo } from "../../script/minamo.js";
import { Tektite } from ".";
export module Screen
{
    const $make = minamo.dom.make;
    export class Screen<PageParams, IconKeyType>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType>)
        {
        }
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
            minamo.dom.appendChildren(document.getElementById("screen"), dom);
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
                await data?.onClose();
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
                    await data?.onClose();
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
    }
    export const make = <PageParams, IconKeyType>(tektite: Tektite.Tektite<PageParams, IconKeyType>) =>
        new Screen(tektite);
}
