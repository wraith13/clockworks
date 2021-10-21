// import { minamo } from "../../script/minamo.js";
import { Fullscreen as FullscreenModule } from "./fullscreen";
export module Tektite
{
    export const Fullscreen = FullscreenModule;
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
