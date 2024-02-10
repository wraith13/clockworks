import { minamo } from "../../nephila/minamo.js";
import { Clockworks, tektite } from "..";
import { Tektite } from "../../tektite.js/script/tektite-index";
import { Type } from "../type";
import { Base } from "../base";
import { Color } from "../color";
import { Storage } from "../storage";
import { Domain } from "../domain";
import { Resource } from "./resource";
import { Operate as RenderOperate } from "./operate";
import { Render as RainbowClockRender } from "../application/rainbowclock/render";
import { Render as CountdownTimerRender } from "../application/countdowntimer/render";
import { Render as NeverStopwatchRender } from "../application/neverstopwatch/render";
import { Render as ElapsedTimerRender } from "../application/elapsedtimer/render";
import config from "../../resource/config.json";
export module Render
{
    export const updateStyle = () =>
    {
        const setting = Storage.Settings.get().theme ?? "auto";
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark": "light";
        const theme = "auto" === setting ? system: setting;
        [ "light", "dark", ].forEach
        (
            i => document.body.classList.toggle(i, i === theme)
        );
    };
    export const updateProgressBarStyle = () =>
        tektite.setProgressBarStyle(Storage.Settings.get().progressBarStyle ?? "auto");
    export const Operate = RenderOperate;
    export const cancelTextButton = (onCanceled: () => unknown) =>
    ({
        tag: "button",
        className: "tektite-text-button",
        children: label("roll-back"),
        onclick: async () =>
        {
            onCanceled();
            tektite.screen.toast.make
            ({
                content: Tektite.$span("")(label("roll-backed")),
                wait: 3000,
            });
        },
    });
    export const label = (label: Clockworks.LocaleKeyType) => Tektite.$labelSpan
    ([
        Tektite.$span("locale-parallel")(Clockworks.localeParallel(label)),
        Tektite.$span("locale-map")(Clockworks.localeMap(label)),
    ]);
    export const systemConfirm = (message: string) => window.confirm(message);
    export const closeButton = (onclick?: (event: MouseEvent) => unknown): minamo.dom.Source =>
    ({
        tag: "button",
        className: "tektite-default-button",
        children: label("Close"),
        onclick,
    });
    export const popupCloseOperator = (onclick?: () => unknown) =>
        Tektite.$div("tektite-popup-operator")(closeButton(onclick));
    export const themeSettingsPopup = async (settings: Type.Settings = Storage.Settings.get()): Promise<boolean | null> =>
        await tektite.screen.popup<boolean>
        (
            async (instance: Tektite.PopupInstance<boolean>) =>
            {
                const init = settings.theme ?? "auto";
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "tektite-check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    [
                        await Promise.all
                        (
                            Type.ThemeList.map
                            (
                                async (key: Type.ThemeType) =>
                                ({
                                    tag: "button",
                                    className: `tektite-check-button ${key === (settings.theme ?? "auto") ? "checked": ""}`,
                                    children:
                                    [
                                        await Resource.loadIconOrCache("tektite-check-icon"),
                                        Tektite.$span("")(label(`theme.${key}` as Clockworks.LocaleKeyType)),
                                    ],
                                    onclick: async () =>
                                    {
                                        if (key !== (settings.theme ?? "auto"))
                                        {
                                            settings.theme = key;
                                            Storage.Settings.set(settings);
                                            await checkButtonListUpdate();
                                            updateStyle();
                                            instance.set(init !== key);
                                        }
                                    }
                                })
                            )
                        )
                    ]
                );
                await checkButtonListUpdate();
                return {
                    initialValue: false,
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        tektite.screen.popupTitle(label("Theme setting")),
                        checkButtonList,
                        popupCloseOperator(() => instance.close()),
                    ],
                };
            }
        );
    export const progressBarStyleSettingsPopup = async (settings: Type.Settings = Storage.Settings.get()): Promise<boolean | null> =>
        await tektite.screen.popup<boolean>
        (
            async (instance: Tektite.PopupInstance<boolean>) =>
            {
                const init = settings.progressBarStyle ?? "auto";
                let selected = init;
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "tektite-check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    await Promise.all
                    (
                        Tektite.ProgressBarStyleList.map
                        (
                            async (key: Tektite.ProgressBarStyleType) =>
                            ({
                                tag: "button",
                                className: `tektite-check-button ${key === selected ? "checked": ""}`,
                                children:
                                [
                                    await Resource.loadIconOrCache("tektite-check-icon"),
                                    Tektite.$span("")(label(`progressBarStyle.${key}` as Clockworks.LocaleKeyType)),
                                ],
                                onclick: async () =>
                                {
                                    if (key !== selected)
                                    {
                                        selected = key;
                                        settings.progressBarStyle = selected;
                                        Storage.Settings.set(settings);
                                        await checkButtonListUpdate();
                                        updateProgressBarStyle();
                                    }
                                }
                            })
                        )
                    )
                );
                await checkButtonListUpdate();
                return {
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        tektite.screen.popupTitle(label("Progress Bar Style setting")),
                        checkButtonList,
                        popupCloseOperator(() => instance.close()),
                    ],
                    onClose: async () => instance.set(init !== selected),
                };
            }
        );
    export const localeSettingsPopup = async (settings: Type.Settings = Storage.Settings.get()): Promise<boolean | null> =>
        await tektite.screen.popup<boolean>
        (
            async (instance: Tektite.PopupInstance<boolean>) =>
            {
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "tektite-check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    [
                        {
                            tag: "button",
                            className: `tektite-check-button ${"@auto" === (settings.locale ?? "@auto") ? "checked": ""}`,
                            children:
                            [
                                await Resource.loadIconOrCache("tektite-check-icon"),
                                Tektite.$span("")(label("language.auto")),
                            ],
                            onclick: async () =>
                            {
                                if (null !== (settings.locale ?? null))
                                {
                                    settings.locale = undefined;
                                    Storage.Settings.set(settings);
                                    instance.set(true);
                                    await checkButtonListUpdate();
                                }
                            }
                        },
                        await Promise.all
                        (
                            tektite.locale.locales.map
                            (
                                async (key: Clockworks.LocaleType) =>
                                ({
                                    tag: "button",
                                    className: `tektite-check-button ${key === (settings.locale ?? "@auto") ? "checked": ""}`,
                                    children:
                                    [
                                        await Resource.loadIconOrCache("tektite-check-icon"),
                                        Tektite.$span("")(Tektite.$labelSpan(tektite.locale.getLocaleName(key))),
                                    ],
                                    onclick: async () =>
                                    {
                                        if (key !== settings.locale ?? null)
                                        {
                                            settings.locale = key;
                                            Storage.Settings.set(settings);
                                            instance.set(true);
                                            await checkButtonListUpdate();
                                        }
                                    }
                                })
                            )
                        )
                    ]
                );
                await checkButtonListUpdate();
                return {
                    initialValue: false,
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        tektite.screen.popupTitle(label("Language setting")),
                        checkButtonList,
                        popupCloseOperator(() => instance.close()),
                    ],
                };
            }
        );
    export const colorSettingsPopup = async (settings = Storage.RainbowClock.colorPattern.get()): Promise<boolean | null> =>
        await tektite.screen.popup<boolean>
        (
            async (instance: Tektite.PopupInstance<boolean>) =>
            {
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "tektite-check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    await Promise.all
                    (
                        minamo.core.objectKeys(Type.rainbowClockColorPatternMap).map
                        (
                            async (key: Type.rainbowClockColorPatternType) =>
                            ({
                                tag: "button",
                                className: `tektite-check-button ${key === settings ? "checked": ""}`,
                                children:
                                [
                                    await Resource.loadIconOrCache("tektite-check-icon"),
                                    Tektite.$span("")(label(key)),
                                ],
                                onclick: async () =>
                                {
                                    if (key !== settings ?? null)
                                    {
                                        settings = key;
                                        Storage.RainbowClock.colorPattern.set(settings);
                                        instance.set(true);
                                        await checkButtonListUpdate();
                                    }
                                }
                            })
                        )
                    )
                );
                await checkButtonListUpdate();
                return {
                    initialValue: false,
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        tektite.screen.popupTitle(label("Color setting")),
                        checkButtonList,
                        popupCloseOperator(() => instance.close()),
                    ],
                };
            }
        );
    export const timePrompt = async (message: string, tick: number = 0): Promise<number | null> =>
    {
        const inputTime = Tektite.$make(HTMLInputElement)
        ({
            tag: "input",
            type: "time",
            value: tektite.date.format("HH:MM:SS", tick),
            required: "",
        });
        return await tektite.screen.prompt
        ({
            title: message,
            content: inputTime,
            onCommit: () => tektite.date.parseTime(inputTime.value) ?? tick,
        });
    };
    export const dateTimeTickPrompt = async (message: string, tick: number): Promise<number | null> =>
    {
        const inputDate = Tektite.$make(HTMLInputElement)
        ({
            tag: "input",
            type: "date",
            value: tektite.date.format("YYYY-MM-DD", tick),
            required: "",
        });
        const inputTime = Tektite.$make(HTMLInputElement)
        ({
            tag: "input",
            type: "time",
            value: tektite.date.format("HH:MM", tektite.date.getTime(tick)),
            required: "",
        });
        return await tektite.screen.prompt
        ({
            title: message,
            content:
            [
                inputDate,
                inputTime,
            ],
            onCommit: () => tektite.date.parseDate(`${inputDate.value}T${inputTime.value}`)?.getTime() ?? tick,
        });
    };
    export const sharePopup = async (title: string, url: string = location.href) =>
        await tektite.screen.popup<unknown>
        (
            async (instance: Tektite.PopupInstance<unknown>) =>
            ({
                // className: "add-remove-tags-popup",
                children:
                [
                    tektite.screen.popupTitle(label("Share")),
                    Tektite.$div("tektite-menu-button-list")
                    ([
                        {
                            tag: "button",
                            className: "tektite-menu-item-button",
                            children: Tektite.$span("")(Tektite.$labelSpan("Tweet / ツイート")),
                            onclick: async () =>
                            {
                                location.href='https://twitter.com/intent/tweet?text='+encodeURIComponent('【'+title+'】 '+url +' ');
                                instance.close();
                            }
                        },
                        {
                            tag: "button",
                            className: "tektite-menu-item-button",
                            children: Tektite.$span("")(Tektite.$labelSpan("Copy URL / URL をコピー")),
                            onclick: async () =>
                            {
                                Operate.copyToClipboard(url, "URL");
                                instance.close();
                            }
                        }
                    ]),
                    popupCloseOperator(() => instance.close()),
                ],
            })
        );
    export type HeaderSegmentSource = Tektite.HeaderSegmentSource<Type.PageParams, Resource.KeyType>;
    export type ScreenSource = Tektite.ScreenSource<Type.PageParams, Resource.KeyType>;
    export const screenHeaderHomeSegment = async (): Promise<HeaderSegmentSource> =>
    ({
        icon: "application-icon",
        href: { },
        title: config.applicationTitle,
    });
    export const screenHeaderApplicationSegment = async (applicationType: Type.ApplicationType): Promise<HeaderSegmentSource> =>
    ({
        icon: Type.applicationList[applicationType].icon,
        title: Type.applicationList[applicationType].title,
        href: { application: applicationType, }
    });
    export const screenHeaderApplicationSegmentMenu = async (applicationType: Type.ApplicationType): Promise<HeaderSegmentSource> =>
    ({
        icon: Type.applicationList[applicationType].icon,
        title: Type.applicationList[applicationType].title,
        menu: await Promise.all
        (
            Type.applicationIdList.map
            (
                async (i: Type.ApplicationType) => tektite.menu.linkItem
                (
                    [
                        await Resource.loadIconOrCache(Type.applicationList[i].icon),
                        Tektite.$span("label")(Type.applicationList[i].title),
                    ],
                    { application: i },
                    applicationType === i ? "tektite-current-item": undefined,
                )
            )
        )
    });
    export const screenHeaderFlashSegmentMenu = async (adder: (i: number) => unknown, flashIntervalPreset: number[], flashInterval: number, setter: (i: number) => unknown, zeroIcon: Resource.KeyType, zeroLabel: Clockworks.LocaleKeyType): Promise<minamo.dom.Source> =>
    (
        await Promise.all
        (
            flashIntervalPreset.map
            (
                async i =>
                tektite.menu.item
                (
                    [
                        await Resource.loadIconOrCache(0 === i ? zeroIcon: "tektite-flash-icon"),
                        Tektite.$labelSpan(0 === i ? Clockworks.localeMap(zeroLabel): `${Clockworks.localeMap("Interval")}: ${tektite.date.format("formal-time", i)}`),
                    ],
                    async () =>
                    {
                        setter(i);
                        tektite.screen.clearLastMouseDownTarget();
                        tektite.screen.getScreenCoverList().forEach(i => i.click());
                        await reload();
                    },
                    flashInterval === i ? "tektite-current-item": undefined
                )
            )
        )
    )
    .concat
    (
        adder ?
        [
            tektite.menu.item
            (
                [
                    await Resource.loadIconOrCache("tektite-flash-icon"),
                    label("input a time"),
                ],
                async () =>
                {
                    tektite.screen.clearLastMouseDownTarget();
                    tektite.screen.getScreenCoverList().forEach(i => i.click());
                    const tick = await timePrompt(Clockworks.localeMap("input a time"), 0);
                    if (null !== tick)
                    {
                        adder(tick);
                        setter(tick);
                    }
                    await reload();
                },
            )
        ]:
        []
    );
    export const screenHeaderFlashSegment = async (adder: (i: number) => unknown, flashIntervalPreset: number[], flashInterval: number, setter: (i: number) => unknown, zeroIcon: Resource.KeyType = "tektite-sleep-icon", zeroLabel: Clockworks.LocaleKeyType = "No Flash"): Promise<HeaderSegmentSource> =>
    ({
        icon: 0 === flashInterval ? zeroIcon: "tektite-flash-icon",
        title: 0 === flashInterval ? Clockworks.localeMap(zeroLabel): `${Clockworks.localeMap("Interval")}: ${tektite.date.format("formal-time", flashInterval)}`,
        menu: await screenHeaderFlashSegmentMenu(adder, flashIntervalPreset, flashInterval, setter, zeroIcon, zeroLabel),
    });
    export const reloadMenuItem = async () =>
        tektite.menu.item
        (
            label("Reload screen"),
            Clockworks.reloadScreen
        );
    export const fullscreenMenuItem = async () => tektite.fullscreen.enabled() ?
        (
            null === tektite.fullscreen.getElement() ?
                tektite.menu.item
                (
                    label("Full screen"),
                    async () => await tektite.fullscreen.request()
                ):
                tektite.menu.item
                (
                    label("Cancel full screen"),
                    async () => await tektite.fullscreen.exit()
                )
        ):
        [];
    export const themeMenuItem = async () =>
        tektite.menu.item
        (
            label("Theme setting"),
            async () =>
            {
                if (await themeSettingsPopup())
                {
                    // updateStyle();
                }
            }
        );
    export const progressBarStyleMenuItem = async () =>
        tektite.menu.item
        (
            label("Progress Bar Style setting"),
            async () =>
            {
                if (await progressBarStyleSettingsPopup())
                {
                    // updateProgressBarStyle();
                }
            }
        );
    export const languageMenuItem = async () =>
        tektite.menu.item
        (
            label("Language setting"),
            async () =>
            {
                if (await localeSettingsPopup())
                {
                    tektite.locale.setLocale(Storage.Settings.get().locale ?? null);
                    await reload();
                }
            }
        );
    export const resetNeverStopwatchMenuItem = async () =>
        tektite.menu.item
        (
            label("Remove all stamps"),
            async () => await Operate.NeverStopwatch.removeAllStamps(),
            "tektite-delete-button"
        );
    export const resetCountdownTimerMenuItem = async () =>
        tektite.menu.item
        (
            label("Remove all alarms"),
            async () => await Operate.CountdownTimer.removeAllAlarms(),
            "tektite-delete-button"
        );
    export const resetElapsedTimerMenuItem = async () =>
        tektite.menu.item
        (
            label("Remove all alarms"),
            async () => await Operate.ElapsedTimer.removeAllEvents(),
            "tektite-delete-button"
        );
    export const resetRainbowClockMenuItem = async () =>
        tektite.menu.item
        (
            label("Initialize timezone list"),
            async () => await Operate.RainbowClock.reset(),
            "tektite-delete-button"
        );
    export const githubMenuItem = async () =>
        tektite.externalLink
        ({
            href: config.repositoryUrl,
            children: tektite.menu.item(Tektite.$labelSpan("GitHub")),
        });
    export const welcomeScreenMenu = async () =>
    [
        await reloadMenuItem(),
        await fullscreenMenuItem(),
        await themeMenuItem(),
        await progressBarStyleMenuItem(),
        await languageMenuItem(),
        await githubMenuItem(),
    ];
    export const welcomeScreen = async (): Promise<ScreenSource> =>
    ({
        className: "welcome-screen",
        header:
        {
            items:
            [
                await screenHeaderHomeSegment(),
            ],
            menu: welcomeScreenMenu,
        },
        body:
        {
            primary:
            [
                Tektite.$div("logo")
                ([
                    Tektite.$div("application-icon icon")(await Resource.loadIconOrCache("application-icon")),
                    Tektite.$span("logo-text")(config.applicationTitle)
                ]),
                Tektite.$div("tektite-vertical-button-list")
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
            ],
            trail: Tektite.$div("description")
            (
                Tektite.$tag("ul")("tektite-locale-parallel-off")
                ([
                    Tektite.$tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                    Tektite.$tag("li")("version-information")(Clockworks.getVersionInfromationText("short-time")),
                ])
            ),
        }
    });
    export const showWelcomeScreen = async () =>
    {
        const updateScreen = async (event: Tektite.UpdateScreenEventEype) =>
        {
            switch(event)
            {
            case "high-resolution-timer":
                break;
            case "timer":
                minamo.dom.setProperty(document.getElementsByClassName("version-information")[0], "innerText", Clockworks.getVersionInfromationText("short-time"));
                break;
            case "storage":
                break;
            case "operate":
                break;
            case "focus":
                Clockworks.checkApplicationUpdate();
                break;
            }
        };
        tektite.setWindowColor(Color.getSolidRainbowColor(0));
        await showScreen(await welcomeScreen(), updateScreen);
        await updateScreen("timer");
        Clockworks.checkApplicationUpdate();
    };
    export const flashIntervalLabel = async (entry: HeaderSegmentSource) =>
    ({
        tag: "div",
        className: "tektite-flash-interval",
        children:
        [
            await Resource.loadIconOrCache(entry.icon),
            Tektite.$span("label")(entry.title),
        ],
        onclick: async () => tektite.screen.popup
        ({
            className: "bare-popup",
            children: "function" === typeof entry.menu ? await entry.menu(): (entry.menu ?? []),
        }),
    });
    export const itemFooter = async <T>(item: T | null, application: Type.ApplicationType, getShareTitle: (item: T) => string, isSaved: (item: T) => boolean, save: (item: T) => Promise<unknown>) =>
        null !== item ?
            Tektite.$div("tektite-horizontal-button-list")
            ([
                tektite.internalLink
                ({
                    className: "tektite-link-button",
                    href: { application, },
                    children:
                    {
                        tag: "button",
                        className: "tektite-main-button tektite-long-button",
                        children: label("Close"),
                    }
                }),
                isSaved(item) ?
                    {
                        tag: "button",
                        className: "tektite-main-button tektite-long-button",
                        children: label("Share"),
                        onclick: async () => await sharePopup(getShareTitle(item)),
                    }:
                    {
                        tag: "button",
                        className: "tektite-main-button tektite-long-button",
                        children: label("Save"),
                        onclick: async () => await save(item),
                    }
            ]):
            await tektite.screen.downPageLink();
    export const colorMenuItem = async () =>
        tektite.menu.item
        (
            label("Color setting"),
            async () => await colorSettingsPopup(),
        );
    export const updateTitle = () => tektite.setTitle
    (
        minamo.dom.getDivsByClassName(tektite.screen.header.getElement(), "tektite-segment-title")
            ?.map(div => div.innerText)
            // ?.reverse()
            ?.join(" / ")
            ?? config.applicationTitle
    );
    export const showScreen = async (screen: ScreenSource, updateScreen?: (event: Tektite.UpdateScreenEventEype) => unknown) =>
    {
        await tektite.screen.show(screen, updateScreen);
        tektite.setBackgroundColor(Color.getSolidRainbowColor(0));
        updateTitle();
    };
    export const setProgress = (percent: null | number, color?: string) =>
        tektite.setProgress(Storage.Settings.get().progressBarStyle ?? "auto", percent, color);
    export type ItemStateType = "nothing" | "regular" | "irregular" | "invalid";
    export const itemState = <T>(itemJson: string, item: T | null): ItemStateType =>
    {
        if ( ! itemJson)
        {
            return "nothing";
        }
        else
        if ( ! item)
        {
            return "invalid";
        }
        else
        if ( ! (JSON.stringify(item) === itemJson))
        {
            return "irregular";
        }
        else
        {
            return "regular";
        }
    };
    export const regulateLocation = <T extends Type.PageItemType>(application: Type.ApplicationType, itemJson: string, item: T | null) =>
    {
        switch(itemState(itemJson, item))
        {
        case "nothing":
            return true;
        case "regular":
            return true;
        case "irregular":
            Render.rewriteShowUrl(Domain.makePageParams(application, <T>item));
            return false;
        case "invalid":
            Render.rewriteShowUrl({ application, });
            return false;
        }
        return true;
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
                show: async (item: Type.TimezoneEntry) => await RainbowClockRender.showRainbowClockScreen(item),
                parseItem: (json: string) => Domain.parseTimezone(json),
            },
            "CountdownTimer":
            {
                show: async (item: Type.AlarmEntry) => await CountdownTimerRender.showCountdownTimerScreen(item),
                parseItem: (json: string) => Domain.parseAlarm(json),
            },
            "ElapsedTimer":
            {
                show: async (item: Type.EventEntry) => await ElapsedTimerRender.showElapsedTimerScreen(item),
                parseItem: (json: string) => Domain.parseEvent(json),
            },
            "NeverStopwatch":
            {
                show: async (item: number) => await NeverStopwatchRender.showNeverStopwatchScreen(item),
                parseItem: (json: string) => Domain.parseStamp(json),
            },
        }[applicationType] ??
        {
            show: async () => await Render.showWelcomeScreen(),
            parseItem: () => null,
        };
        const item = application.parseItem(itemJson);
        if (regulateLocation(applicationType, itemJson, item))
        {
            await application.show(item as any);
        }
        else
        {
            return false;
        }
        return true;
    };
    export const getTitle = (data: Type.PageParams) =>
    (
        data.application ? Type.applicationList[data.application]?.title:
        null
    ) ?? config.applicationTitle;
    export const showUrl = async (data: Type.PageParams) =>
    {
        const url = Domain.makeUrl(data);
        if (await showPage(url))
        {
            history.pushState(null, getTitle(data), url);
        }
    };
    export const rewriteShowUrl = async (data: Type.PageParams) =>
    {
        const url = Domain.makeUrl(data);
        if (await showPage(url))
        {
            history.replaceState(null, getTitle(data), url);
        }
    };
    export const reload = async () => await showPage();
}
