import { minamo } from "../../nephila/minamo.js";
import { Clockworks, tektite } from "..";
import { Tektite } from "../../tektite.js/script";
import { Type } from "../type";
import { Base } from "../base";
import { Color } from "../color";
import { Storage } from "../storage";
import { Domain } from "../domain";
import { Resource } from "./resource";
import { Operate as RenderOperate } from "./operate";
import { Render as RainbowClockRender } from "../application/rainbowclock/render";
import { Render as CountdownTimerRender } from "../application/countdowntimer/render";
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
    //     const input = $make(HTMLInputElement)
    //     ({
    //         tag: "input",
    //         type: "text",
    //         value: _default,
    //     });
    //     return await new Promise
    //     (
    //         resolve =>
    //         {
    //             let result: string | null = null;
    //             const ui = popup
    //             ({
    //                 children:
    //                 [
    //                     $tag("h2")("")(message ?? locale.map("please input")),
    //                     input,
    //                     $div("popup-operator")
    //                     ([
    //                         {
    //                             tag: "button",
    //                             className: "cancel-button",
    //                             children: locale.map("Cancel"),
    //                             onclick: () =>
    //                             {
    //                                 result = null;
    //                                 ui.close();
    //                             },
    //                         },
    //                         {
    //                             tag: "button",
    //                             className: "default-button",
    //                             children: locale.map("OK"),
    //                             onclick: () =>
    //                             {
    //                                 result = input.value;
    //                                 ui.close();
    //                             },
    //                         },
    //                     ]),
    //                 ],
    //                 onClose: async () => resolve(result),
    //             });
    //             input.setSelectionRange(0, _default?.length ?? 0);
    //             input.focus();
    //         }
    //     );
    // };
    // // export const prompt = systemPrompt;
    // export const prompt = customPrompt;
    // // export const alert = (message: string) => window.alert(message);
    // export const alert = (message: string) => makeToast({ content: message, });

    export const systemConfirm = (message: string) => window.confirm(message);
    // export const confirm = systemConfirm;
    export const dateTimePrompt = async (message: string, _default: number): Promise<string | null> =>
    {
        const inputDate = Tektite.$make(HTMLInputElement)
        ({
            tag: "input",
            type: "date",
            value: Domain.dateCoreStringFromTick(_default),
            required: "",
        });
        const inputTime = Tektite.$make(HTMLInputElement)
        ({
            tag: "input",
            type: "time",
            value: Domain.timeFullCoreStringFromTick(Domain.getTime(_default)),
            required: "",
        });
        return await new Promise
        (
            resolve =>
            {
                let result: string | null = null;
                const ui = tektite.screen.popup
                ({
                    children:
                    [
                        Tektite.$tag("h2")("")(message),
                        inputDate,
                        inputTime,
                        Tektite.$div("popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "cancel-button",
                                children: Clockworks.localeMap("Cancel"),
                                onclick: () =>
                                {
                                    result = null;
                                    ui.close();
                                },
                            },
                            {
                                tag: "button",
                                className: "default-button",
                                children: Clockworks.localeMap("OK"),
                                onclick: () =>
                                {
                                    result = `${inputDate.value}T${inputTime.value}`;
                                    ui.close();
                                },
                            },
                        ])
                    ],
                    onClose: async () => resolve(result),
                });
            }
        );
    };
    export const themeSettingsPopup = async (settings: Type.Settings = Storage.Settings.get()): Promise<boolean> =>
    {
        const init = settings.theme ?? "auto";
        return await new Promise
        (
            async resolve =>
            {
                let result = false;
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
                                            result = init !== key;
                                        }
                                    }
                                })
                            )
                        )
                    ]
                );
                await checkButtonListUpdate();
                const ui = tektite.screen.popup
                ({
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        Tektite.$tag("h2")("")(label("Theme setting")),
                        checkButtonList,
                        Tektite.$div("popup-operator")
                        ([{
                            tag: "button",
                            className: "default-button",
                            children: label("Close"),
                            onclick: () =>
                            {
                                ui.close();
                            },
                        }])
                    ],
                    onClose: async () => resolve(result),
                });
            }
        );
    };
    export const progressBarStyleSettingsPopup = async (settings: Type.Settings = Storage.Settings.get()): Promise<boolean> =>
    {
        const init = settings.progressBarStyle ?? "auto";
        let selected = init;
        return await new Promise
        (
            async resolve =>
            {
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    [
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
                    ]
                );
                await checkButtonListUpdate();
                const ui = tektite.screen.popup
                ({
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        Tektite.$tag("h2")("")(label("Progress Bar Style setting")),
                        checkButtonList,
                        Tektite.$div("popup-operator")
                        ([{
                            tag: "button",
                            className: "default-button",
                            children: label("Close"),
                            onclick: () =>
                            {
                                ui.close();
                            },
                        }])
                    ],
                    onClose: async () =>
                    {
                        resolve(init !== selected);
                    },
                });
            }
        );
    };
    export const localeSettingsPopup = async (settings: Type.Settings = Storage.Settings.get()): Promise<boolean> =>
    {
        return await new Promise
        (
            async resolve =>
            {
                let result = false;
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
                                    result = true;
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
                                            result = true;
                                            await checkButtonListUpdate();
                                        }
                                    }
                                })
                            )
                        )
                    ]
                );
                await checkButtonListUpdate();
                const ui = tektite.screen.popup
                ({
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        Tektite.$tag("h2")("")(label("Language setting")),
                        checkButtonList,
                        Tektite.$div("popup-operator")
                        ([{
                            tag: "button",
                            className: "default-button",
                            children: label("Close"),
                            onclick: () =>
                            {
                                ui.close();
                            },
                        }])
                    ],
                    onClose: async () => resolve(result),
                });
            }
        );
    };
    export const colorSettingsPopup = async (settings = Storage.RainbowClock.colorPattern.get()): Promise<boolean> =>
    {
        return await new Promise
        (
            async resolve =>
            {
                let result = false;
                const checkButtonList = Tektite.$make(HTMLDivElement)({ className: "check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    [
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
                                            result = true;
                                            await checkButtonListUpdate();
                                        }
                                    }
                                })
                            )
                        )
                    ]
                );
                await checkButtonListUpdate();
                const ui = tektite.screen.popup
                ({
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        Tektite.$tag("h2")("")(label("Color setting")),
                        checkButtonList,
                        Tektite.$div("popup-operator")
                        ([{
                            tag: "button",
                            className: "default-button",
                            children: label("Close"),
                            onclick: () =>
                            {
                                ui.close();
                            },
                        }])
                    ],
                    onClose: async () => resolve(result),
                });
            }
        );
    };
    export const timePrompt = async (message: string, tick: number = 0): Promise<number | null> =>
    {
        const inputTime = Tektite.$make(HTMLInputElement)
        ({
            tag: "input",
            type: "time",
            value: Domain.timeLongCoreStringFromTick(tick),
            required: "",
        });
        return await new Promise
        (
            resolve =>
            {
                let result: number | null = null;
                const ui = tektite.screen.popup
                ({
                    children:
                    [
                        Tektite.$tag("h2")("")(message),
                        inputTime,
                        Tektite.$div("popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "cancel-button",
                                children: Clockworks.localeMap("Cancel"),
                                onclick: () =>
                                {
                                    result = null;
                                    ui.close();
                                },
                            },
                            {
                                tag: "button",
                                className: "default-button",
                                children: Clockworks.localeMap("OK"),
                                onclick: () =>
                                {
                                    result = Domain.parseTime(inputTime.value) ?? tick;
                                    ui.close();
                                },
                            },
                        ])
                    ],
                    onClose: async () => resolve(result),
                });
            }
        );
    };
    export const dateIimePrompt = async (message: string, tick: number): Promise<number | null> =>
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
        return await new Promise
        (
            resolve =>
            {
                let result: number | null = null;
                const ui = tektite.screen.popup
                ({
                    children:
                    [
                        Tektite.$tag("h2")("")(message),
                        inputDate,
                        inputTime,
                        Tektite.$div("popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "cancel-button",
                                children: Clockworks.localeMap("Cancel"),
                                onclick: () =>
                                {
                                    result = null;
                                    ui.close();
                                },
                            },
                            {
                                tag: "button",
                                className: "default-button",
                                children: Clockworks.localeMap("OK"),
                                onclick: () =>
                                {
                                    result = Domain.parseDate(`${inputDate.value}T${inputTime.value}`)?.getTime() ?? tick;
                                    ui.close();
                                },
                            },
                        ])
                    ],
                    onClose: async () => resolve(result),
                });
            }
        );
    };
    export const sharePopup = async (title: string, url: string = location.href) => await new Promise<void>
    (
        async resolve =>
        {
            const ui = tektite.screen.popup
            ({
                // className: "add-remove-tags-popup",
                children:
                [
                    Tektite.$tag("h2")("")(Tektite.$labelSpan("シェア / Share")),
                    Tektite.$div("menu-button-list")
                    ([
                        {
                            tag: "button",
                            className: "menu-item-button",
                            children: Tektite.$span("")(Tektite.$labelSpan("Tweet / ツイート")),
                            onclick: async () =>
                            {
                                location.href='https://twitter.com/intent/tweet?text='+encodeURIComponent('【'+title+'】 '+url +' ');
                                ui.close();
                            }
                        },
                        {
                            tag: "button",
                            className: "menu-item-button",
                            children: Tektite.$span("")(Tektite.$labelSpan("Copy URL / URL をコピー")),
                            onclick: async () =>
                            {
                                Operate.copyToClipboard(url, "URL");
                                ui.close();
                            }
                        }
                    ]),
                    Tektite.$div("popup-operator")
                    ([
                        {
                            tag: "button",
                            className: "default-button",
                            children: label("Close"),
                            onclick: () =>
                            {
                                ui.close();
                            },
                        }
                    ])
                ],
                onClose: async () => resolve(),
            });
        }
    );
    export const monospace = (data: { className: string, label?: minamo.dom.Source, value: minamo.dom.Source }) => Tektite.$div(data.className)
    ([
        data.label ?? [],
        Tektite.$span("value monospace")(data.value),
    ]);
    export const stampItem = async (tick: number, interval: number | null) => Tektite.$div("stamp-item flex-item")
    ([
        Tektite.$div("item-header")
        ([
            tektite.internalLink
            ({
                className: "item-title",
                href: Domain.makePageParams("NeverStopwatch", tick),
                children:
                [
                    await Resource.loadSvgOrCache("tektite-tick-icon"),
                    monospace({ className: "tick-elapsed-time", value: label("Elapsed time"), }),
                ]
            }),
            Tektite.$div("item-operator")
            ([
                await tektite.menu.button(await stampItemMenu(tick)),
            ]),
        ]),
        Tektite.$div("item-information")
        ([
            monospace
            ({
                className: "tick-timestamp",
                label: label("Timestamp"),
                value: Domain.dateFullStringFromTick(tick),
            }),
            monospace
            ({
                className: "tick-interval",
                label: label("Interval"),
                value: Domain.timeLongStringFromTick(interval),
            }),
        ]),
    ]);
    export const stampItemMenu = async (tick: number) =>
    [
        tektite.menu.item
        (
            label("Edit"),
            async () =>
            {
                const result = Domain.parseDate(await dateTimePrompt(Clockworks.localeMap("Edit"), tick));
                if (null !== result)
                {
                    const newTick = Domain.getTicks(result);
                    if (tick !== Domain.getTicks(result))
                    {
                        if (0 <= newTick && newTick <= Domain.getTicks())
                        {
                            await Operate.NeverStopwatch.edit(tick, newTick);
                        }
                        else
                        {
                            tektite.toast.make
                            ({
                                content: label("A date and time outside the valid range was specified."),
                                isWideContent: true,
                            });
                        }
                    }
                }
            }
        ),
        tektite.menu.item
        (
            label("Remove"),
            async () => await Operate.NeverStopwatch.removeStamp(tick),
            "delete-button"
        )
    ];
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

    export const screenHeaderStampSegment = async (item: number | null, ticks: number[]): Promise<HeaderSegmentSource> =>
    ({
        icon: "tektite-tick-icon",
        title: Domain.dateFullStringFromTick(item),
        menu: await Promise.all
        (
            ticks
                .concat([item])
                .sort(minamo.core.comparer.make([i => -i]))
                .filter((i, ix, list) => ix === list.indexOf(i))
                .map
                (
                    async i => tektite.menu.linkItem
                    (
                        [ await Resource.loadSvgOrCache("tektite-tick-icon"), Tektite.$span("monospace")(Domain.dateFullStringFromTick(i)), ],
                        Domain.makePageParams("NeverStopwatch", i),
                        item === i ? "current-item": undefined,
                    )
                )
        )
    });
    export const screenHeaderEventSegment = async (item: Type.EventEntry | null, alarms: Type.EventEntry[]): Promise<HeaderSegmentSource> =>
    ({
        icon: "tektite-tick-icon",
        title: item.title,
        menu: await Promise.all
        (
            alarms
                .concat([item])
                .sort(minamo.core.comparer.make([i => i.tick]))
                .filter((i, ix, list) => ix === list.map(a => JSON.stringify(a)).indexOf(JSON.stringify(i)))
                .map
                (
                    async i => tektite.menu.linkItem
                    (
                        [ await Resource.loadSvgOrCache("tektite-tick-icon"), Tektite.$labelSpan(i.title), Tektite.$span("value monospace")(Domain.dateStringFromTick(i.tick)), ],
                        Domain.makePageParams("ElapsedTimer", i),
                        JSON.stringify(item) === JSON.stringify(i) ? "current-item": undefined,
                    )
                )
        )
    });
    export const screenHeaderTimezoneSegment = async (item: Type.TimezoneEntry | null, timezones: Type.TimezoneEntry[]): Promise<HeaderSegmentSource> =>
    ({
        icon: "tektite-pin-icon",
        title: item.title,
        menu: await Promise.all
        (
            timezones
                .concat([item])
                .sort(minamo.core.comparer.make([i => i.offset]))
                .filter((i, ix, list) => ix === list.map(a => JSON.stringify(a)).indexOf(JSON.stringify(i)))
                .map
                (
                    async i => tektite.menu.linkItem
                    (
                        [ await Resource.loadSvgOrCache("tektite-tick-icon"), Tektite.$labelSpan(i.title), Tektite.$span("value monospace")(Domain.timezoneOffsetString(i.offset)), ],
                        Domain.makePageParams("RainbowClock", i),
                        JSON.stringify(item) === JSON.stringify(i) ? "current-item": undefined,
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
        document.body.classList.remove("hide-scroll-bar");
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
    export const neverStopwatchScreenMenu = async () =>
    [
        await fullscreenMenuItem(),
        await themeMenuItem(),
        await progressBarStyleMenuItem(),
        await languageMenuItem(),
        await resetNeverStopwatchMenuItem(),
        await githubMenuItem(),
    ];
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
    export const neverStopwatchScreenBody = async (item: number | null, ticks: number[]) =>
    ({
        primary:
        {
            body:
            [
                Tektite.$div("current-item")
                ([
                    monospace
                    ({
                        className: "previous-timestamp",
                        value: null !== item ?
                            Domain.dateFullStringFromTick(item):
                            (
                                0 < ticks.length ?
                                Domain.dateFullStringFromTick(ticks[0]):
                                ""
                            )
                    }),
                    monospace({ className: "capital-interval", value: Domain.timeLongStringFromTick(0), }),
                    monospace({ className: "current-timestamp", value: Domain.dateFullStringFromTick(Domain.getTicks()), }),
                ]),
                await flashIntervalLabel
                (
                    await screenHeaderFlashSegment
                    (
                        Storage.NeverStopwatch.recentlyFlashInterval.add,
                        Domain.getFlashIntervalPreset()
                            .concat(Storage.NeverStopwatch.recentlyFlashInterval.get())
                            .sort(minamo.core.comparer.make([i => i]))
                            .filter((i, ix, list) => ix === list.indexOf(i)),
                        Storage.NeverStopwatch.flashInterval.get(),
                        Storage.NeverStopwatch.flashInterval.set
                    )
                ),
                Tektite.$div("button-list")
                ({
                    tag: "button",
                    className: "default-button main-button long-button",
                    children: label("Stamp"),
                    onclick: async () => await Operate.NeverStopwatch.stamp(Domain.getTicks())
                }),
            ],
            footer: await itemFooter(item, "NeverStopwatch", () => "Elapsed Time / 経過時間", Storage.NeverStopwatch.Stamps.isSaved, Operate.NeverStopwatch.save),
        },
        trail: null !== item ?
            undefined:
            [
                Tektite.$div("row-flex-list stamp-list")
                (
                    await Promise.all
                    (
                        ticks.map
                        (
                            (tick, index) => stampItem
                            (
                                tick,
                                "number" === typeof ticks[index +1] ? tick -ticks[index +1]: null
                            )
                        )
                    )
                ),
                Tektite.$div("description")
                (
                    Tektite.$tag("ul")("locale-parallel-off")
                    ([
                        Tektite.$tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        Tektite.$tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                        Tektite.$tag("li")("")([label("You can use a link like this too:"), { tag: "a", style: "margin-inline-start:0.5em;", href: Domain.makeStampUrl("new"), children: Clockworks.localeMap("Stamp"), }, ]),
                    ])
                ),
            ]
    });
    export const neverStopwatchScreen = async (item: number | null, ticks: number[]): Promise<ScreenSource> =>
    ({
        className: "never-stopwatch-screen",
        header: null === item ?
        {
            items:
            [
                await screenHeaderHomeSegment(),
                await screenHeaderApplicationSegment("NeverStopwatch"),
                // await screenHeaderFlashSegment(Storage.NeverStopwatch.flashInterval.get()),
            ],
            menu: neverStopwatchScreenMenu,
            parent: { },
        }:
        {
            items:
            [
                await screenHeaderHomeSegment(),
                await screenHeaderApplicationSegment("NeverStopwatch"),
                // await screenHeaderFlashSegment(Storage.NeverStopwatch.flashInterval.get()),
                await screenHeaderStampSegment(item, ticks),
            ],
            menu: Storage.NeverStopwatch.Stamps.isSaved(item) ? () => stampItemMenu(item): undefined,
            parent: { application: "NeverStopwatch" },
        },
        body: await neverStopwatchScreenBody(item, ticks)
    });
    let previousPrimaryStep = 0;
    export const showNeverStopwatchScreen = async (item: number | null) =>
    {
        const applicationTitle = Type.applicationList["NeverStopwatch"].title;
        document.body.classList.add("hide-scroll-bar");
        let ticks = Storage.NeverStopwatch.Stamps.get();
        const updateWindow = async (event: Tektite.UpdateWindowEventEype) =>
        {
            const screen = document.getElementById("screen") as HTMLDivElement;
            const now = new Date();
            const tick = Domain.getTicks(now);
            const current = item ?? ticks[0] ?? null;
            const flashInterval = Storage.NeverStopwatch.flashInterval.get();
            switch(event)
            {
                case "high-resolution-timer":
                    (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeLongStringFromTick(tick -(current ?? tick));
                    const capitalTime = Domain.dateStringFromTick(tick);
                    const capitalTimeSpan = screen.getElementsByClassName("current-timestamp")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                    minamo.dom.setProperty(capitalTimeSpan, "innerText", capitalTime);
                    if (0 < flashInterval && null !== current)
                    {
                        const elapsed = Domain.getTicks() -current;
                        const unit = flashInterval; // *60 *1000;
                        const primaryStep = Math.floor(elapsed / unit);
                        if (primaryStep === previousPrimaryStep +1 && (elapsed % unit) < 5 *1000)
                        {
                            tektite.screen.flash();
                        }
                        const currentColor = Color.getSolidRainbowColor(primaryStep);
                        Tektite.setBackgroundColor(currentColor);
                        previousPrimaryStep = primaryStep;
                        const rate = ((Domain.getTicks() -current) %unit) /unit;
                        const nextColor = Color.getSolidRainbowColor(primaryStep +1);
                        setProgress(rate, nextColor);
                        // setBodyColor(nextColor);
                        tektite.header.getElement().classList.add("with-screen-prgress");
                    }
                    else
                    {
                        previousPrimaryStep = 0;
                        setProgress(null);
                        tektite.header.getElement().classList.remove("with-screen-prgress");
                        const currentColor = Color.getSolidRainbowColor(0);
                        Tektite.setBackgroundColor(currentColor);
                        // setBodyColor(currentColor);
                    }
                    break;
                case "timer":
                    tektite.setTitle(Domain.timeShortStringFromTick(tick -(current ?? tick)) +" - " +applicationTitle);
                    const stampListDiv = minamo.dom.getDivsByClassName(screen, "stamp-list")[0];
                    if (stampListDiv)
                    {
                        minamo.dom.getChildNodes<HTMLDivElement>(stampListDiv)
                        .forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("tick-elapsed-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeShortStringFromTick(Domain.getTicks() -ticks[index]);
                            }
                        );
                    }
                    if (0 < flashInterval && 0 < ticks.length)
                    {
                        const elapsed = Domain.getTicks() -current;
                        const unit = flashInterval; // *60 *1000;
                        const primaryStep = Math.floor(elapsed / unit);
                        const currentColor = Color.getSolidRainbowColor(primaryStep);
                        const nextColor = Color.getSolidRainbowColor(primaryStep +1);
                        const rate = ((Domain.getTicks() -current) %unit) /unit;
                        Tektite.setBodyColor(Color.mixColors(currentColor, nextColor, rate));
                    }
                    else
                    {
                        const currentColor = Color.getSolidRainbowColor(0);
                        Tektite.setBodyColor(currentColor);
                    }
                    break;
                case "storage":
                    await reload();
                    break;
                case "operate":
                    previousPrimaryStep = 0;
                    ticks = Storage.NeverStopwatch.Stamps.get();
                    await tektite.screen.replaceBody(await neverStopwatchScreenBody(item, ticks));
                    resizeFlexList();
                    tektite.screen.adjustPageFooterPosition();
                    await updateWindow("timer");
                    break;
            }
        };
        await showWindow(await neverStopwatchScreen(item, ticks), updateWindow);
        await updateWindow("timer");
    };
    export const elapsedTimerScreenMenu = async () =>
    [
        await fullscreenMenuItem(),
        await themeMenuItem(),
        await progressBarStyleMenuItem(),
        await languageMenuItem(),
        await resetElapsedTimerMenuItem(),
        await githubMenuItem(),
    ];
    export const elapsedTimerScreenBody = async (item: Type.EventEntry | null, events: Type.EventEntry[]) =>
    ({
        primary:
        {
            body:
            [
                (item ?? events[0]) ?
                Tektite.$div("current-item event-item")
                    ([
                        (item ?? events[0]) ?
                        [
                            monospace({ className: "current-title", value: (item ?? events[0]).title, }),
                            monospace({ className: "current-due-timestamp", value: Domain.dateStringFromTick((item ?? events[0]).tick), }),
                        ]: [],
                        monospace({ className: "capital-interval", value: Domain.timeLongStringFromTick(0), }),
                        monospace({ className: "current-timestamp", value: Domain.dateStringFromTick(Domain.getTicks()), }),
                    ]):
                    Tektite.$div("current-item")
                    ([
                        monospace({ className: "capital-interval", value: Domain.timeLongStringFromTick(0), }),
                        monospace({ className: "current-timestamp", value: Domain.dateStringFromTick(Domain.getTicks()), }),
                    ]),
                await flashIntervalLabel
                (
                    await screenHeaderFlashSegment
                    (
                        Storage.ElapsedTimer.recentlyFlashInterval.add,
                        Domain.getFlashIntervalPreset()
                            .concat(Storage.ElapsedTimer.recentlyFlashInterval.get())
                            .sort(minamo.core.comparer.make([i => i]))
                            .filter((i, ix, list) => ix === list.indexOf(i)),
                        Storage.ElapsedTimer.flashInterval.get(),
                        Storage.ElapsedTimer.flashInterval.set,
                        "tektite-flash-icon",
                        "00:00:00 only"
                    )
                ),
            ],
            footer: await itemFooter(item, "CountdownTimer", item => item.title, Storage.ElapsedTimer.Events.isSaved, Operate.ElapsedTimer.save),
        },
        trail: null !== item ?
            undefined:
            [
                Tektite.$div("button-list")
                ([
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: label("New Event"),
                        onclick: async () =>
                        {
                            const result = await CountdownTimerRender.eventPrompt(Clockworks.localeMap("New Event"), Clockworks.localeMap("New Event"), Domain.getAppropriateTicks());
                            if (result)
                            {
                                if (Domain.getTicks() < result.tick)
                                {
                                    await Operate.ElapsedTimer.newEvent(result.title, result.tick);
                                }
                                else
                                {
                                    tektite.toast.make
                                    ({
                                        content: label("A date and time outside the valid range was specified."),
                                        isWideContent: true,
                                    });
                                }
                            }
                        }
                    },
                ]),
                Tektite.$div("row-flex-list event-list")
                (
                    await Promise.all(events.map(item => CountdownTimerRender.eventItem(item)))
                ),
                Tektite.$div("description")
                (
                    Tektite.$tag("ul")("locale-parallel-off")
                    ([
                        Tektite.$tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        Tektite.$tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                    ])
                ),
            ],
    });
    export const elapsedTimerScreen = async (item: Type.EventEntry | null, events: Type.EventEntry[]): Promise<ScreenSource> =>
    ({
        className: "elapsed-timer-screen",
        header: null === item ?
        {
            items:
            [
                await screenHeaderHomeSegment(),
                await screenHeaderApplicationSegment("ElapsedTimer"),
            ],
            menu: CountdownTimerRender.countdownTimerScreenMenu,
            parent: { },
        }:
        {
            items:
            [
                await screenHeaderHomeSegment(),
                await screenHeaderApplicationSegment("ElapsedTimer"),
                await screenHeaderEventSegment(item, events),
            ],
            menu: Storage.ElapsedTimer.Events.isSaved(item) ? () => CountdownTimerRender.eventItemMenu(item): undefined,
            parent: { application: "ElapsedTimer" },
        },
        body: await elapsedTimerScreenBody(item, events)
    });
    export const showElapsedTimerScreen = async (item: Type.EventEntry | null) =>
    {
        const applicationTitle = Type.applicationList["ElapsedTimer"].title;
        document.body.classList.add("hide-scroll-bar");
        let events = Storage.ElapsedTimer.Events.get();
        const updateWindow = async (event: Tektite.UpdateWindowEventEype) =>
        {
            const screen = document.getElementById("screen") as HTMLDivElement;
            const now = new Date();
            const tick = Domain.getTicks(now);
            const current = item ?? events[0] ?? null;
            const flashInterval = Storage.ElapsedTimer.flashInterval.get();
            switch(event)
            {
                case "high-resolution-timer":
                    (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeLongStringFromTick(tick -(current?.tick ?? tick));
                    const capitalTime = Domain.dateStringFromTick(tick);
                    const capitalTimeSpan = screen.getElementsByClassName("current-timestamp")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                    minamo.dom.setProperty(capitalTimeSpan, "innerText", capitalTime);
                    if (0 < flashInterval && null !== current)
                    {
                        const elapsed = tick -current.tick;
                        const unit = flashInterval; // *60 *1000;
                        const primaryStep = Math.floor(elapsed / unit);
                        if (primaryStep === previousPrimaryStep +1 && (elapsed % unit) < 5 *1000)
                        {
                            tektite.screen.flash();
                        }
                        const currentColor = Color.getSolidRainbowColor(primaryStep);
                        Tektite.setBackgroundColor(currentColor);
                        previousPrimaryStep = primaryStep;
                        const rate = ((tick -current.tick) %unit) /unit;
                        const nextColor = Color.getSolidRainbowColor(primaryStep +1);
                        setProgress(rate, nextColor);
                        // setBodyColor(nextColor);
                        tektite.header.getElement().classList.add("with-screen-prgress");
                    }
                    else
                    {
                        previousPrimaryStep = 0;
                        setProgress(null);
                        tektite.header.getElement().classList.remove("with-screen-prgress");
                        const currentColor = Color.getSolidRainbowColor(0);
                        Tektite.setBackgroundColor(currentColor);
                        // setBodyColor(currentColor);
                    }
                    break;
                case "timer":
                    tektite.setTitle(Domain.timeShortStringFromTick(tick -(current?.tick ?? tick)) +" - " +applicationTitle);
                    const eventListDiv = minamo.dom.getDivsByClassName(screen, "event-list")[0];
                    if (eventListDiv)
                    {
                        minamo.dom.getChildNodes<HTMLDivElement>(eventListDiv)
                        .forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("event-elapsed-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText =
                                    Domain.timeShortStringFromTick(tick -events[index].tick);
                            }
                        );
                    }
                    if (0 < flashInterval && 0 < events.length)
                    {
                        const elapsed = Domain.getTicks() -current.tick;
                        const unit = flashInterval; // *60 *1000;
                        const primaryStep = Math.floor(elapsed / unit);
                        const currentColor = Color.getSolidRainbowColor(primaryStep);
                        const nextColor = Color.getSolidRainbowColor(primaryStep +1);
                        const rate = ((Domain.getTicks() -current.tick) %unit) /unit;
                        Tektite.setBodyColor(Color.mixColors(currentColor, nextColor, rate));
                    }
                    else
                    {
                        const currentColor = Color.getSolidRainbowColor(0);
                        Tektite.setBodyColor(currentColor);
                    }
                    break;
                case "storage":
                    await reload();
                    break;
                case "operate":
                    previousPrimaryStep = 0;
                    events = Storage.ElapsedTimer.Events.get();
                    await tektite.screen.replaceBody(await elapsedTimerScreenBody(item, events));
                    resizeFlexList();
                    await updateWindow("timer");
                    await tektite.screen.scrollToOffset(document.getElementById("screen-body"), 0);
                    tektite.screen.adjustPageFooterPosition();
                    break;
            }
        };
        await showWindow(await elapsedTimerScreen(item, events), updateWindow);
        await updateWindow("timer");
    };
    export const colorMenuItem = async () =>
        tektite.menu.item
        (
            label("Color setting"),
            async () => await colorSettingsPopup(),
        );
    export const updateTitle = () =>
    {
        document.title = minamo.dom.getDivsByClassName(tektite.header.getElement(), "segment-title")
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
        minamo.dom.getDivsByClassName(document, "menu-popup").forEach
        (
            header =>
            {
                minamo.dom.toggleCSSClass(header, "locale-parallel-on", 2 <= minColumns);
                minamo.dom.toggleCSSClass(header, "locale-parallel-off", minColumns < 2);
            }
        );
        [document.getElementById("screen-toast") as HTMLDivElement].forEach
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
            if (document.body.classList.contains("sleep-mouse"))
            {
                document.body.classList.remove("sleep-mouse");
            }
            if (tektite.fullscreen.element())
            {
                setTimeout
                (
                    () =>
                    {
                        if (tektite.fullscreen.element() && now === lastMouseMouseAt)
                        {
                            if ( ! document.body.classList.contains("sleep-mouse"))
                            {
                                document.body.classList.add("sleep-mouse");
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
        document.getElementById("screen-body").scrollTo(0,0);
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
                show: async item => Render.showElapsedTimerScreen(item),
                parseItem: json => Domain.parseEvent(json),
            },
            "NeverStopwatch":
            {
                show: async item => Render.showNeverStopwatchScreen(item),
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
