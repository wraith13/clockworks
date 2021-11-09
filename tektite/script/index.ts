import { minamo } from "../../script/minamo.js";
import { Fullscreen as FullscreenModule } from "./fullscreen";
import { Screen as ScreenModule } from "./screen";
import { Toast as ToastModule } from "./toast";
import { Header as HeaderModule } from "./header";
export module Tektite
{
    export type HeaderSegmentSource<PageParams, IconKeyType> = HeaderModule.SegmentSource<PageParams, IconKeyType>;
    export type HeaderSource<PageParams, IconKeyType> = HeaderModule.Source<PageParams, IconKeyType>;
    export interface ScreenSource<PageParams, IconKeyType>
    {
        className: string;
        header: HeaderSource<PageParams, IconKeyType>;
        body: minamo.dom.Source;
    }
    export interface TektiteParams<PageParams, IconKeyType>
    {
        showUrl: (data: PageParams) => Promise<unknown>;
        loadSvgOrCache: (key: IconKeyType) => Promise<SVGElement>;
    }
    export class Tektite<PageParams, IconKeyType>
    {
        constructor(public params: TektiteParams<PageParams, IconKeyType>)
        {
        }
        public fullscreen = FullscreenModule;
        public screen = ScreenModule;
        // public Header = HeaderModule;
        public toast = ToastModule;
        public onWebkitFullscreenChange = (_event: Event) =>
        {
            if (0 <= navigator.userAgent.indexOf("iPad") || (0 <= navigator.userAgent.indexOf("Macintosh") && "ontouchend" in document))
            {
                document.body.classList.toggle("fxxking-ipad-fullscreen", this.fullscreen.element());
            }
        };
        public screenFlash = () =>
        {
            document.body.classList.add("flash");
            setTimeout(() => document.body.classList.remove("flash"), 1500);
        };
        }
    export const make = <PageParams, IconKeyType>(params: TektiteParams<PageParams, IconKeyType>) =>
        new Tektite(params);
}
