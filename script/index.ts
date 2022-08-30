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
import { Base } from "./base";
import { Render as RainbowClockRender } from "./application/rainbowclock/render";
import { Render as CountdownTimerRender } from "./application/countdowntimer/render";
import { Render as NeverStopwatchRender } from "./application/neverstopwatch/render";
import { Render as ElapsedTimerRender } from "./application/elapsedtimer/render";
import { ViewCommand } from "../tektite.js/script/tektite-view-command";
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
    export module TektiteWIP
    {
        export const initialize = () =>
        {
            (window as any).Tektite =
            {
                model:
                {
                    get: () => tektite.viewModel.getUnknown(ViewModel.makeRootPath()),
                    set: (model: any) => tektite.viewModel.set(model),
                }
            };
            initializeModel();
        };
        export const initializeModel = () =>
        {
            const $model = tektite.viewModel;
            const model = $model.makeRoot
            (
                { },
                {
                    "screen": $model.makeScreen
                    ({
                        "screen-header": $model.makeScreenHeader
                        ({
                            "screen-header-progress-bar": $model.maekScreenHeaderProgressBar(),
                            "screen-header-segment": $model.makeScreenHeaderSegmentList(),
                            "screen-header-operator": $model.makeScreenHeaderOperator(),
                        }),
                        "screen-body": $model.makeScreenBody(),
                        "screen-bar": "tektite-screen-bar",
                        "screen-toast": "tektite-screen-toast",
                    })
                }
            );
            $model.set(model);
        };
        export const setRootData = (data: minamo.core.JsonablePartial<ViewModel.RootEntry<Type.TektiteParams>["data"]>) =>
            tektite.viewModel.setData<ViewModel.RootEntry<Type.TektiteParams>>(ViewModel.makeRootPath(), "tektite-root", data);
        export const setHeaderSegmented = (children: [ ViewModel.ScreenHeaderSegmentEntry<Type.TektiteParams>, ...ViewModel.ScreenHeaderSegmentEntry<Type.TektiteParams>[]]) =>
        {
            const path = { type: "path", path: "/root/screen/screen-header/screen-header-segment", entryType: "tektite-screen-header-segment-list", } as const;
            const model: ViewModel.ScreenHeaderSegmentListEntry<Type.TektiteParams> | null = tektite.viewModel.get<ViewModel.ScreenHeaderSegmentListEntry<Type.TektiteParams>>(path);
            if (model)
            {
                model.children = children;
                tektite.viewModel.set<ViewModel.ScreenHeaderSegmentListEntry<Type.TektiteParams>>(path, model);
            }
        };
        export const setHeaderOperator = (children: ViewModel.ListEntry[] | { [key: string]: ViewModel.Entry }) =>
        {
            const path = { type: "path", path: "/root/screen/screen-header/screen-header-operator", entryType: "tektite-screen-header-operator", } as const;
            const model: ViewModel.ScreenHeaderOperatorEntry | null = tektite.viewModel.get<ViewModel.ScreenHeaderOperatorEntry>(path);
            if (model)
            {
                model.children = children;
                tektite.viewModel.set<ViewModel.ScreenHeaderOperatorEntry>(path, model);
            }
        };
        export const setScreenBody = (model: ViewModel.ScreenBodyEntry) =>
        {
            const path = { type: "path", path: "/root/screen/screen-body", entryType: "tektite-screen", } as const;
            tektite.viewModel.set<ViewModel.ScreenBodyEntry>(path, model);
        };
        export const setScreen = (
            screen:
            {
                data?: minamo.core.JsonablePartial<ViewModel.RootEntry<Type.TektiteParams>["data"]>,
                header:
                {
                    segmented: [ ViewModel.ScreenHeaderSegmentEntry<Type.TektiteParams>, ...ViewModel.ScreenHeaderSegmentEntry<Type.TektiteParams>[]],
                    operator: ViewModel.ListEntry[] | { [key: string]: ViewModel.Entry }
                },
                body: ViewModel.ScreenBodyEntry;
            }
        ) =>
        {
            if (screen.data)
            {
                setRootData(screen.data);
            }
            setHeaderSegmented(screen.header.segmented);
            setHeaderOperator(screen.header.operator);
            setScreenBody(screen.body);
        };
    }
    export interface GetScreenMenuCommand extends ViewCommand.EntryBase
    {
        params:
        {
            type: "get-screen-menu";
            data:
            {
                params?: Type.PageParams;
            },
        };
        result: ViewModel.MenuButtonEntry<Type.TektiteParams>["children"] & minamo.core.JsonableObject;
    }

    export module ClockworksWIP
    {
        export const showWelcomeScreen = async (params: Type.PageParams, $model = tektite.viewModel) =>
        {
            TektiteWIP.setScreen
            ({
                header:
                {
                    segmented:
                    [
                        $model.makeScreenHeaderLabelSegment
                        (
                            "application-segment",
                            { },
                            tektite.viewModel.makeScreenHeaderSegmentCore
                            ({
                                icon: "application-icon",
                                title: config.applicationTitle,
                            })
                        ),
                    ],
                    operator:
                    {
                        single: <ViewModel.MenuButtonEntry<Type.TektiteParams>>
                        {
                            type: "tektite-menu-button",
                            data:
                            {
                                getMenu: <GetScreenMenuCommand["params"]>
                                {
                                    type: "get-screen-menu",
                                    data: { params, },
                                }
                            },
                        },
                    },
                },
                body: $model.makeScreenBody
                (
                    {
                        className: "welcome-screen",
                    },
                    [
                        $model.makePrimaryPage
                        (
                            "primary",
                            {
                                body: $model.makePrimaryPageBody
                                (
                                    {
                                        board: "welcome-board",
                                        // operators: "welcome-operators",
                                        operators: <ViewModel.VerticalButtonListEntry<Type.TektiteParams>>
                                        {
                                            type: "tektite-vertical-button-list",
                                            children: Type.applicationIdList.map
                                            (
                                                (i: Type.ApplicationType) => <ViewModel.LinkButtonEntry<Type.TektiteParams> & ViewModel.ListEntry>
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
                                                        child: <ViewModel.SpanEntry>
                                                        {
                                                            type: "tektite-span",
                                                            data:
                                                            {
                                                                className: "tektite-label",
                                                                text: Type.applicationList[i].title,
                                                            }
                                                        },
                                                    },
                                                }),
                                            )
                                        }
                                    }
                                ),
                                footer: $model.makePrimaryPageFooter({ single:"tektite-primary-page-footer-down-page-link", }),
                            }
                        ),
                        $model.makeTrailPage("trail", "welcome-footer"),
                    ]
                )
            });
            await tektite.viewRenderer.renderRoot();
        };
        export const showPage = async (url: string = location.href) =>
        {
            tektite.screen.getScreenCover()?.click();
            window.scrollTo(0,0);
            document.getElementById("tektite-screen-body")?.scrollTo(0,0);
            // const urlParams = getUrlParams(url);
            const hash = Base.getUrlHash(url).split("/");
            const applicationType = hash[0] as Type.ApplicationType;
            const itemJson = hash[1];
            const application =
            {
                "RainbowClock":
                {
                    _show: async (item: Type.TimezoneEntry) => await RainbowClockRender.showRainbowClockScreen(item),
                    show: async (params: Type.PageParams) => await showWelcomeScreen(params),
                    parseItem: (json: string) => Domain.parseTimezone(json),
                },
                "CountdownTimer":
                {
                    _show: async (item: Type.AlarmEntry) => await CountdownTimerRender.showCountdownTimerScreen(item),
                    show: async (params: Type.PageParams) => await showWelcomeScreen(params),
                    parseItem: (json: string) => Domain.parseAlarm(json),
                },
                "ElapsedTimer":
                {
                    _show: async (item: Type.EventEntry) => await ElapsedTimerRender.showElapsedTimerScreen(item),
                    show: async (params: Type.PageParams) => await showWelcomeScreen(params),
                    parseItem: (json: string) => Domain.parseEvent(json),
                },
                "NeverStopwatch":
                {
                    _show: async (item: number) => await NeverStopwatchRender.showNeverStopwatchScreen(item),
                    show: async (params: Type.PageParams) => await showWelcomeScreen(params),
                    parseItem: (json: string) => Domain.parseStamp(json),
                },
            }[applicationType] ??
            {
                show: async (params: Type.PageParams) => await showWelcomeScreen(params),
                parseItem: () => null,
            };
            const item = application.parseItem(itemJson);
            if (Render.regulateLocation(applicationType, itemJson, item))
            {
                await application.show({application: applicationType, item: item as any, });
            }
            else
            {
                return false;
            }
            return true;
        };
        export const start = async (params:{ buildTimestampTick:number, }) =>
        {
            console.log(`start timestamp: ${tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", new Date())}`);
            console.log(`buildTimestamp: ${tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", params.buildTimestampTick)} ( ${tektite.date.format("formal-time", params.buildTimestampTick, "elapsed")} 前 )`);
            console.log(`${JSON.stringify(params)}`);
            tektite.locale.setLocale(Storage.Settings.get().locale ?? null);
            // tektite.onLoad();
            window.onpopstate = () => showPage(location.href);
            window.matchMedia("(prefers-color-scheme: dark)").addListener(Render.updateStyle);
            TektiteWIP.initialize();
            TektiteWIP.setRootData
            ({
                title: config.applicationTitle,
                theme: Storage.Settings.get().theme ?? "auto",
                progressBarStyle: Storage.Settings.get().progressBarStyle ?? "auto",
                windowColor: Color.getSolidRainbowColor(0),
            });
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
                key => (tektite.viewRenderer.renderer as any)[key] = renders[key]
            );
            const commands: { [type: string ]: ViewCommand.Command<any, any> } =
            {
                "get-screen-menu": <ViewCommand.Command<any, GetScreenMenuCommand>>
                (
                    async (_tektite, _entry) =>
                    ({
                        fullscreen: tektite.fullscreen.enabled() ?
                            <ViewModel.MenuItemButtonEntry>
                            {
                                type: "tektite-menu-item-button",
                                data: { onclick: "tektite-toggle-fullscreen", },
                                child: tektite.viewModel.makeLabelSpan
                                ({
                                    text: null === tektite.fullscreen.getElement() ? "Full screen": "Cancel full screen",
                                }),
                            }:
                            "tektite-null",
                        theme: <ViewModel.MenuItemButtonEntry>
                        {
                            type: "tektite-menu-item-button",
                            child: tektite.viewModel.makeLabelSpan
                            ({
                                text: "Theme setting",
                            }),
                        },
                        progressBarStyle: <ViewModel.MenuItemButtonEntry>
                        {
                            type: "tektite-menu-item-button",
                            child: tektite.viewModel.makeLabelSpan
                            ({
                                text: "Progress Bar Style setting",
                            }),
                        },
                        language: <ViewModel.MenuItemButtonEntry>
                        {
                            type: "tektite-menu-item-button",
                            child: tektite.viewModel.makeLabelSpan
                            ({
                                text: "Language setting",
                            }),
                        },
                        github: <ViewModel.MenuItemLinkButtonEntry<Type.TektiteParams>>
                        {
                            type: "tektite-menu-item-link-button",
                            data:
                            {
                                href: config.repositoryUrl,
                            },
                            child: <ViewModel.SpanEntry>
                            {
                                type: "tektite-span",
                                data:
                                {
                                    className: "tektite-label",
                                    text: "GitHub",
                                }
                            },
                        },
                    })
                ),
            };
            minamo.core.objectKeys(commands).forEach
            (
                key => (tektite.viewCommand.commands as any)[key] = commands[key]
            );
            await showPage();
            if ("reload" === (<any>performance.getEntriesByType("navigation"))?.[0]?.type)
            {
                tektite.makeToast
                ({
                    content: `ビルドタイムスタンプ: ${tektite.date.format("YYYY-MM-DD HH:MM", params.buildTimestampTick)} ( ${tektite.date.format("formal-time", params.buildTimestampTick, "elapsed")} 前 )`,
                    isWideContent: true,
                });
                await tektite.viewRenderer.renderRoot();
            }
            document.getElementById("tektite-screen-body")?.addEventListener
            (
                "scroll",
                () => tektite.viewRenderer.update("scroll"),
            );
        };
    }
}
export const tektite = Tektite.make<Type.TektiteParams>
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
