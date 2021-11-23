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
    export const localeMap = (key: LocaleKeyType) => tektite.locale.map(key);
    export const localeParallel = (key: LocaleKeyType) => tektite.locale.parallel(key);
    export const start = async (params:{ buildTimestamp: string, }) =>
    {
        console.log(`start timestamp: ${new Date()}`);
        console.log(`${JSON.stringify(params)}`);
        tektite.locale.setLocale(Storage.Settings.get().locale);
        tektite.onLoad();
        window.onpopstate = () => Render.showPage();
        window.addEventListener("resize", Render.onWindowResize);
        window.addEventListener("keydown", Render.onKeydown);
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

export const tektite = Tektite.make<Type.PageParams, Resource.KeyType, typeof localeEn | typeof localeJa, typeof Clockworks.localeMaster>
({
    makeUrl: Domain.makeUrl,
    showUrl: Render.showUrl,
    showPage: Render.showPage,
    loadSvgOrCache: Resource.loadSvgOrCache,
    localeMaster: Clockworks.localeMaster,
    timer:
    {
        resolution: 360,
        highResolution: 36,
    },
});
