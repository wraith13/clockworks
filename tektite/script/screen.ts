import { minamo } from "../../script/minamo.js";
export module Screen
{
    const $make = minamo.dom.make;
    export const cover = (data: { children?: minamo.dom.Source, onclick: () => unknown, }) =>
    {
        const onclick = async () =>
        {
            if (dom === (lastMouseDownTarget ?? dom))
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
    export const getScreenCoverList = () => minamo.dom.getDivsByClassName(document, "screen-cover");
    export const getScreenCover = () => getScreenCoverList().filter((_i, ix, list) => (ix +1) === list.length)[0];
    export const hasScreenCover = () => 0 < getScreenCoverList().length;
    export const popup =
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
        const screenCover = cover
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
    let lastMouseDownTarget: EventTarget = null;
    export const onMouseDown = (event: MouseEvent) => lastMouseDownTarget = event.target;
    export const onMouseUp = (_evnet: MouseEvent) => setTimeout(clearLastMouseDownTarget, 10);
    export const clearLastMouseDownTarget = () => lastMouseDownTarget = null;
}
