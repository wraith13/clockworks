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
        Tektite.setProgressBarStyle(Storage.Settings.get().progressBarStyle ?? "auto");
    export const Operate = RenderOperate;
    export const cancelTextButton = (onCanceled: () => unknown) =>
    ({
        tag: "button",
        className: "text-button",
        children: label("roll-back"),
        onclick: async () =>
        {
            onCanceled();
            tektite.toast.make
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
    // export const systemPrompt = async (message?: string, _default?: string): Promise<string | null> =>
    // {
    //     await minamo.core.timeout(100); // この wait をかましてないと呼び出し元のポップアップメニューが window.prompt が表示されてる間、ずっと表示される事になる。
    //     return await new Promise(resolve => resolve(window.prompt(message, _default)?.trim() ?? null));
    // };
    // export const customPrompt = async (message?: string, _default?: string): Promise<string | null> =>
    // {
    //     const input = Tektite.$make(HTMLInputElement)
    //     ({
    //         tag: "input",
    //         type: "text",
    //         value: _default,
    //     });
    //     return prompt
    //     ({
    //         title: message ?? Clockworks.localeMap("please input"),
    //         content: input,
    //         onCommit: () => input.value,
    //     });
    // };
    // // export const prompt = systemPrompt;
    // export const prompt = customPrompt;
    // // export const alert = (message: string) => window.alert(message);
    // export const alert = (message: string) => makeToast({ content: message, });

    export const systemConfirm = (message: string) => window.confirm(message);
    // export const confirm = systemConfirm;
    export const popupTitle = (title: minamo.dom.Source | undefined) => minamo.core.exists(title) ? Tektite.$tag("h2")("")(title): [];
    export const prompt = async <ResultType>
    (
        data:
        {
            className?: string;
            title?: string,
            content: minamo.dom.Source,
            onCommit: () => (ResultType | Promise<ResultType>),
            onCancel?: () => (ResultType | Promise<ResultType>),
        }
    ) => await tektite.screen.popup<ResultType>
    (
        async instance =>
        ({
            className: data.className,
            children:
            [
                popupTitle(data.title),
                data.content,
                Tektite.$div("popup-operator")
                ([
                    {
                        tag: "button",
                        className: "cancel-button",
                        children: Clockworks.localeMap("Cancel"),
                        onclick: async () => instance.set((await data.onCancel?.()) ?? null).close(),
                    },
                    {
                        tag: "button",
                        className: "default-button",
                        children: Clockworks.localeMap("OK"),
                        onclick: async () => instance.set(await data.onCommit()).close(),
                    },
                ])
            ],
        })
    );
    // export const prompt = async <ResultType>
    // (
    //     data:
    //     {
    //         title?: string,
    //         content: minamo.dom.Source,
    //         onCommit: () => (ResultType | Promise<ResultType>),
    //         onCancel?: () => (ResultType | Promise<ResultType>),
    //     }
    // ) => await popup3<ResultType>
    // (
    //     instance =>
    //     ({
    //         children:
    //         [
    //             undefined !== data.title ? Tektite.$tag("h2")("")(data.title): [],
    //             data.content,
    //             Tektite.$div("popup-operator")
    //             ([
    //                 {
    //                     tag: "button",
    //                     className: "cancel-button",
    //                     children: Clockworks.localeMap("Cancel"),
    //                     onclick: async () => instance.close((await data.onCancel?.()) ?? null),
    //                 },
    //                 {
    //                     tag: "button",
    //                     className: "default-button",
    //                     children: Clockworks.localeMap("OK"),
    //                     onclick: async () => instance.close(await data.onCommit()),
    //                 },
    //             ])
    //         ],
    //         onClose: async () => instance.close((await data.onCancel?.()) ?? null),
    //     })
    // );
    export const closeButton = (onclick?: () => unknown) =>
    ({
        tag: "button",
        className: "default-button",
        children: label("Close"),
        onclick,
    });
    export const popupCloseOperator = (onclick?: () => unknown) =>
        Tektite.$div("popup-operator")(closeButton(onclick));
    export const themeSettingsPopup = async (settings: Type.Settings = Storage.Settings.get()): Promise<boolean> =>
        await tektite.screen.popup<boolean>
        (
            async instance =>
            {
                const init = settings.theme ?? "auto";
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "check-button-list" });
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
                                    className: `check-button ${key === (settings.theme ?? "auto") ? "checked": ""}`,
                                    children:
                                    [
                                        await Resource.loadSvgOrCache("tektite-check-icon"),
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
                        popupTitle(label("Theme setting")),
                        checkButtonList,
                        popupCloseOperator(() => instance.close()),
                    ],
                };
            }
        );
    export const progressBarStyleSettingsPopup = async (settings: Type.Settings = Storage.Settings.get()): Promise<boolean> =>
        await tektite.screen.popup<boolean>
        (
            async instance =>
            {
                const init = settings.progressBarStyle ?? "auto";
                let selected = init;
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "check-button-list" });
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
                                className: `check-button ${key === selected ? "checked": ""}`,
                                children:
                                [
                                    await Resource.loadSvgOrCache("tektite-check-icon"),
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
                        popupTitle(label("Progress Bar Style setting")),
                        checkButtonList,
                        popupCloseOperator(() => instance.close()),
                    ],
                    onClose: async () => instance.set(init !== selected),
                };
            }
        );
    export const localeSettingsPopup = async (settings: Type.Settings = Storage.Settings.get()): Promise<boolean> =>
        await tektite.screen.popup<boolean>
        (
            async instance =>
            {
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    [
                        {
                            tag: "button",
                            className: `check-button ${"@auto" === (settings.locale ?? "@auto") ? "checked": ""}`,
                            children:
                            [
                                await Resource.loadSvgOrCache("tektite-check-icon"),
                                Tektite.$span("")(label("language.auto")),
                            ],
                            onclick: async () =>
                            {
                                if (null !== (settings.locale ?? null))
                                {
                                    settings.locale = null;
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
                                    className: `check-button ${key === (settings.locale ?? "@auto") ? "checked": ""}`,
                                    children:
                                    [
                                        await Resource.loadSvgOrCache("tektite-check-icon"),
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
                        popupTitle(label("Language setting")),
                        checkButtonList,
                        popupCloseOperator(() => instance.close()),
                    ],
                };
            }
        );
    export const colorSettingsPopup = async (settings = Storage.RainbowClock.colorPattern.get()): Promise<boolean> =>
        await tektite.screen.popup<boolean>
        (
            async instance =>
            {
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    await Promise.all
                    (
                        Object.keys(Type.rainbowClockColorPatternMap).map
                        (
                            async (key: Type.rainbowClockColorPatternType) =>
                            ({
                                tag: "button",
                                className: `check-button ${key === settings ? "checked": ""}`,
                                children:
                                [
                                    await Resource.loadSvgOrCache("tektite-check-icon"),
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
                        popupTitle(label("Color setting")),
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
            value: Domain.timeLongCoreStringFromTick(tick),
            required: "",
        });
        return await prompt
        ({
            title: message,
            content: inputTime,
            onCommit: () => Domain.parseTime(inputTime.value) ?? tick,
        });
    };
    export const dateTimeTickPrompt = async (message: string, tick: number): Promise<number | null> =>
    {
        const inputDate = Tektite.$make(HTMLInputElement)
        ({
            tag: "input",
            type: "date",
            value: Domain.dateCoreStringFromTick(tick),
            required: "",
        });
        const inputTime = Tektite.$make(HTMLInputElement)
        ({
            tag: "input",
            type: "time",
            value: Domain.timeShortCoreStringFromTick(Domain.getTime(tick)),
            required: "",
        });
        return await prompt
        ({
            title: message,
            content:
            [
                inputDate,
                inputTime,
            ],
            onCommit: () => Domain.parseDate(`${inputDate.value}T${inputTime.value}`)?.getTime() ?? tick,
        });
    };
    export const sharePopup = async (title: string, url: string = location.href) =>
        await tektite.screen.popup<unknown>
        (
            async instance =>
            ({
                // className: "add-remove-tags-popup",
                children:
                [
                    popupTitle(Tektite.$labelSpan("シェア / Share")),
                    Tektite.$div("menu-button-list")
                    ([
                        {
                            tag: "button",
                            className: "menu-item-button",
                            children: Tektite.$span("")(Tektite.$labelSpan("Tweet / ツイート")),
                            onclick: async () =>
                            {
                                location.href='https://twitter.com/intent/tweet?text='+encodeURIComponent('【'+title+'】 '+url +' ');
                                instance.close();
                            }
                        },
                        {
                            tag: "button",
                            className: "menu-item-button",
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
        menu: await Promise.all
        (
            Type.applicationIdList.map
            (
                async (i: Type.ApplicationType) => tektite.menu.linkItem
                (
                    [ await Resource.loadSvgOrCache(Type.applicationList[i].icon), Type.applicationList[i].title, ],
                    { application: i },
                    applicationType === i ? "current-item": undefined,
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
                        await Resource.loadSvgOrCache(0 === i ? zeroIcon: "tektite-flash-icon"),
                        Tektite.$labelSpan(0 === i ? Clockworks.localeMap(zeroLabel): `${Clockworks.localeMap("Interval")}: ${Domain.makeTimerLabel(i)}`),
                    ],
                    async () =>
                    {
                        setter(i);
                        tektite.screen.clearLastMouseDownTarget();
                        tektite.screen.getScreenCoverList().forEach(i => i.click());
                        await reload();
                    },
                    flashInterval === i ? "current-item": undefined
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
                    await Resource.loadSvgOrCache("tektite-flash-icon"),
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
        title: 0 === flashInterval ? Clockworks.localeMap(zeroLabel): `${Clockworks.localeMap("Interval")}: ${Domain.makeTimerLabel(flashInterval)}`,
        menu: await screenHeaderFlashSegmentMenu(adder, flashIntervalPreset, flashInterval, setter, zeroIcon, zeroLabel),
    });
    export const fullscreenMenuItem = async () => tektite.fullscreen.enabled() ?
        (
            null === tektite.fullscreen.element() ?
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
                    tektite.locale.setLocale(Storage.Settings.get().locale);
                    await reload();
                }
            }
        );
    export const resetNeverStopwatchMenuItem = async () =>
        tektite.menu.item
        (
            label("Remove all stamps"),
            async () => await Operate.NeverStopwatch.removeAllStamps(),
            "delete-button"
        );
    export const resetCountdownTimerMenuItem = async () =>
        tektite.menu.item
        (
            label("Remove all alarms"),
            async () => await Operate.CountdownTimer.removeAllAlarms(),
            "delete-button"
        );
    export const resetElapsedTimerMenuItem = async () =>
        tektite.menu.item
        (
            label("Remove all alarms"),
            async () => await Operate.ElapsedTimer.removeAllEvents(),
            "delete-button"
        );
    export const resetRainbowClockMenuItem = async () =>
        tektite.menu.item
        (
            label("Initialize timezone list"),
            async () => await Operate.RainbowClock.reset(),
            "delete-button"
        );
    export const githubMenuItem = async () =>
        tektite.externalLink
        ({
            href: config.repositoryUrl,
            children: tektite.menu.item(Tektite.$labelSpan("GitHub")),
        });
    export const welcomeScreenMenu = async () =>
    [
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
                    Tektite.$div("application-icon icon")(await Resource.loadSvgOrCache("application-icon")),
                    Tektite.$span("logo-text")(config.applicationTitle)
                ]),
                Tektite.$div("button-list")
                (
                    Type.applicationIdList.map
                    (
                        (i: Type.ApplicationType) =>
                        tektite.internalLink
                        ({
                            href: { application: i },
                            children:
                            {
                                tag: "button",
                                className: "default-button main-button long-button",
                                children: Tektite.$labelSpan(Type.applicationList[i].title),
                                // onclick: async () => await showNeverStopwatchScreen(),
                            }
                        }),
                    )
                ),
            ],
            trail: Tektite.$div("description")
            (
                Tektite.$tag("ul")("locale-parallel-off")
                ([
                    Tektite.$tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                ])
            ),
        }
    });
    export const showWelcomeScreen = async () =>
    {
        document.body.classList.remove("tektite-hide-scroll-bar");
        const updateWindow = async (event: Tektite.UpdateWindowEventEype) =>
        {
            switch(event)
            {
            case "high-resolution-timer":
                break;
            case "timer":
                break;
            case "storage":
                break;
            case "operate":
                break;
            }
        };
        Tektite.setBodyColor(Color.getSolidRainbowColor(0));
        await showWindow(await welcomeScreen(), updateWindow);
        await updateWindow("timer");
    };
    export const flashIntervalLabel = async (entry: HeaderSegmentSource) =>
    ({
        tag: "div",
        className: "flash-interval",
        children:
        [
            await Resource.loadSvgOrCache(entry.icon),
            entry.title,
        ],
        onclick: async () => tektite.screen.popup
        ({
            className: "bare-popup",
            children: "function" === typeof entry.menu ? await entry.menu(): entry.menu,
        }),
    });
    export const itemFooter = async <T>(item: T, application: Type.ApplicationType, getShareTitle: (item: T) => string, isSaved: (item: T) => boolean, save: (item: T) => Promise<unknown>) =>
        null !== item ?
            Tektite.$div("button-list")
            ([
                tektite.internalLink
                ({
                    href: { application, },
                    children:
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: "閉じる / Close",
                    }
                }),
                isSaved(item) ?
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: "シェア / Share",
                        onclick: async () => await sharePopup(getShareTitle(item)),
                    }:
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: "保存 / Save",
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
    export const updateTitle = () =>
    {
        document.title = minamo.dom.getDivsByClassName(tektite.header.getElement(), "tektite-segment-title")
            ?.map(div => div.innerText)
            // ?.reverse()
            ?.join(" / ")
            ?? config.applicationTitle;
    };
    export const showWindow = async (screen: ScreenSource, updateWindow?: (event: Tektite.UpdateWindowEventEype) => unknown) =>
    {
        await tektite.screen.show(screen, updateWindow);
        Tektite.setBackgroundColor(Color.getSolidRainbowColor(0));
        updateTitle();
        resizeFlexList();
    };
    export const setProgress = (percent: null | number, color?: string) =>
        Tektite.setProgress(Storage.Settings.get().progressBarStyle ?? "auto", percent, color);
    export const resizeFlexList = () =>
    {
        const minColumns = 1 +Math.floor(window.innerWidth / 780);
        const maxColumns = Math.min(12, Math.max(minColumns, Math.floor(window.innerWidth / 450)));
        const FontRemUnit = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const border = FontRemUnit *26 +10;
        minamo.dom.getDivsByClassName(document, "tektite-menu-popup").forEach
        (
            header =>
            {
                minamo.dom.toggleCSSClass(header, "locale-parallel-on", 2 <= minColumns);
                minamo.dom.toggleCSSClass(header, "locale-parallel-off", minColumns < 2);
            }
        );
        [document.getElementById("tektite-screen-toast") as HTMLDivElement].forEach
        (
            header =>
            {
                minamo.dom.toggleCSSClass(header, "locale-parallel-on", 2 <= minColumns);
                minamo.dom.toggleCSSClass(header, "locale-parallel-off", minColumns < 2);
            }
        );
        minamo.dom.getDivsByClassName(document, "button-list").forEach
        (
            header =>
            {
                minamo.dom.toggleCSSClass(header, "locale-parallel-on", true);
                minamo.dom.toggleCSSClass(header, "locale-parallel-off", false);
            }
        );
        minamo.dom.getDivsByClassName(document, "column-flex-list").forEach
        (
            list =>
            {
                const length = list.childNodes.length;
                list.classList.forEach
                (
                    i =>
                    {
                        if (/^max-column-\d+$/.test(i))
                        {
                            list.classList.remove(i);
                        }
                    }
                );
                if (length <= 1 || maxColumns <= 1)
                {
                    minamo.dom.removeCSSStyleProperty(list.style, "height");
                }
                else
                {
                    const height = window.innerHeight -list.offsetTop;
                    const itemHeight = (list.childNodes[0] as HTMLElement).offsetHeight +1;
                    const columns = Math.min(maxColumns, Math.ceil(length / Math.max(1.0, Math.floor(height / itemHeight))));
                    const row = Math.max(Math.ceil(length /columns), Math.min(length, Math.floor(height / itemHeight)));
                    minamo.dom.setStyleProperty(list, "height", `${row *itemHeight}px`);
                    minamo.dom.addCSSClass(list, `max-column-${columns}`);
                }
                if (0 < length)
                {
                    const itemWidth = Math.min(window.innerWidth, (list.childNodes[0] as HTMLElement).offsetWidth);
                    minamo.dom.toggleCSSClass(list, "locale-parallel-on", border < itemWidth);
                    minamo.dom.toggleCSSClass(list, "locale-parallel-off", itemWidth <= border);
                }
                list.classList.toggle("empty-list", length <= 0);
            }
        );
        minamo.dom.getDivsByClassName(document, "row-flex-list").forEach
        (
            list =>
            {
                const length = list.childNodes.length;
                list.classList.forEach
                (
                    i =>
                    {
                        if (/^max-column-\d+$/.test(i))
                        {
                            list.classList.remove(i);
                        }
                    }
                );
                if (0 < length)
                {
                    // const columns = Math.min(maxColumns, Math.max(1, length));
                    // list.classList.add(`max-column-${columns}`);
                    const height = window.innerHeight -list.offsetTop;
                    const itemHeight = (list.childNodes[0] as HTMLElement).offsetHeight;
                    const columns = list.classList.contains("compact-flex-list") ?
                        Math.min(maxColumns, length):
                        Math.min(maxColumns, Math.ceil(length / Math.max(1.0, Math.floor(height / itemHeight))));
                    minamo.dom.addCSSClass(list, `max-column-${columns}`);
                    const itemWidth = Math.min(window.innerWidth, (list.childNodes[0] as HTMLElement).offsetWidth);
                    minamo.dom.toggleCSSClass(list, "locale-parallel-on", border < itemWidth);
                    minamo.dom.toggleCSSClass(list, "locale-parallel-off", itemWidth <= border);
                }
                minamo.dom.toggleCSSClass(list, "empty-list", length <= 0);
            }
        );
    };
    let onWindowResizeTimestamp = 0;
    export const onWindowResize = () =>
    {
        const timestamp = onWindowResizeTimestamp = new Date().getTime();
        setTimeout
        (
            () =>
            {
                if (timestamp === onWindowResizeTimestamp)
                {
                    resizeFlexList();
                    tektite.screen.adjustPageFooterPosition();
                }
            },
            100,
        );
    };
    export const onKeydown = (event: KeyboardEvent) =>
    {
        if ( ! tektite.key.isComposing(event))
        {
            switch(event.key)
            {
                case "Enter":
                    minamo.dom.getElementsByClassName<HTMLDivElement>(document, "popup")
                        .filter((_i, ix, list) => (ix +1) === list.length)
                        .forEach(popup => minamo.dom.getElementsByClassName<HTMLButtonElement>(popup, "default-button")?.[0]?.click());
                    break;
                case "Escape":
                    if (tektite.escape())
                    {
                        event.preventDefault();
                    }
                    break;
            }
            const focusedElementTagName = document.activeElement?.tagName?.toLowerCase() ?? "";
            if (["input", "textarea"].indexOf(focusedElementTagName) < 0)
            {
                switch(event.key.toLowerCase())
                {
                    case "f":
                        if (tektite.fullscreen.enabled())
                        {
                            if(null === tektite.fullscreen.element())
                            {
                                tektite.fullscreen.request();
                            }
                            else
                            {
                                tektite.fullscreen.exit();
                            }
                        }
                        break;
                }
            }
        }
    };
    let lastMouseMouseAt = 0;
    export const onMouseMove = (_evnet: MouseEvent) =>
    {
        if (tektite.fullscreen.enabled())
        {
            const now = lastMouseMouseAt = new Date().getTime();
            if (document.body.classList.contains("tektite-sleep-mouse"))
            {
                document.body.classList.remove("tektite-sleep-mouse");
            }
            if (tektite.fullscreen.element())
            {
                setTimeout
                (
                    () =>
                    {
                        if (tektite.fullscreen.element() && now === lastMouseMouseAt)
                        {
                            if ( ! document.body.classList.contains("tektite-sleep-mouse"))
                            {
                                document.body.classList.add("tektite-sleep-mouse");
                            }
                        }
                    },
                    3000
                );
            }
        }
    };
    export const onFullscreenChange = (_event: Event) =>
    {
        onWindowResize();
    };
    export const onWebkitFullscreenChange = (event: Event) =>
    {
        onWindowResize();
        tektite.onWebkitFullscreenChange(event);
    };
    export type ItemStateType = "nothing" | "regular" | "irregular" | "invalid";
    export const itemState = <T>(itemJson: string, item: T): ItemStateType =>
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
    export const regulateLocation = <T extends Type.PageItemType>(application: Type.ApplicationType, itemJson: string, item: T) =>
    {
        switch(itemState(itemJson, item))
        {
        case "nothing":
            return true;
        case "regular":
            return true;
        case "irregular":
            Render.rewriteShowUrl(Domain.makePageParams(application, item));
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
        document.getElementById("tektite-screen-body").scrollTo(0,0);
        // const urlParams = getUrlParams(url);
        const hash = Base.getUrlHash(url).split("/");
        const applicationType = hash[0] as Type.ApplicationType;
        const itemJson = hash[1];
        const application =
        {
            "RainbowClock":
            {
                show: async item => await RainbowClockRender.showRainbowClockScreen(item),
                parseItem: json => Domain.parseTimezone(json),
            },
            "CountdownTimer":
            {
                show: async item => await CountdownTimerRender.showCountdownTimerScreen(item),
                parseItem: json => Domain.parseAlarm(json),
            },
            "ElapsedTimer":
            {
                show: async item => await ElapsedTimerRender.showElapsedTimerScreen(item),
                parseItem: json => Domain.parseEvent(json),
            },
            "NeverStopwatch":
            {
                show: async item => await NeverStopwatchRender.showNeverStopwatchScreen(item),
                parseItem: json => Domain.parseStamp(json),
            },
        }[applicationType] ??
        {
            show: async () => await Render.showWelcomeScreen(),
            parseItem: () => null,
        };
        const item = application.parseItem(itemJson);
        if (regulateLocation(applicationType, itemJson, item))
        {
            await application.show(item);
        }
        else
        {
            return false;
        }
        return true;
    };
    export const showUrl = async (data: Type.PageParams) =>
    {
        const url = Domain.makeUrl(data);
        if (await showPage(url))
        {
            history.pushState(null, Type.applicationList[data.application]?.title ?? config.applicationTitle, url);
        }
    };
    export const rewriteShowUrl = async (data: Type.PageParams) =>
    {
        const url = Domain.makeUrl(data);
        if (await showPage(url))
        {
            history.replaceState(null, Type.applicationList[data.application]?.title ?? config.applicationTitle, url);
        }
    };
    export const reload = async () => await showPage();
}
