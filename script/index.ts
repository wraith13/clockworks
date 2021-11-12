// import { minamo } from "./minamo.js";
import { Tektite } from "../tektite/script";
import { Type } from "./type";
import { Render } from "./render";
import { Resource } from "./render/resource";
import { Storage } from "./storage";
import { Domain } from "./domain";
import localeEn from "../resource/lang.en.json";
import localeJa from "../resource/lang.ja.json";
// import config from "../resource/config.json";
export module Clockworks
{
    // export type ApplicationType = keyof typeof applicationList;
    // export const applicationIdList = Object.keys(applicationList);
    export const localeMaster =
    {
        en: localeEn,
        ja: localeJa,
    };
    export type LocaleKeyType =
        keyof typeof localeEn &
        keyof typeof localeJa;
    export type LocaleType = keyof typeof localeMaster;
    export const tektite = Tektite.make<Type.PageParams, Resource.KeyType, typeof localeEn | typeof localeJa, typeof localeMaster>
    ({
        makeUrl: Domain.makeUrl,
        showUrl: Render.showUrl,
        loadSvgOrCache: Resource.loadSvgOrCache,
        localeMaster,
    });
    export const localeMap = (key: LocaleKeyType) => tektite.locale.map(key);
    export const localeParallel = (key: LocaleKeyType) => tektite.locale.parallel(key);
    export const start = async (params:{ buildTimestamp: string, }) =>
    {
        console.log(`start!!!: ${JSON.stringify(params)}`);
        tektite.locale.setLocale(Storage.Settings.get().locale);
        window.onpopstate = () => Render.showPage();
        window.addEventListener("resize", Render.onWindowResize);
        window.addEventListener("focus", Render.onWindowFocus);
        window.addEventListener("blur", Render.onWindowBlur);
        window.addEventListener("storage", Render.onUpdateStorage);
        window.addEventListener("keydown", Render.onKeydown);
        document.getElementById("screen-header").addEventListener
        (
            'click',
            async () => await Render.scrollToOffset(document.getElementById("screen-body"), 0)
        );
        window.addEventListener("mousemove", Render.onMouseMove);
        window.addEventListener("mousedown", tektite.screen.onMouseDown);
        window.addEventListener("mouseup", tektite.screen.onMouseUp);
        document.addEventListener("fullscreenchange", Render.onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", Render.onWebkitFullscreenChange);
        window.matchMedia("(prefers-color-scheme: dark)").addListener(Render.updateStyle);
        Render.updateStyle();
        Render.updateProgressBarStyle();
        await Render.showPage();
    };
}
