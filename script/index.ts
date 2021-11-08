// import { minamo } from "./minamo.js";
import { Tektite } from "../tektite/script";
import { Locale } from "./locale";
// import { Type } from "./type";
import { Render } from "./render";
import { Storage } from "./storage";
// import { Domain } from "./domain";
// import config from "../resource/config.json";
export module Clockworks
{
    // export type ApplicationType = keyof typeof applicationList;
    // export const applicationIdList = Object.keys(applicationList);
    export const start = async () =>
    {
        console.log("start!!!");
        Locale.setLocale(Storage.Settings.get().locale);
        window.onpopstate = () => Render.showPage();
        window.addEventListener("resize", Render.onWindowResize);
        window.addEventListener("focus", Render.onWindowFocus);
        window.addEventListener("blur", Render.onWindowBlur);
        window.addEventListener("storage", Render.onUpdateStorage);
        window.addEventListener("compositionstart", Render.onCompositionStart);
        window.addEventListener("compositionend", Render.onCompositionEnd);
        window.addEventListener("keydown", Render.onKeydown);
        document.getElementById("screen-header").addEventListener
        (
            'click',
            async () => await Render.scrollToOffset(document.getElementById("screen-body"), 0)
        );
        window.addEventListener("mousemove", Render.onMouseMove);
        window.addEventListener("mousedown", Tektite.Screen.onMouseDown);
        window.addEventListener("mouseup", Tektite.Screen.onMouseUp);
        document.addEventListener("fullscreenchange", Render.onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", Render.onWebkitFullscreenChange);
        window.matchMedia("(prefers-color-scheme: dark)").addListener(Render.updateStyle);
        Render.updateStyle();
        Render.updateProgressBarStyle();
        await Render.showPage();
    };
}
