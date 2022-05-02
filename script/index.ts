// import { minamo } from "./minamo.js";
import { Tektite } from "../tektite.js/script/tektite-index";
import { ViewModel } from "../tektite.js/script/tektite-view-model.js";
import { Type } from "./type";
import { Color } from "./color";
import { Render } from "./render";
import { Resource } from "./render/resource";
import { Storage } from "./storage";
import { Domain } from "./domain";
import localeEn from "../resource/lang.en.json";
import localeJa from "../resource/lang.ja.json";
import config from "../resource/config.json";
import { minamo } from "../nephila/minamo.js";
export module Clockworks
{
    // export type ApplicationType = keyof typeof applicationList;
    // export const applicationIdList = minamo.core.objectKeys(applicationList);
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
    export const start = async (params:{ buildTimestampTick:number, }) =>
    {
        console.log(`start timestamp: ${tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", new Date())}`);
        console.log(`buildTimestamp: ${tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", params.buildTimestampTick)} ( ${tektite.date.format("formal-time", params.buildTimestampTick, "elapsed")} 前 )`);
        console.log(`${JSON.stringify(params)}`);
        tektite.locale.setLocale(Storage.Settings.get().locale ?? null);
        tektite.onLoad();
        window.matchMedia("(prefers-color-scheme: dark)").addListener(Render.updateStyle);
        Render.updateStyle();
        Render.updateProgressBarStyle();
        await Render.showPage();
        if ("reload" === (<any>performance.getEntriesByType("navigation"))?.[0]?.type)
        {
            tektite.screen.toast.make
            ({
                content: Tektite.$span("")(`ビルドタイムスタンプ: ${tektite.date.format("YYYY-MM-DD HH:MM", params.buildTimestampTick)} ( ${tektite.date.format("formal-time", params.buildTimestampTick, "elapsed")} 前 )`),
                isWideContent: true,
            });
        }
    };
    export const startWIP = async (params:{ buildTimestampTick:number, }) =>
    {
        console.log(`start timestamp: ${tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", new Date())}`);
        console.log(`buildTimestamp: ${tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", params.buildTimestampTick)} ( ${tektite.date.format("formal-time", params.buildTimestampTick, "elapsed")} 前 )`);
        console.log(`${JSON.stringify(params)}`);
        tektite.locale.setLocale(Storage.Settings.get().locale ?? null);
        tektite.onLoad();
        window.matchMedia("(prefers-color-scheme: dark)").addListener(Render.updateStyle);
        const model: ViewModel.RootEntry =
        {
            type: "tektite-screen-root",
            data:
            {
                title: config.applicationTitle,
                theme: Storage.Settings.get().theme ?? "auto",
                progressBarStyle: Storage.Settings.get().progressBarStyle ?? "auto",
                windowColor: Color.getSolidRainbowColor(0),
                className: "welcome-screen",
            },
            children:
            {
                "screen-header":
                {
                    type: "tektite-screen-header",
                    children:
                    {
                        "screen-header-progress-bar":
                        {
                            type: "tektite-screen-header-progress-bar",
                        },
                        "screen-header-segment":
                        {
                            type: "tektite-screen-header-segment-list",
                            children:
                            [
                                {
                                    type: "tektite-screen-header-label-segment",
                                    key: "application-segment",
                                    children:
                                    {
                                        core:
                                        {
                                            type: "tektite-screen-header-segment-core",
                                            data:
                                            {
                                                icon: "application-icon",
                                                title: config.applicationTitle,
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                        "screen-header-operator":
                        {
                            "type": "tektite-screen-header-operator",
                            children:
                            {
                            },
                        },
                    }
                },
                "screen-body":
                {
                    type: "tektite-screen-body",
                    children:
                    [
                        <ViewModel.PrimaryPageEntry & ViewModel.ListEntry>
                        {
                            key: "primary",
                            type: "tektite-primary-page",
                            children:
                            {
                                body:
                                {
                                    type: "tektite-primary-page-body",
                                    children: { },
                                },
                            },
                        },
                        <ViewModel.TrailPageEntry & ViewModel.ListEntry>
                        {
                            key: "trail",
                            type: "tektite-trail-page",
                            children:
                            {
                            },
                        },
                    ]
                },
                "screen-bar":
                {
                    type: "tektite-screen-bar",
                    children:
                    {
                    },
                },
                "screen-toast":
                {
                    type: "tektite-screen-toast",
                    children: [],
                }
            }
        };
        tektite.viewModel.set(model);
        minamo.dom.replaceChildren
        (
            document.body,
            await tektite.viewRenderer.renderRoot(),
            dom => "tektite-foundation" === (<Element>dom).className
        );
        // Render.updateStyle();
        // Render.updateProgressBarStyle();
        // await Render.showPage();
        if ("reload" === (<any>performance.getEntriesByType("navigation"))?.[0]?.type)
        {
            tektite.screen.toast.make
            ({
                content: Tektite.$span("")(`ビルドタイムスタンプ: ${tektite.date.format("YYYY-MM-DD HH:MM", params.buildTimestampTick)} ( ${tektite.date.format("formal-time", params.buildTimestampTick, "elapsed")} 前 )`),
                isWideContent: true,
            });
        }
    };
}
export const tektite = Tektite.make<Type.PageParams, Resource.KeyType, typeof localeEn | typeof localeJa, typeof Clockworks.localeMaster>
({
    makeUrl: Domain.makeUrl,
    showUrl: Render.showUrl,
    showPage: Render.showPage,
    loadIconOrCache: Resource.loadIconOrCache,
    localeMaster: Clockworks.localeMaster,
    timer:
    {
        resolution: 360,
        highResolution: 36,
    },
});
