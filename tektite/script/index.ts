import { minamo } from "../../script/minamo.js";
import { Fullscreen as FullscreenModule } from "./fullscreen";
import { Screen } from "./screen";
import { Toast as ToastModule } from "./toast";
import { Header } from "./header";
import { Menu } from "./menu";
export module Tektite
{
    export type HeaderSegmentSource<PageParams, IconKeyType> = Header.SegmentSource<PageParams, IconKeyType>;
    export type HeaderSource<PageParams, IconKeyType> = Header.Source<PageParams, IconKeyType>;
    export interface ScreenSource<PageParams, IconKeyType>
    {
        className: string;
        header: HeaderSource<PageParams, IconKeyType>;
        body: minamo.dom.Source;
    }
    export interface TektiteParams<PageParams, IconKeyType>
    {
        makeUrl: (args: PageParams) => string;
        showUrl: (data: PageParams) => Promise<unknown>;
        loadSvgOrCache: (key: IconKeyType | "cross-icon" | "ellipsis-icon") => Promise<SVGElement>;
    }
    export class Tektite<PageParams, IconKeyType>
    {
        constructor(public params: TektiteParams<PageParams, IconKeyType>)
        {
        }
        public fullscreen = FullscreenModule;
        public screen = Screen.make(this);
        public header = Header.make(this);
        public menu = Menu.make(this);
        public toast = ToastModule;
        internalLink = (data: { className?: string, href: PageParams, children: minamo.dom.Source}) =>
        ({
            tag: "a",
            className: data.className,
            href: this.params.makeUrl(data.href),
            children: data.children,
            onclick: (_event: MouseEvent) =>
            {
                // event.stopPropagation();
                this.params.showUrl(data.href);
                return false;
            }
        });
        externalLink = (data: { className?: string, href: string, children: minamo.dom.Source}) =>
        ({
            tag: "a",
            className: data.className,
            href: data.href,
            children: data.children,
        });
        public onWebkitFullscreenChange = (_event: Event) =>
        {
            if (0 <= navigator.userAgent.indexOf("iPad") || (0 <= navigator.userAgent.indexOf("Macintosh") && "ontouchend" in document))
            {
                document.body.classList.toggle("fxxking-ipad-fullscreen", this.fullscreen.element());
            }
        };
    }
    export const make = <PageParams, IconKeyType>(params: TektiteParams<PageParams, IconKeyType>) =>
        new Tektite(params);
}
