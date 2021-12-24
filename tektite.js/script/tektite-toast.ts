import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
export module Toast
{
    export interface Type
    {
        dom: HTMLDivElement;
        timer: number | null;
        hide: ()  => Promise<unknown>;
    }
    export const make =
    (
        data:
        {
            content: minamo.dom.Source,
            backwardOperator?: minamo.dom.Source,
            forwardOperator?: minamo.dom.Source,
            isWideContent?: boolean,
            wait?: number,
        }
    ): Type =>
    {
        const dom = Tektite.$make(HTMLDivElement)
        ({
            tag: "div",
            className: "item slide-up-in",
            children: data.isWideContent ?
            [
                data.backwardOperator,
                data.content,
                data.forwardOperator,
            ].filter(i => undefined !== i):
            [
                data.backwardOperator ?? Tektite.$span("dummy")([]),
                data.content,
                data.forwardOperator ?? Tektite.$span("dummy")([]),
            ],
        });
        const hideRaw = async (className: string, wait: number) =>
        {
            if (null !== result.timer)
            {
                clearTimeout(result.timer);
                result.timer = null;
            }
            if (dom.parentElement)
            {
                dom.classList.remove("slide-up-in");
                dom.classList.add(className);
                await minamo.core.timeout(wait);
                minamo.dom.remove(dom);
                // // 以下は Safari での CSS バグをクリアする為の細工。本質的には必要の無い呼び出し。
                // if (document.getElementById("tektite-screen-toast").getElementsByClassName("item").length <= 0)
                // {
                //     await minamo.core.timeout(10);
                //     updateWindow("operate");
                // }
            }
        };
        const wait = data.wait ?? 5000;
        const result =
        {
            dom,
            timer: 0 < wait ? setTimeout(() => hideRaw("slow-slide-down-out", 500), wait): null,
            hide: async () => await hideRaw("slide-down-out", 250),
        };
        document.getElementById("tektite-screen-toast").appendChild(dom);
        setTimeout(() => dom.classList.remove("slide-up-in"), 250);
        return result;
    };
    let latestPrimaryToast: Type;
    export const makePrimary =
    (
        data:
        {
            content: minamo.dom.Source,
            backwardOperator?: minamo.dom.Source,
            forwardOperator?: minamo.dom.Source,
            wait?: number,
        }
    ): Type =>
    {
        if (latestPrimaryToast)
        {
            latestPrimaryToast.hide();
        }
        return latestPrimaryToast = make(data);
    };
}
