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
    // export class Toast<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    export class Toast<T extends Tektite.ParamTypes>
    {
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        element: HTMLDivElement | null = null;
        public make =
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
                className: "tektite-item tektite-slide-up-in",
                children: data.isWideContent ?
                [
                    data.backwardOperator,
                    data.content,
                    data.forwardOperator,
                ].filter(i => undefined !== i):
                [
                    data.backwardOperator ?? Tektite.$span("tektite-dummy")([]),
                    data.content,
                    data.forwardOperator ?? Tektite.$span("tektite-dummy")([]),
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
                    dom.classList.remove("tektite-slide-up-in");
                    dom.classList.add(className);
                    await minamo.core.timeout(wait);
                    minamo.dom.remove(dom);
                    // // 以下は Safari での CSS バグをクリアする為の細工。本質的には必要の無い呼び出し。
                    // if (this.element.getElementsByClassName("item").length <= 0)
                    // {
                    //     await minamo.core.timeout(10);
                    //     tektite.screen.update("operate");
                    // }
                }
            };
            const wait = data.wait ?? 5000;
            const result =
            {
                dom,
                timer: 0 < wait ? setTimeout(() => hideRaw("tektite-slow-slide-down-out", 500), wait): null,
                hide: async () => await hideRaw("tektite-slide-down-out", 250),
            };
            minamo.core.existsOrThrow(this.element).appendChild(dom);
            setTimeout(() => dom.classList.remove("tektite-slide-up-in"), 250);
            return result;
        };
        public onLoad = () =>
        {
            return this.element = minamo.dom.make(HTMLDivElement)
            ({
                tag: "div",
                className: "tektite-screen-toast",
            });
        };
    }
    // export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
    //     new Toast(tektite);
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new Toast<T>(tektite);
}
