// import { minamo } from "./minamo.js";
import { Tektite } from "../tektite.js/script/tektite-index";
import { ViewModel } from "../tektite.js/script/tektite-view-model.js";
import { ViewRenderer } from "../tektite.js/script/tektite-view-renderer";
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
        const renders: { [type: string ]: ViewRenderer.Entry<any>} =
        {
            "welcome-board":
            {
                make: Tektite.$div("logo")
                ([
                    Tektite.$div("application-icon icon")(await Resource.loadIconOrCache("application-icon")),
                    Tektite.$span("logo-text")(config.applicationTitle)
                ]),
            },
            "welcome-operators":
            {
                make: Tektite.$div("tektite-vertical-button-list")
                (
                    Type.applicationIdList.map
                    (
                        (i: Type.ApplicationType) =>
                        tektite.internalLink
                        ({
                            className: "tektite-link-button",
                            href: { application: i },
                            children:
                            {
                                tag: "button",
                                className: "tektite-default-button tektite-main-button tektite-long-button",
                                children: Tektite.$labelSpan(Type.applicationList[i].title),
                                // onclick: async () => await showNeverStopwatchScreen(),
                            }
                        }),
                    )
                ),
            },
            "welcome-footer":
            {
                make: Tektite.$div("description")
                (
                    Tektite.$tag("ul")("tektite-locale-parallel-off")
                    ([
                        Tektite.$tag("li")("")(Render.label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                    ])
                ),
            },
        };
        minamo.core.objectKeys(renders).forEach
        (
            key => tektite.viewRenderer.renderer[key] = renders[key]
        );
        const model = <ViewModel.RootEntry>
        {
            type: "tektite-root",
            data:
            {
                title: config.applicationTitle,
                theme: Storage.Settings.get().theme ?? "auto",
                progressBarStyle: Storage.Settings.get().progressBarStyle ?? "auto",
                windowColor: Color.getSolidRainbowColor(0),
            },
            children:
            {
                "screen": <ViewModel.ScreenEntry>
                {
                    type: "tektite-screen",
                    children:
                    {
                        "screen-header": <ViewModel.ScreenHeaderEntry>
                        {
                            type: "tektite-screen-header",
                            children:
                            {
                                "screen-header-progress-bar": <ViewModel.ScreenHeaderProgressBarEntry>
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
                                            child:
                                            {
                                                type: "tektite-screen-header-segment-core",
                                                data:
                                                {
                                                    icon: "application-icon",
                                                    title: config.applicationTitle,
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
                            data:
                            {
                                className: "welcome-screen",
                            },
                            children:
                            [
                                <ViewModel.PrimaryPageEntry & ViewModel.ListEntry>
                                {
                                    key: "primary",
                                    type: "tektite-primary-page",
                                    children:
                                    {
                                        body: <ViewModel.PrimaryPageBodyEntry>
                                        {
                                            type: "tektite-primary-page-body",
                                            children:
                                            {
                                                board: "welcome-board",
                                                // operators: "welcome-operators",
                                                operators: <ViewModel.VerticalButtonListEntry>
                                                {
                                                    type: "tektite-vertical-button-list",
                                                    children: Type.applicationIdList.map
                                                    (
                                                        (i: Type.ApplicationType) => <ViewModel.LinkButtonEntry & ViewModel.ListEntry>
                                                        ({
                                                            key: i,
                                                            type: "tektite-link-button",
                                                            data:
                                                            {
                                                                className: "tektite-link-button",
                                                                href: tektite.params.makeUrl({ application: i }),
                                                            },
                                                            child: <ViewModel.ButtonEntry>
                                                            {
                                                                type: "tektite-button",
                                                                data:
                                                                {
                                                                    className: "tektite-default-button tektite-main-button tektite-long-button",
                                                                },
                                                                child: <ViewModel.LabelSpanEntry>
                                                                {
                                                                    type: "tektite-label-span",
                                                                    data:
                                                                    {
                                                                        text: Type.applicationList[i].title,
                                                                    }
                                                                },
                                                            },
                                                        }),
                                                    )
                                                }
                                            },
                                        },
                                    },
                                },
                                {
                                    key: "trail",
                                    type: "tektite-trail-page",
                                    child: "welcome-footer",
                                },
                            ]
                        },
                        "screen-bar": "tektite-screen-bar",
                        "screen-toast": "tektite-screen-toast",
                    }
                }
            }
        };
        tektite.viewModel.set(model);
        await tektite.viewRenderer.update("storage");
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
