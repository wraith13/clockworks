import { minamo } from "../minamo.js";
import { Clockworks } from "..";
import { Tektite } from "../../tektite/script";
import { Locale } from "../locale";
import { Type } from "../type";
import { Base } from "../base";
import { Color } from "../color";
import { Storage } from "../storage";
import { Domain } from "../domain";
import { Resource } from "./resource";
import { Operate as RenderOperate } from "./operate";
import config from "../../resource/config.json";
export module Render
{
    const setTitle = (title: string) =>
    {
        if (document.title !== title)
        {
            document.title = title;
        }
    };
    export const setHeaderColor = (color: string | null) =>
        minamo.dom.setStyleProperty("#screen-header", "backgroundColor", color);
    const setBodyColor = (color: string) =>
    {
        minamo.dom.setStyleProperty(document.body, "backgroundColor", `${color}E8`);
        minamo.dom.setProperty("#theme-color", "content", color);
    };
    export const setFoundationColor = (color: string | null) =>
        minamo.dom.setStyleProperty("#foundation", "backgroundColor", color);
    const setBackgroundColor = (color: string | null) =>
    {
        if ("header" === (Storage.Settings.get().progressBarStyle ?? "auto"))
        {
            setHeaderColor(color);
            setFoundationColor(null);
        }
        else
        {
            setFoundationColor(color);
            setHeaderColor(null);
        }
    };
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
    {
        const setting = Storage.Settings.get().progressBarStyle ?? "auto";
        document.body.classList.toggle("tektite-modern", "header" !== setting);
        document.body.classList.toggle("tektite-classic", "header" === setting);
        if ("header" !== setting)
        {
            Render.setHeaderColor(null);
        }
    };
    export const Operate = RenderOperate;
    export const cancelTextButton = (onCanceled: () => unknown) =>
    ({
        tag: "button",
        className: "text-button",
        children: label("roll-back"),
        onclick: async () =>
        {
            onCanceled();
            Clockworks.tektite.toast.make
            ({
                content: $span("")(label("roll-backed")),
                wait: 3000,
            });
        },
    });
    export const $make = minamo.dom.make;
    export const $tag = (tag: string) => (className: string | minamo.dom.AlphaObjectSource) => (children: minamo.dom.Source) =>
        "string" === typeof className ?
        {
            tag,
            children,
            className,
        }:
        Object.assign
        (
            {
                tag,
                children,
            },
            className,
        );
    export const $div = $tag("div");
    export const $span = $tag("span");
    export const labelSpan = $span("label");
    export const label = (label: Locale.LocaleKeyType) => labelSpan
    ([
        $span("locale-parallel")(Locale.parallel(label)),
        $span("locale-map")(Locale.map(label)),
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
        const inputDate = $make(HTMLInputElement)
        ({
            tag: "input",
            type: "date",
            value: Domain.dateCoreStringFromTick(_default),
            required: "",
        });
        const inputTime = $make(HTMLInputElement)
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
                const ui = Clockworks.tektite.screen.popup
                ({
                    children:
                    [
                        $tag("h2")("")(message),
                        inputDate,
                        inputTime,
                        $div("popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "cancel-button",
                                children: Locale.map("Cancel"),
                                onclick: () =>
                                {
                                    result = null;
                                    ui.close();
                                },
                            },
                            {
                                tag: "button",
                                className: "default-button",
                                children: Locale.map("OK"),
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
                const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
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
                                        await Resource.loadSvgOrCache("check-icon"),
                                        $span("")(label(`theme.${key}` as Locale.LocaleKeyType)),
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
                const ui = Clockworks.tektite.screen.popup
                ({
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        $tag("h2")("")(label("Theme setting")),
                        checkButtonList,
                        $div("popup-operator")
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
                const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    [
                        await Promise.all
                        (
                            Type.ProgressBarStyleList.map
                            (
                                async (key: Type.ProgressBarStyleType) =>
                                ({
                                    tag: "button",
                                    className: `check-button ${key === selected ? "checked": ""}`,
                                    children:
                                    [
                                        await Resource.loadSvgOrCache("check-icon"),
                                        $span("")(label(`progressBarStyle.${key}` as Locale.LocaleKeyType)),
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
                const ui = Clockworks.tektite.screen.popup
                ({
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        $tag("h2")("")(label("Progress Bar Style setting")),
                        checkButtonList,
                        $div("popup-operator")
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
                const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    [
                        {
                            tag: "button",
                            className: `check-button ${"@auto" === (settings.locale ?? "@auto") ? "checked": ""}`,
                            children:
                            [
                                await Resource.loadSvgOrCache("check-icon"),
                                $span("")(label("language.auto")),
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
                            Locale.locales.map
                            (
                                async key =>
                                ({
                                    tag: "button",
                                    className: `check-button ${key === (settings.locale ?? "@auto") ? "checked": ""}`,
                                    children:
                                    [
                                        await Resource.loadSvgOrCache("check-icon"),
                                        $span("")(labelSpan(Locale.getLocaleName(key))),
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
                const ui = Clockworks.tektite.screen.popup
                ({
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        $tag("h2")("")(label("Language setting")),
                        checkButtonList,
                        $div("popup-operator")
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
                const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
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
                                        await Resource.loadSvgOrCache("check-icon"),
                                        $span("")(label(key)),
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
                const ui = Clockworks.tektite.screen.popup
                ({
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        $tag("h2")("")(label("Color setting")),
                        checkButtonList,
                        $div("popup-operator")
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
        const inputTime = $make(HTMLInputElement)
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
                const ui = Clockworks.tektite.screen.popup
                ({
                    children:
                    [
                        $tag("h2")("")(message),
                        inputTime,
                        $div("popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "cancel-button",
                                children: Locale.map("Cancel"),
                                onclick: () =>
                                {
                                    result = null;
                                    ui.close();
                                },
                            },
                            {
                                tag: "button",
                                className: "default-button",
                                children: Locale.map("OK"),
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
    export const newTimerPopup = async (): Promise<boolean> =>
    {
        return await new Promise
        (
            async resolve =>
            {
                let result = false;
                const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
                const timerPreset = Domain.getTimerPreset()
                    .concat(Storage.CountdownTimer.recentlyTimer.get())
                    .sort(minamo.core.comparer.make([i => i]))
                    .filter((i, ix, list) => ix === list.indexOf(i));
                const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                (
                    checkButtonList,
                    [
                        await Promise.all
                        (
                            timerPreset.map
                            (
                                async (i: number) =>
                                ({
                                    tag: "button",
                                    className: `check-button`,
                                    children:
                                    [
                                        await Resource.loadSvgOrCache("check-icon"),
                                        $span("")(labelSpan(Domain.makeTimerLabel(i))),
                                    ],
                                    onclick: async () =>
                                    {
                                        await Operate.CountdownTimer.newTimer(i);
                                        result = true;
                                        ui.close();
                                    }
                                })
                            )
                        ),
                    ]
                );
                await checkButtonListUpdate();
                const ui = Clockworks.tektite.screen.popup
                ({
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        $tag("h2")("")(label("New Timer")),
                        checkButtonList,
                        $div("popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "cancel-button",
                                children: label("input a time"),
                                onclick: async () =>
                                {
                                    const tick = await timePrompt(Locale.map("input a time"), 0);
                                    if (null !== tick)
                                    {
                                        const minutes = tick /(60 *1000);
                                        Storage.CountdownTimer.recentlyTimer.add(minutes);
                                        await Operate.CountdownTimer.newTimer(minutes);
                                        result = true;
                                        ui.close();
                                    }
                                }
                            },
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
                    onClose: async () => resolve(result),
                });
            }
        );
    };
    export const eventPrompt = async (message: string, title: string, tick: number): Promise<Type.EventEntry | null> =>
    {
        const inputTitle = $make(HTMLInputElement)
        ({
            tag: "input",
            value: title,
            required: "",
        });
        const inputDate = $make(HTMLInputElement)
        ({
            tag: "input",
            type: "date",
            value: Domain.dateCoreStringFromTick(tick),
            required: "",
        });
        const inputTime = $make(HTMLInputElement)
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
                let result: Type.EventEntry | null = null;
                const ui = Clockworks.tektite.screen.popup
                ({
                    children:
                    [
                        $tag("h2")("")(message),
                        inputTitle,
                        inputDate,
                        inputTime,
                        $div("popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "cancel-button",
                                children: Locale.map("Cancel"),
                                onclick: () =>
                                {
                                    result = null;
                                    ui.close();
                                },
                            },
                            {
                                tag: "button",
                                className: "default-button",
                                children: Locale.map("OK"),
                                onclick: () =>
                                {
                                    result =
                                    {
                                        title: inputTitle.value,
                                        tick: Domain.parseDate(`${inputDate.value}T${inputTime.value}`)?.getTime() ?? tick,
                                    };
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
        const inputDate = $make(HTMLInputElement)
        ({
            tag: "input",
            type: "date",
            value: Domain.dateCoreStringFromTick(tick),
            required: "",
        });
        const inputTime = $make(HTMLInputElement)
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
                const ui = Clockworks.tektite.screen.popup
                ({
                    children:
                    [
                        $tag("h2")("")(message),
                        inputDate,
                        inputTime,
                        $div("popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "cancel-button",
                                children: Locale.map("Cancel"),
                                onclick: () =>
                                {
                                    result = null;
                                    ui.close();
                                },
                            },
                            {
                                tag: "button",
                                className: "default-button",
                                children: Locale.map("OK"),
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
    export const timezonePrompt = async (message: string, title: string, offset: number): Promise<{ title: string, offset: number } | null> =>
    {
        const inputTitle = $make(HTMLInputElement)
        ({
            tag: "input",
            value: title,
            required: "",
        });
        const selectOffset = $make(HTMLSelectElement)
        ({
            tag: "select",
            value: offset,
            children: config.timezoneOffsetList
                .concat([ offset ])
                .filter((i, ix, list) => ix === list.indexOf(i))
                .sort(Base.simpleComparer)
                .map
                (
                    i =>
                    ({
                        tag: "option",
                        value: i,
                        children: Domain.timezoneOffsetString(i),
                        selected: i === offset ? "selected": undefined,
                    })
                )
        });
        return await new Promise
        (
            resolve =>
            {
                let result: { title: string, offset: number } | null = null;
                const ui = Clockworks.tektite.screen.popup
                ({
                    children:
                    [
                        $tag("h2")("")(message),
                        inputTitle,
                        selectOffset,
                        $div("popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "cancel-button",
                                children: Locale.map("Cancel"),
                                onclick: () =>
                                {
                                    result = null;
                                    ui.close();
                                },
                            },
                            {
                                tag: "button",
                                className: "default-button",
                                children: Locale.map("OK"),
                                onclick: () =>
                                {
                                    result =
                                    {
                                        title: inputTitle.value,
                                        offset: Number.parseInt(selectOffset.value),
                                    };
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
            const ui = Clockworks.tektite.screen.popup
            ({
                // className: "add-remove-tags-popup",
                children:
                [
                    $tag("h2")("")(labelSpan("シェア / Share")),
                    $div("menu-button-list")
                    ([
                        {
                            tag: "button",
                            className: "menu-item-button",
                            children: $span("")(labelSpan("Tweet / ツイート")),
                            onclick: async () =>
                            {
                                location.href='https://twitter.com/intent/tweet?text='+encodeURIComponent('【'+title+'】 '+url +' ');
                                ui.close();
                            }
                        },
                        {
                            tag: "button",
                            className: "menu-item-button",
                            children: $span("")(labelSpan("Copy URL / URL をコピー")),
                            onclick: async () =>
                            {
                                Operate.copyToClipboard(url, "URL");
                                ui.close();
                            }
                        }
                    ]),
                    $div("popup-operator")
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
    export const stampItem = async (tick: number, interval: number | null) => $div("stamp-item flex-item")
    ([
        $div("item-header")
        ([
            Clockworks.tektite.internalLink
            ({
                className: "item-title",
                href: Domain.makePageParams("NeverStopwatch", tick),
                children:
                [
                    await Resource.loadSvgOrCache("tick-icon"),
                    $div("tick-elapsed-time")
                    ([
                        $span("value monospace")(label("Elapsed time")),
                    ]),
                ]
            }),
            $div("item-operator")
            ([
                await Clockworks.tektite.menu.button(await stampItemMenu(tick)),
            ]),
        ]),
        $div("item-information")
        ([
            $div("tick-timestamp")
            ([
                label("Timestamp"),
                $span("value monospace")(Domain.dateFullStringFromTick(tick)),
            ]),
            $div("tick-interval")
            ([
                label("Interval"),
                $span("value monospace")(Domain.timeLongStringFromTick(interval)),
            ]),
        ]),
    ]);
    export const stampItemMenu = async (tick: number) =>
    [
        Clockworks.tektite.menu.item
        (
            label("Edit"),
            async () =>
            {
                const result = Domain.parseDate(await dateTimePrompt(Locale.map("Edit"), tick));
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
                            Clockworks.tektite.toast.make
                            ({
                                content: label("A date and time outside the valid range was specified."),
                                isWideContent: true,
                            });
                        }
                    }
                }
            }
        ),
        Clockworks.tektite.menu.item
        (
            label("Remove"),
            async () => await Operate.NeverStopwatch.removeStamp(tick),
            "delete-button"
        )
    ];
    export const alarmTitle = (item: Type.AlarmEntry) => "timer" === item.type ?
        `${Domain.makeTimerLabel(item.end -item.start)} ${Locale.map("Timer")}`:
        item.title;
    export const alarmItem = async (item: Type.AlarmEntry) => $div("alarm-item flex-item")
    ([
        $div("item-header")
        ([
            Clockworks.tektite.internalLink
            ({
                className: "item-title",
                href: Domain.makePageParams("CountdownTimer", item),
                children:
                [
                    await Resource.loadSvgOrCache("tick-icon"),
                    $div("tick-elapsed-time")([$span("value monospace")(alarmTitle(item)),]),
                ]
            }),
            $div("item-operator")
            ([
                await Clockworks.tektite.menu.button(await alarmItemMenu(item)),
            ]),
        ]),
        $div("item-information")
        ([
            $div("alarm-due-timestamp")
            ([
                label("Due timestamp"),
                $span("value monospace")(Domain.dateFullStringFromTick(item.end)),
            ]),
            $div("alarm-due-rest")
            ([
                label("Rest"),
                $span("value monospace")(Domain.timeLongStringFromTick(item.end -Domain.getTicks())),
            ]),
        ]),
    ]);
    export const alarmItemMenu = async (item: Type.AlarmEntry) =>
    [
        "schedule" === item.type ?
            [
                Clockworks.tektite.menu.item
                (
                    label("Edit"),
                    async () =>
                    {
                        const result = await eventPrompt(Locale.map("Edit"), item.title, item.end);
                        if (null !== result)
                        {
                            if (item.title !== result.title || item.end !== result.tick)
                            {
                                if (Domain.getTicks() < result.tick)
                                {
                                    await Operate.CountdownTimer.edit(item, result.title, item.start, result.tick);
                                }
                                else
                                {
                                    Clockworks.tektite.toast.make
                                    ({
                                        content: label("A date and time outside the valid range was specified."),
                                        isWideContent: true,
                                    });
                                }
                            }
                        }
                    }
                ),
                Clockworks.tektite.menu.item
                (
                    label("Edit start time"),
                    async () =>
                    {
                        const result = await dateIimePrompt(Locale.map("Edit start time"), item.start);
                        if (null !== result)
                        {
                            if (item.start !== result)
                            {
                                if (result < Domain.getTicks())
                                {
                                    await Operate.CountdownTimer.edit(item, item.title, result, item.end);
                                }
                                else
                                {
                                    Clockworks.tektite.toast.make
                                    ({
                                        content: label("A date and time outside the valid range was specified."),
                                        isWideContent: true,
                                    });
                                }
                            }
                        }
                    }
                )
            ]:
            [],
        Clockworks.tektite.menu.item
        (
            label("Remove"),
            async () => await Operate.CountdownTimer.removeAlarm(item),
            "delete-button"
        )
    ];
    export const eventItem = async (item: Type.EventEntry) => $div("event-item flex-item")
    ([
        $div("item-header")
        ([
            Clockworks.tektite.internalLink
            ({
                className: "item-title",
                href: Domain.makePageParams("ElapsedTimer", item),
                children:
                [
                    await Resource.loadSvgOrCache("tick-icon"),
                    $div("tick-elapsed-time")([$span("value monospace")(item.title),]),
                ]
            }),
            $div("item-operator")
            ([
                await Clockworks.tektite.menu.button(await eventItemMenu(item)),
            ]),
        ]),
        $div("item-information")
        ([
            $div("event-timestamp")
            ([
                label("Timestamp"),
                $span("value monospace")(Domain.dateFullStringFromTick(item.tick)),
            ]),
            $div("event-elapsed-time")
            ([
                label("Elapsed time"),
                $span("value monospace")(Domain.timeLongStringFromTick(Domain.getTicks() - item.tick)),
            ]),
        ]),
    ]);
    export const eventItemMenu = async (item: Type.EventEntry) =>
    [
        Clockworks.tektite.menu.item
        (
            label("Edit"),
            async () =>
            {
                const result = await eventPrompt(Locale.map("Edit"), item.title, item.tick);
                if (null !== result)
                {
                    if (item.title !== result.title || item.tick !== result.tick)
                    {
                        if (result.tick < Domain.getTicks())
                        {
                            await Operate.ElapsedTimer.edit(item, result.title, result.tick);
                        }
                        else
                        {
                            Clockworks.tektite.toast.make
                            ({
                                content: label("A date and time outside the valid range was specified."),
                                isWideContent: true,
                            });
                        }
                    }
                }
            }
        ),
        Clockworks.tektite.menu.item
        (
            label("Remove"),
            async () => await Operate.ElapsedTimer.remove(item),
            "delete-button"
        )
    ];
    export const timezoneItem = async (item: Type.TimezoneEntry) => $div("timezone-item flex-item")
    ([
        $div("item-header")
        ([
            Clockworks.tektite.internalLink
            ({
                className: "item-title",
                href: Domain.makePageParams("RainbowClock", item),
                children:
                [
                    await Resource.loadSvgOrCache("pin-icon"),
                    $div("tick-elapsed-time")([$span("value monospace")(item.title),]),
                ]
            }),
            $div("item-operator")
            ([
                await Clockworks.tektite.menu.button(await timezoneItemMenu(item)),
            ]),
        ]),
        $div("item-panel")
        ([
            $div("item-panel-body")
            ([
                $div("item-utc-offset")
                ([
                    $span("value monospace")(Domain.timezoneOffsetString(item.offset)),
                ]),
                $div("item-date")
                ([
                    $span("value monospace")(Domain.dateCoreStringFromTick(Domain.getUTCTicks() -item.offset)),
                ]),
                $div("item-time")
                ([
                    $span("value monospace")(Domain.timeFullCoreStringFromTick(Domain.getTime(Domain.getUTCTicks() -item.offset))),
                ]),
            ]),
            $div("item-time-bar")([]),
        ])
    ]);
    export const timezoneItemMenu = async (item: Type.TimezoneEntry) =>
    [
        Clockworks.tektite.menu.item
        (
            label("Edit"),
            async () =>
            {
                const result = await timezonePrompt(Locale.map("Edit"), item.title, item.offset);
                if (null !== result)
                {
                    if (item.title !== result.title || item.offset !== result.offset)
                    {
                        await Operate.RainbowClock.edit(item, result.title, result.offset);
                    }
                }
            }
        ),
        Clockworks.tektite.menu.item
        (
            label("Remove"),
            async () => await Operate.RainbowClock.remove(item),
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
                async (i: Type.ApplicationType) => Clockworks.tektite.menu.linkItem
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
        icon: "tick-icon",
        title: Domain.dateFullStringFromTick(item),
        menu: await Promise.all
        (
            ticks
                .concat([item])
                .sort(minamo.core.comparer.make([i => -i]))
                .filter((i, ix, list) => ix === list.indexOf(i))
                .map
                (
                    async i => Clockworks.tektite.menu.linkItem
                    (
                        [ await Resource.loadSvgOrCache("tick-icon"), $span("monospace")(Domain.dateFullStringFromTick(i)), ],
                        Domain.makePageParams("NeverStopwatch", i),
                        item === i ? "current-item": undefined,
                    )
                )
        )
    });
    export const screenHeaderAlarmSegment = async (item: Type.AlarmEntry | null, alarms: Type.AlarmEntry[]): Promise<HeaderSegmentSource> =>
    ({
        icon: "tick-icon",
        title: alarmTitle(item),
        menu: await Promise.all
        (
            alarms
                .concat([item])
                .sort(minamo.core.comparer.make([i => i.end]))
                .filter((i, ix, list) => ix === list.map(a => JSON.stringify(a)).indexOf(JSON.stringify(i)))
                .map
                (
                    async i => Clockworks.tektite.menu.linkItem
                    (
                        [ await Resource.loadSvgOrCache("tick-icon"), labelSpan(alarmTitle(i)), $span("value monospace")(Domain.dateStringFromTick(i.end)), ],
                        Domain.makePageParams("CountdownTimer", i),
                        JSON.stringify(item) === JSON.stringify(i) ? "current-item": undefined,
                    )
                )
        )
    });
    export const screenHeaderEventSegment = async (item: Type.EventEntry | null, alarms: Type.EventEntry[]): Promise<HeaderSegmentSource> =>
    ({
        icon: "tick-icon",
        title: item.title,
        menu: await Promise.all
        (
            alarms
                .concat([item])
                .sort(minamo.core.comparer.make([i => i.tick]))
                .filter((i, ix, list) => ix === list.map(a => JSON.stringify(a)).indexOf(JSON.stringify(i)))
                .map
                (
                    async i => Clockworks.tektite.menu.linkItem
                    (
                        [ await Resource.loadSvgOrCache("tick-icon"), labelSpan(i.title), $span("value monospace")(Domain.dateStringFromTick(i.tick)), ],
                        Domain.makePageParams("ElapsedTimer", i),
                        JSON.stringify(item) === JSON.stringify(i) ? "current-item": undefined,
                    )
                )
        )
    });
    export const screenHeaderTimezoneSegment = async (item: Type.TimezoneEntry | null, timezones: Type.TimezoneEntry[]): Promise<HeaderSegmentSource> =>
    ({
        icon: "pin-icon",
        title: item.title,
        menu: await Promise.all
        (
            timezones
                .concat([item])
                .sort(minamo.core.comparer.make([i => i.offset]))
                .filter((i, ix, list) => ix === list.map(a => JSON.stringify(a)).indexOf(JSON.stringify(i)))
                .map
                (
                    async i => Clockworks.tektite.menu.linkItem
                    (
                        [ await Resource.loadSvgOrCache("tick-icon"), labelSpan(i.title), $span("value monospace")(Domain.timezoneOffsetString(i.offset)), ],
                        Domain.makePageParams("RainbowClock", i),
                        JSON.stringify(item) === JSON.stringify(i) ? "current-item": undefined,
                    )
                )
        )
    });
    export const screenHeaderFlashSegmentMenu = async (adder: (i: number) => unknown, flashIntervalPreset: number[], flashInterval: number, setter: (i: number) => unknown, zeroIcon: Resource.KeyType, zeroLabel: Locale.LocaleKeyType): Promise<minamo.dom.Source> =>
    (
        await Promise.all
        (
            flashIntervalPreset.map
            (
                async i =>
                Clockworks.tektite.menu.item
                (
                    [
                        await Resource.loadSvgOrCache(0 === i ? zeroIcon: "flash-icon"),
                        labelSpan(0 === i ? Locale.map(zeroLabel): `${Locale.map("Interval")}: ${Domain.makeTimerLabel(i)}`),
                    ],
                    async () =>
                    {
                        setter(i);
                        Clockworks.tektite.screen.clearLastMouseDownTarget();
                        Clockworks.tektite.screen.getScreenCoverList().forEach(i => i.click());
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
            Clockworks.tektite.menu.item
            (
                [
                    await Resource.loadSvgOrCache("flash-icon"),
                    label("input a time"),
                ],
                async () =>
                {
                    Clockworks.tektite.screen.clearLastMouseDownTarget();
                    Clockworks.tektite.screen.getScreenCoverList().forEach(i => i.click());
                    const tick = await timePrompt(Locale.map("input a time"), 0);
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
    export const screenHeaderFlashSegment = async (adder: (i: number) => unknown, flashIntervalPreset: number[], flashInterval: number, setter: (i: number) => unknown, zeroIcon: Resource.KeyType = "sleep-icon", zeroLabel: Locale.LocaleKeyType = "No Flash"): Promise<HeaderSegmentSource> =>
    ({
        icon: 0 === flashInterval ? zeroIcon: "flash-icon",
        title: 0 === flashInterval ? Locale.map(zeroLabel): `${Locale.map("Interval")}: ${Domain.makeTimerLabel(flashInterval)}`,
        menu: await screenHeaderFlashSegmentMenu(adder, flashIntervalPreset, flashInterval, setter, zeroIcon, zeroLabel),
    });
    export const replaceScreenBody = (body: minamo.dom.Source) => minamo.dom.replaceChildren
    (
        minamo.dom.getDivsByClassName(document, "screen-body")[0],
        body
    );
    export const fullscreenMenuItem = async () => Clockworks.tektite.fullscreen.enabled() ?
        (
            null === Clockworks.tektite.fullscreen.element() ?
                Clockworks.tektite.menu.item
                (
                    label("Full screen"),
                    async () => await Clockworks.tektite.fullscreen.request()
                ):
                Clockworks.tektite.menu.item
                (
                    label("Cancel full screen"),
                    async () => await Clockworks.tektite.fullscreen.exit()
                )
        ):
        [];
    export const themeMenuItem = async () =>
        Clockworks.tektite.menu.item
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
        Clockworks.tektite.menu.item
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
        Clockworks.tektite.menu.item
        (
            label("Language setting"),
            async () =>
            {
                if (await localeSettingsPopup())
                {
                    Locale.setLocale(Storage.Settings.get().locale);
                    await reload();
                }
            }
        );
    export const resetNeverStopwatchMenuItem = async () =>
        Clockworks.tektite.menu.item
        (
            label("Remove all stamps"),
            async () => await Operate.NeverStopwatch.removeAllStamps(),
            "delete-button"
        );
    export const resetCountdownTimerMenuItem = async () =>
        Clockworks.tektite.menu.item
        (
            label("Remove all alarms"),
            async () => await Operate.CountdownTimer.removeAllAlarms(),
            "delete-button"
        );
    export const resetElapsedTimerMenuItem = async () =>
        Clockworks.tektite.menu.item
        (
            label("Remove all alarms"),
            async () => await Operate.ElapsedTimer.removeAllEvents(),
            "delete-button"
        );
    export const resetRainbowClockMenuItem = async () =>
        Clockworks.tektite.menu.item
        (
            label("Initialize timezone list"),
            async () => await Operate.RainbowClock.reset(),
            "delete-button"
        );
    export const githubMenuItem = async () =>
        Clockworks.tektite.externalLink
        ({
            href: config.repositoryUrl,
            children: Clockworks.tektite.menu.item(labelSpan("GitHub")),
        });
    export const welcomeScreenMenu = async () =>
    [
        await fullscreenMenuItem(),
        await themeMenuItem(),
        await progressBarStyleMenuItem(),
        await languageMenuItem(),
        await githubMenuItem(),
    ];
    export const getBodyScrollTop = (topChild = minamo.dom.getDivsByClassName(document, "primary-page")[0]) =>
    {
        const body = document.getElementById("screen-body");
        const primaryPageOffsetTop = Math.min(topChild.offsetTop -body.offsetTop, body.scrollHeight -body.clientHeight);
        return body.scrollTop -primaryPageOffsetTop;
    };
    export const isStrictShowPrimaryPage = () => 0 === getBodyScrollTop();
    export const downPageLink = async () =>
    ({
        tag: "div",
        className: "down-page-link icon",
        children: await Resource.loadSvgOrCache("down-triangle-icon"),
        onclick: async () =>
        {
            if (isStrictShowPrimaryPage())
            {
                await scrollToElement(minamo.dom.getDivsByClassName(document, "trail-page")[0]);
            }
            else
            {
                await scrollToElement(minamo.dom.getDivsByClassName(document, "primary-page")[0]);
            }
        },
    });
    export const scrollToOffset = async (target: HTMLElement, offset: number) =>
    {
        let scrollTop = target.scrollTop;
        let diff = offset -scrollTop;
        for(let i = 0; i < 25; ++i)
        {
            diff *= 0.8;
            target.scrollTo(0, offset -diff);
            await minamo.core.timeout(10);
        }
        target.scrollTo(0, offset);
    };
    export const scrollToElement = async (target: HTMLElement) =>
    {
        const parent = target.parentElement;
        const targetOffsetTop = Math.min(target.offsetTop -parent.offsetTop, parent.scrollHeight -parent.clientHeight);
        await scrollToOffset(parent, targetOffsetTop);
    };
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
        [
            $div("primary-page")
            ([
                $div("page-body")
                ([
                    $div("main-panel")
                    ([
                        $div("logo")
                        ([
                            $div("application-icon icon")(await Resource.loadSvgOrCache("application-icon")),
                            $span("logo-text")(config.applicationTitle)
                        ]),
                        $div("button-list")
                        (
                            Type.applicationIdList.map
                            (
                                (i: Type.ApplicationType) =>
                                Clockworks.tektite.internalLink
                                ({
                                    href: { application: i },
                                    children:
                                    {
                                        tag: "button",
                                        className: "default-button main-button long-button",
                                        children: labelSpan(Type.applicationList[i].title),
                                        // onclick: async () => await showNeverStopwatchScreen(),
                                    }
                                }),
                            )
                        ),
                    ]),
                ]),
                $div("page-footer")
                ([
                    await downPageLink(),
                ]),
            ]),
            $div("trail-page")
            ([
                $div("description")
                (
                    $tag("ul")("locale-parallel-off")
                    ([
                        $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                    ])
                ),
            ]),
            screenBar(),
        ]
    });
    export const showWelcomeScreen = async () =>
    {
        document.body.classList.remove("hide-scroll-bar");
        const updateWindow = async (event: UpdateWindowEventEype) =>
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
        setBodyColor(Color.getSolidRainbowColor(0));
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
        onclick: async () => Clockworks.tektite.screen.popup
        ({
            className: "bare-popup",
            children: "function" === typeof entry.menu ? await entry.menu(): entry.menu,
        }),
    });
    export const screenBar = () => $div("screen-bar")($div("screen-bar-flash-layer")([]));
    export const neverStopwatchScreenBody = async (item: number | null, ticks: number[]) =>
    ([
        $div("primary-page")
        ([
            $div("page-body")
            ([
                $div("main-panel")
                ([
                    $div("current-item")
                    ([
                        $div("previous-timestamp")
                        ([
                            $span("value monospace")
                            (
                                null !== item ?
                                    Domain.dateFullStringFromTick(item):
                                    (
                                        0 < ticks.length ?
                                        Domain.dateFullStringFromTick(ticks[0]):
                                        ""
                                    )
                            ),
                        ]),
                        $div("capital-interval")
                        ([
                            $span("value monospace")(Domain.timeLongStringFromTick(0)),
                        ]),
                        $div("current-timestamp")
                        ([
                            $span("value monospace")(Domain.dateFullStringFromTick(Domain.getTicks())),
                        ]),
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
                    $div("button-list")
                    ({
                        tag: "button",
                        className: "default-button main-button long-button",
                        children: label("Stamp"),
                        onclick: async () => await Operate.NeverStopwatch.stamp(Domain.getTicks())
                    }),
                ]),
            ]),
            $div("page-footer")
            ([
                null !== item ?
                    $div("button-list")
                    ([
                        Clockworks.tektite.internalLink
                        ({
                            href: { application: "NeverStopwatch", },
                            children:
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "閉じる / Close",
                            }
                        }),
                        Storage.NeverStopwatch.Stamps.isSaved(item) ?
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "シェア / Share",
                                onclick: async () => await sharePopup("Elapsed Time / 経過時間"),
                            }:
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "保存 / Save",
                                onclick: async () => await Operate.NeverStopwatch.save(item),
                            }
                    ]):
                    await downPageLink(),
            ]),
        ]),
        null !== item ?
            []:
            $div("trail-page")
            ([
                $div("row-flex-list stamp-list")
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
                $div("description")
                (
                    $tag("ul")("locale-parallel-off")
                    ([
                        $tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                        $tag("li")("")([label("You can use a link like this too:"), { tag: "a", style: "margin-inline-start:0.5em;", href: Domain.makeStampUrl("new"), children: Locale.map("Stamp"), }, ]),
                    ])
                ),
            ]),
        screenBar(),
    ]);
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
        const updateWindow = async (event: UpdateWindowEventEype) =>
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
                            Clockworks.tektite.screen.flash();
                        }
                        const currentColor = Color.getSolidRainbowColor(primaryStep);
                        setBackgroundColor(currentColor);
                        previousPrimaryStep = primaryStep;
                        const rate = ((Domain.getTicks() -current) %unit) /unit;
                        const nextColor = Color.getSolidRainbowColor(primaryStep +1);
                        setScreenBarProgress(rate, nextColor);
                        // setBodyColor(nextColor);
                        getHeaderElement().classList.add("with-screen-prgress");
                    }
                    else
                    {
                        previousPrimaryStep = 0;
                        setScreenBarProgress(null);
                        getHeaderElement().classList.remove("with-screen-prgress");
                        const currentColor = Color.getSolidRainbowColor(0);
                        setBackgroundColor(currentColor);
                        // setBodyColor(currentColor);
                    }
                    break;
                case "timer":
                    setTitle(Domain.timeShortStringFromTick(tick -(current ?? tick)) +" - " +applicationTitle);
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
                        setBodyColor(Color.mixColors(currentColor, nextColor, rate));
                    }
                    else
                    {
                        const currentColor = Color.getSolidRainbowColor(0);
                        setBodyColor(currentColor);
                    }
                    break;
                case "storage":
                    await reload();
                    break;
                case "operate":
                    previousPrimaryStep = 0;
                    ticks = Storage.NeverStopwatch.Stamps.get();
                    replaceScreenBody(await neverStopwatchScreenBody(item, ticks));
                    resizeFlexList();
                    adjustPageFooterPosition();
                    await updateWindow("timer");
                    break;
            }
        };
        await showWindow(await neverStopwatchScreen(item, ticks), updateWindow);
        await updateWindow("timer");
    };
    export const countdownTimerScreenMenu = async () =>
    [
        await fullscreenMenuItem(),
        await themeMenuItem(),
        await progressBarStyleMenuItem(),
        await languageMenuItem(),
        await resetCountdownTimerMenuItem(),
        await githubMenuItem(),
    ];
    export const countdownTimerScreenBody = async (item: Type.AlarmEntry | null, alarms: Type.AlarmEntry[]) =>
    ([
        $div("primary-page")
        ([
            $div("page-body")
            ([
                $div("main-panel")
                ([
                    (item ?? alarms[0]) ?
                        $div
                        (
                            "timer" === (item ?? alarms[0]).type ?
                                "current-item timer-item":
                                "current-item schedule-item"
                        )
                        ([
                            (item ?? alarms[0]) ?
                            [
                                $div("current-title")
                                ([
                                    $span("value monospace")(alarmTitle(item ?? alarms[0])),
                                ]),
                                $div
                                (
                                    "timer" === (item ?? alarms[0]).type ?
                                        "current-due-timestamp":
                                        "current-due-timestamp"
                                )
                                ([
                                    $span("value monospace")
                                    (
                                        "timer" === (item ?? alarms[0]).type ?
                                            Domain.dateFullStringFromTick((item ?? alarms[0]).end):
                                            Domain.dateStringFromTick((item ?? alarms[0]).end)
                                    ),
                                ]),
                            ]: [],
                            $div("capital-interval")
                            ([
                                $span("value monospace")(Domain.timeLongStringFromTick(0)),
                            ]),
                            $div("current-timestamp")
                            ([
                                $span("value monospace")(Domain.dateStringFromTick(Domain.getTicks())),
                            ]),
                        ]):
                        $div("current-item")
                        ([
                            $div("capital-interval")
                            ([
                                $span("value monospace")(Domain.timeLongStringFromTick(0)),
                            ]),
                            $div("current-timestamp")
                            ([
                                $span("value monospace")(Domain.dateStringFromTick(Domain.getTicks())),
                            ]),
                        ]),
                    await flashIntervalLabel
                    (
                        await screenHeaderFlashSegment
                        (
                            Storage.CountdownTimer.recentlyFlashInterval.add,
                            Domain.getFlashIntervalPreset()
                                .concat(Storage.CountdownTimer.recentlyFlashInterval.get())
                                .sort(minamo.core.comparer.make([i => i]))
                                .filter((i, ix, list) => ix === list.indexOf(i)),
                            Storage.CountdownTimer.flashInterval.get(),
                            Storage.CountdownTimer.flashInterval.set,
                            "flash-icon",
                            "00:00:00 only"
                        )
                    ),
                    $div("button-list")
                    ({
                        tag: "button",
                        id: "done-button",
                        className: "default-button main-button long-button",
                        children: label("Done"),
                        onclick: async () =>
                        {
                            const current = item ?? alarms[0];
                            if (current)
                            {
                                if (Storage.CountdownTimer.Alarms.isSaved(item))
                                {
                                    await Operate.CountdownTimer.done(current);
                                }
                                else
                                {
                                    await Operate.CountdownTimer.doneTemprary(current);
                                }
                            }
                        }
                    }),
                ]),
            ]),
            $div("page-footer")
            ([
                null !== item ?
                    $div("button-list")
                    ([
                        Clockworks.tektite.internalLink
                        ({
                            href: { application: "CountdownTimer", },
                            children:
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "閉じる / Close",
                            }
                        }),
                        Storage.CountdownTimer.Alarms.isSaved(item) ?
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "シェア / Share",
                                onclick: async () => await sharePopup(alarmTitle(item)),
                            }:
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "保存 / Save",
                                onclick: async () => await Operate.CountdownTimer.save(item),
                            }
                    ]):
                    await downPageLink(),
            ]),
        ]),
        null !== item ?
            []:
            $div("trail-page")
            ([
                $div("button-list")
                ([
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: label("New Timer"),
                        onclick: async () => await newTimerPopup(),
                    },
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: label("New Schedule"),
                        onclick: async () =>
                        {
                            const result = await eventPrompt(Locale.map("New Schedule"), Locale.map("New Schedule"), Domain.getAppropriateTicks());
                            if (result)
                            {
                                if (Domain.getTicks() < result.tick)
                                {
                                    await Operate.CountdownTimer.newSchedule(result.title, result.tick);
                                }
                                else
                                {
                                    Clockworks.tektite.toast.make
                                    ({
                                        content: label("A date and time outside the valid range was specified."),
                                        isWideContent: true,
                                    });
                                }
                            }
                        }
                    },
                ]),
                $div("row-flex-list alarm-list")
                (
                    await Promise.all(alarms.map(item => alarmItem(item)))
                ),
                $div("description")
                (
                    $tag("ul")("locale-parallel-off")
                    ([
                        $tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                        $tag("li")("")([label("You can use links like these too:"), [ "1500ms", "90s", "3m", "1h", "1d" ].map(i => ({ tag: "a", style: "margin-inline-start:0.5em;", href: Domain.makeNewTimerUrl(i), children: `${Domain.makeTimerLabel(Domain.parseTimer(i))} ${Locale.map("Timer")}`, }))]),
                    ])
                ),
            ]),
        screenBar(),
    ]);
    export const countdownTimerScreen = async (item: Type.AlarmEntry | null, alarms: Type.AlarmEntry[]): Promise<ScreenSource> =>
    ({
        className: "countdown-timer-screen",
        header: null === item ?
        {
            items:
            [
                await screenHeaderHomeSegment(),
                await screenHeaderApplicationSegment("CountdownTimer"),
            ],
            menu: countdownTimerScreenMenu,
            parent: { },
        }:
        {
            items:
            [
                await screenHeaderHomeSegment(),
                await screenHeaderApplicationSegment("CountdownTimer"),
                await screenHeaderAlarmSegment(item, alarms),
            ],
            menu: Storage.CountdownTimer.Alarms.isSaved(item) ? () => alarmItemMenu(item): undefined,
            parent: { application: "CountdownTimer" },
        },
        body: await countdownTimerScreenBody(item, alarms)
    });
    export const showCountdownTimerScreen = async (item: Type.AlarmEntry | null) =>
    {
        const applicationTitle = Type.applicationList["CountdownTimer"].title;
        document.body.classList.add("hide-scroll-bar");
        let alarms = Storage.CountdownTimer.Alarms.get();
        let lashFlashAt = 0;
        const updateWindow = async (event: UpdateWindowEventEype) =>
        {
            const screen = document.getElementById("screen") as HTMLDivElement;
            const now = new Date();
            const tick = Domain.getTicks(now);
            const current = item ?? alarms[0] ?? null;
            switch(event)
            {
                case "high-resolution-timer":
                    (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText =
                        Domain.timeLongStringFromTick(current ? Math.max(current.end -tick, 0): 0);
                    const capitalTime = Domain.dateStringFromTick(tick);
                    const capitalTimeSpan = screen.getElementsByClassName("current-timestamp")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                    minamo.dom.setProperty(capitalTimeSpan, "innerText", capitalTime);
                    const flashInterval = Storage.CountdownTimer.flashInterval.get();
                    if (current)
                    {
                        const rest = current.end - tick;
                        if (0 < flashInterval)
                        {
                            const unit = flashInterval; // *60 *1000;
                            const primaryStep = 0 < unit ? Math.floor(rest / unit): 0;
                            if ((primaryStep +1 === previousPrimaryStep && -5 *1000 < (rest % unit) && 500 < tick -current.start))
                            {
                                Clockworks.tektite.screen.flash();
                                lashFlashAt = tick;
                            }
                            previousPrimaryStep = primaryStep;
                        }
                        const cycle = "timer" === current.type ? 3000: 10000;
                        if (rest <= 0 && lashFlashAt +cycle <= tick)
                        {
                            Clockworks.tektite.screen.flash();
                            lashFlashAt = tick;
                        }
                        const currentColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                        setBackgroundColor(currentColor);
                        const span = current.end - current.start;
                        const rate = Math.min(tick - current.start, span) /span;
                        const nextColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get() +1);
                        setScreenBarProgress(rate, nextColor);
                        // setBodyColor(nextColor);
                        getHeaderElement().classList.add("with-screen-prgress");
                    }
                    else
                    {
                        previousPrimaryStep = 0;
                        setScreenBarProgress(null);
                        getHeaderElement().classList.remove("with-screen-prgress");
                        const currentColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                        setBackgroundColor(currentColor);
                        // setBodyColor(currentColor);
                    }
                    break;
                case "timer":
                    setTitle(current ? Domain.timeShortStringFromTick(Math.max(current.end -tick, 0)) +" - " +applicationTitle: applicationTitle);
                    const alarmListDiv = minamo.dom.getDivsByClassName(screen, "alarm-list")[0];
                    if (alarmListDiv)
                    {
                        minamo.dom.getChildNodes<HTMLDivElement>(alarmListDiv)
                        .forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("alarm-due-rest")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText =
                                    Domain.timeShortStringFromTick(Math.max(alarms[index].end -tick, 0));
                            }
                        );
                    }
                    if (0 < flashInterval && 0 < alarms.length)
                    {
                        const rest = current.end - tick;
                        const unit = flashInterval; // *60 *1000;
                        const primaryStep = Math.floor(rest / unit);
                        const currentColor = Color.getSolidRainbowColor(primaryStep);
                        const nextColor = Color.getSolidRainbowColor(primaryStep +1);
                        const rate = (Math.min(tick - current.start), unit) /unit;
                        setBodyColor(Color.mixColors(currentColor, nextColor, rate));
                    }
                    else
                    {
                        const currentColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                        setBodyColor(currentColor);
                    }
                    break;
                case "storage":
                    await reload();
                    break;
                case "operate":
                    previousPrimaryStep = 0;
                    alarms = Storage.CountdownTimer.Alarms.get();
                    replaceScreenBody(await countdownTimerScreenBody(item, alarms));
                    resizeFlexList();
                    await updateWindow("timer");
                    await Render.scrollToOffset(document.getElementById("screen-body"), 0);
                    adjustPageFooterPosition();
                    break;
            }
        };
        await showWindow(await countdownTimerScreen(item, alarms), updateWindow);
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
    ([
        $div("primary-page")
        ([
            $div("page-body")
            ([
                $div("main-panel")
                ([
                    (item ?? events[0]) ?
                        $div("current-item event-item")
                        ([
                            (item ?? events[0]) ?
                            [
                                $div("current-title")
                                ([
                                    $span("value monospace")((item ?? events[0]).title),
                                ]),
                                $div("current-due-timestamp")
                                ([
                                    $span("value monospace")(Domain.dateStringFromTick((item ?? events[0]).tick)),
                                ]),
                            ]: [],
                            $div("capital-interval")
                            ([
                                $span("value monospace")(Domain.timeLongStringFromTick(0)),
                            ]),
                            $div("current-timestamp")
                            ([
                                $span("value monospace")(Domain.dateStringFromTick(Domain.getTicks())),
                            ]),
                        ]):
                        $div("current-item")
                        ([
                            $div("capital-interval")
                            ([
                                $span("value monospace")(Domain.timeLongStringFromTick(0)),
                            ]),
                            $div("current-timestamp")
                            ([
                                $span("value monospace")(Domain.dateStringFromTick(Domain.getTicks())),
                            ]),
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
                            "flash-icon",
                            "00:00:00 only"
                        )
                    ),
                ]),
            ]),
            $div("page-footer")
            ([
                null !== item ?
                    $div("button-list")
                    ([
                        Clockworks.tektite.internalLink
                        ({
                            href: { application: "CountdownTimer", },
                            children:
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "閉じる / Close",
                            }
                        }),
                        Storage.ElapsedTimer.Events.isSaved(item) ?
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "シェア / Share",
                                onclick: async () => await sharePopup(item.title),
                            }:
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "保存 / Save",
                                onclick: async () => await Operate.ElapsedTimer.save(item),
                            }
                    ]):
                    await downPageLink(),
            ]),
        ]),
        null !== item ?
            []:
            $div("trail-page")
            ([
                $div("button-list")
                ([
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: label("New Event"),
                        onclick: async () =>
                        {
                            const result = await eventPrompt(Locale.map("New Event"), Locale.map("New Event"), Domain.getAppropriateTicks());
                            if (result)
                            {
                                if (Domain.getTicks() < result.tick)
                                {
                                    await Operate.ElapsedTimer.newEvent(result.title, result.tick);
                                }
                                else
                                {
                                    Clockworks.tektite.toast.make
                                    ({
                                        content: label("A date and time outside the valid range was specified."),
                                        isWideContent: true,
                                    });
                                }
                            }
                        }
                    },
                ]),
                $div("row-flex-list event-list")
                (
                    await Promise.all(events.map(item => eventItem(item)))
                ),
                $div("description")
                (
                    $tag("ul")("locale-parallel-off")
                    ([
                        $tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                    ])
                ),
            ]),
        screenBar(),
    ]);
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
            menu: countdownTimerScreenMenu,
            parent: { },
        }:
        {
            items:
            [
                await screenHeaderHomeSegment(),
                await screenHeaderApplicationSegment("ElapsedTimer"),
                await screenHeaderEventSegment(item, events),
            ],
            menu: Storage.ElapsedTimer.Events.isSaved(item) ? () => eventItemMenu(item): undefined,
            parent: { application: "ElapsedTimer" },
        },
        body: await elapsedTimerScreenBody(item, events)
    });
    export const showElapsedTimerScreen = async (item: Type.EventEntry | null) =>
    {
        const applicationTitle = Type.applicationList["ElapsedTimer"].title;
        document.body.classList.add("hide-scroll-bar");
        let events = Storage.ElapsedTimer.Events.get();
        const updateWindow = async (event: UpdateWindowEventEype) =>
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
                            Clockworks.tektite.screen.flash();
                        }
                        const currentColor = Color.getSolidRainbowColor(primaryStep);
                        setBackgroundColor(currentColor);
                        previousPrimaryStep = primaryStep;
                        const rate = ((tick -current.tick) %unit) /unit;
                        const nextColor = Color.getSolidRainbowColor(primaryStep +1);
                        setScreenBarProgress(rate, nextColor);
                        // setBodyColor(nextColor);
                        getHeaderElement().classList.add("with-screen-prgress");
                    }
                    else
                    {
                        previousPrimaryStep = 0;
                        setScreenBarProgress(null);
                        getHeaderElement().classList.remove("with-screen-prgress");
                        const currentColor = Color.getSolidRainbowColor(0);
                        setBackgroundColor(currentColor);
                        // setBodyColor(currentColor);
                    }
                    break;
                case "timer":
                    setTitle(Domain.timeShortStringFromTick(tick -(current?.tick ?? tick)) +" - " +applicationTitle);
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
                        setBodyColor(Color.mixColors(currentColor, nextColor, rate));
                    }
                    else
                    {
                        const currentColor = Color.getSolidRainbowColor(0);
                        setBodyColor(currentColor);
                    }
                    break;
                case "storage":
                    await reload();
                    break;
                case "operate":
                    previousPrimaryStep = 0;
                    events = Storage.ElapsedTimer.Events.get();
                    replaceScreenBody(await elapsedTimerScreenBody(item, events));
                    resizeFlexList();
                    await updateWindow("timer");
                    await Render.scrollToOffset(document.getElementById("screen-body"), 0);
                    adjustPageFooterPosition();
                    break;
            }
        };
        await showWindow(await elapsedTimerScreen(item, events), updateWindow);
        await updateWindow("timer");
    };
    export const colorMenuItem = async () =>
        Clockworks.tektite.menu.item
        (
            label("Color setting"),
            async () => await colorSettingsPopup(),
        );
    export const rainbowClockScreenMenu = async () =>
    [
        await fullscreenMenuItem(),
        await themeMenuItem(),
        await progressBarStyleMenuItem(),
        await colorMenuItem(),
        await languageMenuItem(),
        await resetRainbowClockMenuItem(),
        await githubMenuItem(),
    ];
    export const rainbowClockScreenBody = async (item: Type.TimezoneEntry | null, timezones: Type.TimezoneEntry[]) =>
    ([
        $div("primary-page")
        ([
            $div("page-body")
            ([
                $div("main-panel")
                ([
                    null !== item ?
                        $div("current-title")
                        ([
                            $span("value")(item.title),
                        ]):
                        [],
                    $div("current-date")
                    ([
                        $span("value monospace")
                        (
                            Domain.dateCoreStringFromTick
                            (
                                null !== item ?
                                    Domain.getUTCTicks() -item.offset:
                                    Domain.getTicks()
                            )
                        ),
                    ]),
                    $div("capital-time")
                    ([
                        $span("value monospace")
                        (
                            Domain.timeFullCoreStringFromTick
                            (
                                Domain.getTime
                                (
                                    null !== item ?
                                        Domain.getUTCTicks() -item.offset:
                                        Domain.getTicks()
                                )
                            )
                        ),
                    ]),
                    null !== item ?
                        $div("current-utc-offset")
                        ([
                            $span("value monospace")(Domain.timezoneOffsetString(item.offset)),
                        ]):
                        [],
                    await flashIntervalLabel
                    (
                        await screenHeaderFlashSegment
                        (
                            null,
                            Domain.getFlashIntervalPreset(),
                                // .concat(Storage.RainbowClock.recentlyFlashInterval.get())
                                // .sort(minamo.core.comparer.make([i => i]))
                                // .filter((i, ix, list) => ix === list.indexOf(i)),
                            Storage.RainbowClock.flashInterval.get(),
                            Storage.RainbowClock.flashInterval.set
                        )
                    ),
                ]),
            ]),
            $div("page-footer")
            ([
                null !== item ?
                    $div("button-list")
                    ([
                        Clockworks.tektite.internalLink
                        ({
                            href: { application: "RainbowClock", },
                            children:
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "閉じる / Close",
                            }
                        }),
                        Storage.RainbowClock.Timezone.isSaved(item) ?
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "シェア / Share",
                                onclick: async () => await sharePopup(item.title),
                            }:
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "保存 / Save",
                                onclick: async () => await Operate.RainbowClock.save(item),
                            }
                    ]):
                    await downPageLink(),
            ]),
        ]),
        null !== item ?
            []:
            $div("trail-page")
            ([
                $div("button-list")
                ([
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: label("New Time zone"),
                        onclick: async () =>
                        {
                            const result = await timezonePrompt(Locale.map("New Time zone"), Locale.map("New Time zone"), new Date().getTimezoneOffset());
                            if (result)
                            {
                                await Operate.RainbowClock.add({ title: result.title, offset: result.offset, });
                            }
                        }
                    },
                ]),
                $div("row-flex-list timezone-list")
                (
                    await Promise.all(timezones.map(item => timezoneItem(item)))
                ),
                $div("description")
                (
                    $tag("ul")("locale-parallel-off")
                    ([
                        $tag("li")("")(label("Not support daylight savings time.")),
                        $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                    ])
                ),
            ]),
        screenBar(),
    ]);
    export const rainbowClockScreen = async (item: Type.TimezoneEntry | null, timezones: Type.TimezoneEntry[]): Promise<ScreenSource> =>
    ({
        className: "rainbow-clock-screen",
        header: null === item ?
        {
            items:
            [
                await screenHeaderHomeSegment(),
                await screenHeaderApplicationSegment("RainbowClock"),
            ],
            menu: rainbowClockScreenMenu,
            parent: { },
        }:
        {
            items:
            [
                await screenHeaderHomeSegment(),
                await screenHeaderApplicationSegment("RainbowClock"),
                await screenHeaderTimezoneSegment(item, timezones),
            ],
            menu: Storage.RainbowClock.Timezone.isSaved(item) ? () => timezoneItemMenu(item): undefined,
            parent: { application: "RainbowClock" },
        },
        body: await rainbowClockScreenBody(item, timezones),
    });
    export const showRainbowClockScreen = async (item: Type.TimezoneEntry | null) =>
    {
        const applicationTitle = Type.applicationList["RainbowClock"].title;
        document.body.classList.add("hide-scroll-bar");
        let timezones = Storage.RainbowClock.Timezone.get();
        const updateWindow = async (event: UpdateWindowEventEype) =>
        {
            const screen = document.getElementById("screen") as HTMLDivElement;
            const now = new Date();
            const tick = null !== item ?
                (Domain.getUTCTicks(now) -(item.offset *Domain.utcOffsetRate)):
                Domain.getTicks(now);
            const currentNow = new Date(tick);
            switch(event)
            {
                case "high-resolution-timer":
                    const capitalTime = Domain.timeLongCoreStringFromTick(Domain.getTime(tick));
                    const capitalTimeSpan = screen.getElementsByClassName("capital-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                    if (minamo.dom.setProperty(capitalTimeSpan, "innerText", capitalTime).isUpdate)
                    {
                        setTitle(capitalTime +" - " +applicationTitle);
                        if (capitalTime.endsWith(":00"))
                        {
                            const flashInterval = Storage.RainbowClock.flashInterval.get();
                            if (0 < flashInterval)
                            {
                                if (0 === (tick % flashInterval))
                                {
                                    Clockworks.tektite.screen.flash();
                                }
                            }
                        }
                        const utc = Domain.getUTCTicks(now);

                        const timezoneListDiv = minamo.dom.getDivsByClassName(screen, "timezone-list")[0];
                        if (timezoneListDiv)
                        {
                            minamo.dom.getChildNodes<HTMLDivElement>(timezoneListDiv)
                            .forEach
                            (
                                (dom, index) =>
                                {
                                    const getRainbowColor = Type.rainbowClockColorPatternMap[Storage.RainbowClock.colorPattern.get()];
                                    const currentTick = utc -(timezones[index].offset *Domain.utcOffsetRate);
                                    const panel = minamo.dom.getDivsByClassName(dom, "item-panel")[0];
                                    const timeBar = minamo.dom.getDivsByClassName(dom, "item-time-bar")[0];
                                    const currentHours = new Date(currentTick).getHours();
                                    const currentColor = getRainbowColor(currentHours);
                                    const hourUnit = 60 *60 *1000;
                                    const minutes = (currentTick % hourUnit) / hourUnit;
                                    const nextColor = getRainbowColor(currentHours +1);
                                    minamo.dom.setStyleProperty(panel, "backgroundColor", currentColor);
                                    minamo.dom.setStyleProperty(timeBar, "backgroundColor", nextColor);
                                    const percentString = minutes.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
                                    minamo.dom.setStyleProperty(timeBar, "width", percentString);
                                    minamo.dom.setProperty(minamo.dom.getDivsByClassName(minamo.dom.getDivsByClassName(panel, "item-date")[0], "value")[0], "innerText", Domain.dateCoreStringFromTick(currentTick) +" " +Domain.weekday(currentTick));
                                    minamo.dom.getDivsByClassName(minamo.dom.getDivsByClassName(panel, "item-time")[0], "value")[0].innerText = Domain.timeLongCoreStringFromTick(Domain.getTime(currentTick));
                                }
                            );
                        }
                    }
                    break;
                case "timer":
                    const dateString = Domain.dateCoreStringFromTick(tick) +" " +Domain.weekday(tick);
                    const currentDateSpan = screen.getElementsByClassName("current-date")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                    minamo.dom.setProperty(currentDateSpan, "innerText", dateString);
                    const getRainbowColor = Type.rainbowClockColorPatternMap[Storage.RainbowClock.colorPattern.get()];
                    const currentColor = getRainbowColor(currentNow.getHours());
                    setBackgroundColor(currentColor);
                    const hourUnit = 60 *60 *1000;
                    const minutes = (tick % hourUnit) / hourUnit;
                    const nextColor = getRainbowColor(currentNow.getHours() +1);
                    setScreenBarProgress(minutes, nextColor);
                    setBodyColor(Color.mixColors(currentColor, nextColor, minutes));
                    break;
                case "storage":
                    await reload();
                    break;
                case "operate":
                    timezones = Storage.RainbowClock.Timezone.get();
                    replaceScreenBody(await rainbowClockScreenBody(item, timezones));
                    resizeFlexList();
                    await updateWindow("timer");
                    await Render.scrollToOffset(document.getElementById("screen-body"), 0);
                    adjustPageFooterPosition();
                    break;
            }
        };
        await showWindow(await rainbowClockScreen(item, timezones), updateWindow);
        await updateWindow("timer");
    };
    export const updateTitle = () =>
    {
        document.title = minamo.dom.getDivsByClassName(getHeaderElement(), "segment-title")
            ?.map(div => div.innerText)
            // ?.reverse()
            ?.join(" / ")
            ?? config.applicationTitle;
    };
    export type UpdateWindowEventEype = "high-resolution-timer" | "timer" | "scroll" | "storage" | "focus" | "blur" | "operate";
    export let updateWindow: (event: UpdateWindowEventEype) => unknown;
    let updateWindowTimer = undefined;
    export const getHeaderElement = () => document.getElementById("screen-header") as HTMLDivElement;
    export const showWindow = async (screen: ScreenSource, updateWindow?: (event: UpdateWindowEventEype) => unknown) =>
    {
        if (undefined !== updateWindow)
        {
            Render.updateWindow = updateWindow;
        }
        else
        {
            Render.updateWindow = async (event: UpdateWindowEventEype) =>
            {
                if ("storage" === event || "operate" === event)
                {
                    await reload();
                }
            };
        }
        if (undefined === updateWindowTimer)
        {
            updateWindowTimer = setInterval
            (
                () => Render.updateWindow?.("high-resolution-timer"),
                36
            );
            updateWindowTimer = setInterval
            (
                () => Render.updateWindow?.("timer"),
                360
            );
            document.getElementById("screen-body").addEventListener
            (
                "scroll",
                () =>
                {
                    adjustPageFooterPosition();
                    adjustDownPageLinkDirection();
                    if (document.getElementById("screen-body").scrollTop <= 0)
                    {
                        Render.updateWindow?.("scroll");
                    }
                }
            );
        }
        setBackgroundColor(Color.getSolidRainbowColor(0));
        document.getElementById("screen").className = `${screen.className} screen`;
        minamo.dom.replaceChildren
        (
            getHeaderElement(),
            await Clockworks.tektite.header.segmented(screen.header)
        );
        minamo.dom.replaceChildren
        (
            document.getElementById("screen-body"),
            screen.body
        );
        updateTitle();
        //minamo.core.timeout(100);
        resizeFlexList();
        adjustPageFooterPosition();
    };
    export const getProgressElement = () => document.getElementById("screen-header").getElementsByClassName("progress-bar")[0] as HTMLDivElement;
    export const setScreenBarProgress = (percent: null | number, color?: string) =>
    {
        const setting = Storage.Settings.get().progressBarStyle ?? "auto";
        const screenBar = document.getElementsByClassName("screen-bar")[0] as HTMLDivElement;
        if (null !== percent && "header" !== setting)
        {
            if (color)
            {
                minamo.dom.setStyleProperty(screenBar, "backgroundColor", color);
            }
            const percentString = percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
            if ((window.innerHeight < window.innerWidth && "vertical" !== setting) || "horizontal" === setting)
            {
                minamo.dom.addCSSClass(screenBar, "horizontal");
                minamo.dom.removeCSSClass(screenBar, "vertical");
                minamo.dom.setStyleProperty(screenBar, "height", "initial");
                minamo.dom.setStyleProperty(screenBar, "maxHeight", "initial");
                minamo.dom.setStyleProperty(screenBar, "width", percentString);
                minamo.dom.setStyleProperty(screenBar, "maxWidth", percentString);
            }
            else
            {
                minamo.dom.addCSSClass(screenBar, "vertical");
                minamo.dom.removeCSSClass(screenBar, "horizontal");
                minamo.dom.setStyleProperty(screenBar, "width", "initial");
                minamo.dom.setStyleProperty(screenBar, "maxWidth", "initial");
                minamo.dom.setStyleProperty(screenBar, "height", percentString);
                minamo.dom.setStyleProperty(screenBar, "maxHeight", percentString);
            }
            minamo.dom.setStyleProperty(screenBar, "display", "block");
        }
        else
        {
            minamo.dom.setStyleProperty(screenBar, "display", "none");
        }
        const progressBar = getProgressElement();
        if (null !== percent && "header" === setting)
        {
            if (color)
            {
                minamo.dom.setStyleProperty(progressBar, "backgroundColor", color);
            }
            const percentString = percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
            minamo.dom.setStyleProperty(progressBar, "width", percentString);
            minamo.dom.setStyleProperty(progressBar, "borderRightWidth", "1px");
        }
        else
        {
            minamo.dom.setStyleProperty(progressBar, "width", "0%");
            minamo.dom.setStyleProperty(progressBar, "borderRightWidth", "0px");
        }
    };
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
    export const adjustPageFooterPosition = () =>
    {
        const primaryPage = document.getElementsByClassName("primary-page")[0];
        if (primaryPage)
        {
            const body = document.getElementById("screen-body");
            const delta = Math.max(primaryPage.clientHeight -(body.clientHeight +getBodyScrollTop()), 0);
            minamo.dom.getDivsByClassName(document, "page-footer")
                .forEach(i => minamo.dom.setStyleProperty(i, "paddingBottom", `calc(1rem + ${delta}px)`));
            // minamo.dom.getDivsByClassName(document, "down-page-link")
            //     .forEach(i => minamo.dom.setStyleProperty(i, "bottom", `calc(1rem + ${delta}px)`));
        }
    };
    export const adjustDownPageLinkDirection = () =>
        minamo.dom.getDivsByClassName(document, "down-page-link")
            .forEach(i => minamo.dom.toggleCSSClass(i, "reverse-down-page-link", ! isStrictShowPrimaryPage()));
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
                    adjustPageFooterPosition();
                }
            },
            100,
        );
    };
    export const onWindowFocus = () =>
    {
        updateWindow?.("focus");
    };
    export const onWindowBlur = () =>
    {
        updateWindow?.("blur");
    };
    let onUpdateStorageCount = 0;
    export const onUpdateStorage = () =>
    {
        const lastUpdate = Storage.lastUpdate = new Date().getTime();
        const onUpdateStorageCountCopy = onUpdateStorageCount = onUpdateStorageCount +1;
        setTimeout
        (
            () =>
            {
                if (lastUpdate === Storage.lastUpdate && onUpdateStorageCountCopy === onUpdateStorageCount)
                {
                    updateWindow?.("storage");
                }
            },
            50,
        );
    };
    let isInComposeSession: boolean = false;
    let lastestCompositionEndAt = 0;
    export const onCompositionStart = (_event: CompositionEvent) =>
    {
        isInComposeSession = true;
    };
    export const onCompositionEnd = (_event: CompositionEvent) =>
    {
        isInComposeSession = false;
        lastestCompositionEndAt = new Date().getTime();
    };
    export const isComposing = (event: KeyboardEvent) =>
    {
        return event.isComposing || isInComposeSession || new Date().getTime() < lastestCompositionEndAt +100;
    };
    export const onKeydown = (event: KeyboardEvent) =>
    {
        if ( ! isComposing(event))
        {
            switch(event.key)
            {
                case "Enter":
                    minamo.dom.getElementsByClassName<HTMLDivElement>(document, "popup")
                        .filter((_i, ix, list) => (ix +1) === list.length)
                        .forEach(popup => minamo.dom.getElementsByClassName<HTMLButtonElement>(popup, "default-button")?.[0]?.click());
                    break;
                case "Escape":
                    (Clockworks.tektite.screen.getScreenCover() ?? Clockworks.tektite.header.getCloseButton())?.click();
                    break;
            }
            const focusedElementTagName = document.activeElement?.tagName?.toLowerCase() ?? "";
            if (["input", "textarea"].indexOf(focusedElementTagName) < 0)
            {
                switch(event.key.toLowerCase())
                {
                    case "f":
                        if (Clockworks.tektite.fullscreen.enabled())
                        {
                            if(null === Clockworks.tektite.fullscreen.element())
                            {
                                Clockworks.tektite.fullscreen.request();
                            }
                            else
                            {
                                Clockworks.tektite.fullscreen.exit();
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
        if (Clockworks.tektite.fullscreen.enabled())
        {
            const now = lastMouseMouseAt = new Date().getTime();
            if (document.body.classList.contains("sleep-mouse"))
            {
                document.body.classList.remove("sleep-mouse");
            }
            if (Clockworks.tektite.fullscreen.element())
            {
                setTimeout
                (
                    () =>
                    {
                        if (Clockworks.tektite.fullscreen.element() && now === lastMouseMouseAt)
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
        Clockworks.tektite.onWebkitFullscreenChange(event);
    };
    export type ItemStateType = "nothing" | "regular" | "irregular" | "invalid";
    export const itemState = <T>(itemJson: string, item: T): ItemStateType =>
    {
        if (itemJson)
        {
            if (item)
            {
                if (JSON.stringify(item) !== itemJson)
                {
                    return "irregular";
                }
            }
            else
            {
                return "invalid";
            }
            return "regular";
        }
        return "nothing";
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
        Clockworks.tektite.screen.getScreenCover()?.click();
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
                show: async item => await Render.showRainbowClockScreen(item),
                parseItem: json => Domain.parseTimezone(json),
            },
            "CountdownTimer":
            {
                show: async item => await Render.showCountdownTimerScreen(item),
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
