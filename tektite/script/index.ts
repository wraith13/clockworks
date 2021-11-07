import { minamo } from "../../script/minamo.js";
import { Fullscreen as FullscreenModule } from "./fullscreen";
import { Header as HeaderModule } from "./header";
import { Toast as ToastModule } from "./toast";
export module Tektite
{
    export const Fullscreen = FullscreenModule;
    // export const Header = HeaderModule;
    export type HeaderSegmentSource<PageParams, IconKeyType> = HeaderModule.SegmentSource<PageParams, IconKeyType>;
    export type HeaderSource<PageParams, IconKeyType> = HeaderModule.Source<PageParams, IconKeyType>;
    export interface ScreenSource<PageParams, IconKeyType>
    {
        className: string;
        header: HeaderSource<PageParams, IconKeyType>;
        body: minamo.dom.Source;
    }
    export const Toast = ToastModule;
    export const onWebkitFullscreenChange = (_event: Event) =>
    {
        if (0 <= navigator.userAgent.indexOf("iPad") || (0 <= navigator.userAgent.indexOf("Macintosh") && "ontouchend" in document))
        {
            document.body.classList.toggle("fxxking-ipad-fullscreen", Tektite.Fullscreen.element());
        }
    };
    export const screenFlash = () =>
    {
        document.body.classList.add("flash");
        setTimeout(() => document.body.classList.remove("flash"), 1500);
    };
}
