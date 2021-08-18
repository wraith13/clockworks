import { minamo } from "./minamo.js";
import config from "../resource/config.json";
import localeEn from "../resource/lang.en.json";
import localeJa from "../resource/lang.ja.json";
import resource from "../resource/images.json";
export const simpleComparer = minamo.core.comparer.basic;
export const simpleReverseComparer = <T>(a: T, b: T) => -simpleComparer(a, b);
export module locale
{
    export const master =
    {
        en: localeEn,
        ja: localeJa,
    };
    export type LocaleKeyType =
        keyof typeof localeEn &
        keyof typeof localeJa;
    export type LocaleType = keyof typeof master;
    export const locales = Object.keys(master) as LocaleType[];
    let masterKey: LocaleType = 0 <= locales.indexOf(navigator.language as LocaleType) ?
        navigator.language as LocaleType:
        locales[0];
    export const getLocaleName = (locale: LocaleType) => master[locale].$name;
    export const setLocale = (locale: LocaleType | null) =>
    {
        const key = locale ?? navigator.language as LocaleType;
        if (0 <= locales.indexOf(key))
        {
            masterKey = key;
        }
    };
    export const get = () => masterKey;
    export const getPrimary = (key : LocaleKeyType) => master[masterKey][key];
    export const getSecondary = (key : LocaleKeyType) => master[locales.filter(locale => masterKey !== locale)[0]][key];
    export const string = (key : string) : string => getPrimary(key as LocaleKeyType) || key;
    export const map = (key : LocaleKeyType) : string => string(key);
    export const parallel = (key : LocaleKeyType) : string => `${getPrimary(key)} / ${getSecondary(key)}`;
}
export module Clockworks
{
    export const applicationTitle = config.applicationTitle;
    export const application =
    {
        "Never Stopwatch":
        {
            icon: <Render.Resource.KeyType>"application-icon",
            show: async () => await Render.showNeverStopwatchScreen(),
        },
        "Countdown Timer":
        {
            icon: <Render.Resource.KeyType>"history-icon",
            show: async () => await Render.showCountdownTimerScreen(),
        },
        "Rainbow Clock":
        {
            icon: <Render.Resource.KeyType>"tick-icon",
            show: async () => await Render.showRainbowClockScreen(),
        },
    };
    export interface Settings
    {
        theme?: "auto" | "light" | "dark";
        locale?: locale.LocaleType;
    }
    export interface AlermTimerEntry
    {
        type: "timer";
        start: number;
        end: number;
    }
    export interface AlermScheduleEntry
    {
        type: "schedule";
        title: string;
        start: number;
        end: number;
    }
    export type AlermEntry = AlermTimerEntry | AlermScheduleEntry;
    const setTitle = (title: string) =>
    {
        if (document.title !== title)
        {
            document.title = title;
        }
    };
    const getRainbowColor = (index: number, baseIndex = config.rainbowColorSetDefaultIndex) =>
        config.rainbowColorSet[(index +baseIndex) % config.rainbowColorSet.length];
    const getSolidRainbowColor = (index: number, baseIndex = config.rainbowColorSetDefaultIndex) =>
        getRainbowColor(index *config.rainbowColorSetSolidIndexRate, baseIndex);
    const setBodyColor = (color: string) =>
    {
        const bodyColor = `${color}E8`;
        if (document.body.style.backgroundColor !== bodyColor)
        {
            document.body.style.backgroundColor = bodyColor;
        }
    };
    const setFoundationColor = (color: string) =>
    {
        const foundation = document.getElementById("foundation");
        if (foundation.style.backgroundColor !== color)
        {
            foundation.style.backgroundColor = color;
        }
};
    export const rainbowClockColorPatternMap =
    {
        "gradation": (index: number) => getRainbowColor(index, 0),
        "solid": (index: number) => getSolidRainbowColor(index, 0),
    };
    export type rainbowClockColorPatternType = keyof typeof rainbowClockColorPatternMap;
    export module Storage
    {
        export let lastUpdate = 0;
        export module Stamps
        {
            export const makeKey = () => `${config.localDbPrefix}:stamps`;
            export const get = (): number[] => minamo.localStorage.getOrNull<number[]>(makeKey()) ?? [];
            export const set = (list: number[]) => minamo.localStorage.set(makeKey(), list);
            export const removeKey = () => minamo.localStorage.remove(makeKey());
            export const add = (tick: number | number[]) =>
                set(get().concat(tick).sort(simpleReverseComparer));
            export const remove = (tick: number) =>
                set(get().filter(i => tick !== i).sort(simpleReverseComparer));
        }
        export module Alerms
        {
            export const makeKey = () => `${config.localDbPrefix}:alerms`;
            export const get = (): AlermEntry[] => minamo.localStorage.getOrNull<AlermEntry[]>(makeKey()) ?? [];
            export const set = (list: AlermEntry[]) => minamo.localStorage.set(makeKey(), list);
            export const removeKey = () => minamo.localStorage.remove(makeKey());
            export const add = (tick: AlermEntry | AlermEntry[]) =>
                set(get().concat(tick).sort(simpleReverseComparer));
            export const remove = (tick: AlermEntry) =>
                set(get().filter(i => JSON.stringify(tick) !== JSON.stringify(i)).sort(simpleReverseComparer));
        }
        export module Settings
        {
            export const makeKey = () => `${config.localDbPrefix}:settings`;
            export const get = () =>
                minamo.localStorage.getOrNull<Clockworks.Settings>(makeKey()) ?? { };
            export const set = (settings: Clockworks.Settings) =>
                minamo.localStorage.set(makeKey(), settings);
        }
        export module flashInterval
        {
            export const makeKey = () => `${config.localDbPrefix}:flashInterval`;
            export const get = () => minamo.localStorage.getOrNull<number>(makeKey()) ?? 0;
            export const set = (value: number) => minamo.localStorage.set(makeKey(), value);
        }
        export module rainbowClockColorPattern
        {
            export const makeKey = () => `${config.localDbPrefix}:rainbowClockColorPattern`;
            export const get = () =>
                minamo.localStorage.getOrNull<rainbowClockColorPatternType>(makeKey()) ?? "gradation";
            export const set = (settings: rainbowClockColorPatternType) =>
                minamo.localStorage.set(makeKey(), settings);
        }
        export module lastApplication
        {
            export const makeKey = () => `${config.localDbPrefix}:lastApplication`;
            export const get = () => minamo.localStorage.getOrNull<keyof typeof application>(makeKey()) ?? "Never Stopwatch";
            export const set = (value: keyof typeof application) => minamo.localStorage.set(makeKey(), value);
        }
    }
    export module Domain
    {
        export const makeTimerLabel = (minutes: number) => `${minutes} ${locale.map("m(minutes)")}`;
        export const getTicks = (date: Date = new Date()) => date.getTime();
        export const weekday = (tick: number) =>
            new Intl.DateTimeFormat(locale.get(), { weekday: 'long'}).format(tick);
        export const dateCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            {
                const date = new Date(tick);
                return `${date.getFullYear()}-${("0" +(date.getMonth() +1)).substr(-2)}-${("0" +date.getDate()).substr(-2)}`;
            }
        };
        export const getTime = (tick: null | number): null | number =>
        {
            if (null === tick)
            {
                return null;
            }
            else
            if (tick < 0)
            {
                return -getTime(tick);
            }
            else
            if (tick < 24 *60 *60 *1000)
            {
                return tick;
            }
            else
            {
                const date = new Date(tick);
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
                return tick -getTicks(date);
            }
        };
        export const dateStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            {
                return `${dateCoreStringFromTick(tick)} ${timeLongCoreStringFromTick(getTime(tick))}`;
            }
        };
        export const dateFullStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            {
                return `${dateCoreStringFromTick(tick)} ${timeFullCoreStringFromTick(getTime(tick))}`;
            }
        };
        export const timeLongCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${timeLongCoreStringFromTick(-tick)}`;
            }
            else
            {
                const hour = Math.floor(tick /(60 *60 *1000)) %24;
                const minute = Math.floor(tick /(60 *1000)) %60;
                const second = Math.floor(tick /(1000)) %60;
                return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}:${("00" +second).slice(-2)}`;
            }
        };
        export const timeFullCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${timeFullCoreStringFromTick(-tick)}`;
            }
            else
            {
                const hour = Math.floor(tick /(60 *60 *1000)) %24;
                const minute = Math.floor(tick /(60 *1000)) %60;
                const second = Math.floor(tick /(1000)) %60;
                const milliseconds = tick %1000;
                return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}:${("00" +second).slice(-2)}.${("000" +milliseconds).slice(-3)}`;
            }
        };
        export const timeShortStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${timeShortStringFromTick(-tick)}`;
            }
            else
            {
                // if (tick < 60 *1000)
                // {
                //     return timeFullCoreStringFromTick(tick);
                // }
                if (tick < 60 *60 *1000)
                {
                    return timeLongCoreStringFromTick(tick);
                }
                const days = Math.floor(tick / (24 *60 *60 *1000));
                if (days < 1)
                {
                    return timeLongCoreStringFromTick(tick);
                }
                return `${days.toLocaleString()} ${locale.map("days")} ${timeLongCoreStringFromTick(tick)}`;
            }
        };
        export const timeLongStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${timeLongStringFromTick(-tick)}`;
            }
            else
            {
                const days = Math.floor(tick / (24 *60 *60 *1000));
                return 0 < days ?
                    `${days.toLocaleString()} ${locale.map("days")} ${timeFullCoreStringFromTick(tick)}`:
                    timeFullCoreStringFromTick(tick);
            }
        };
        export const parseDate = (date: string | null): Date | null =>
        {
            if (null !== date)
            {
                try
                {
                    return new Date(Date.parse(date));
                }
                catch
                {
                    return null;
                }
            }
            return null;
        };
    }
    export module Render
    {
        export module Operate
        {
            export const stamp = async (tick: number, onCanceled?: () => unknown) =>
            {
                const backup = Storage.Stamps.get();
                Storage.Stamps.add(tick);
                updateWindow("operate");
                const toast = makePrimaryToast
                ({
                    content: $span("")(`${locale.map("Stamped!")}`),
                    backwardOperator: cancelTextButton
                    (
                        async () =>
                        {
                            Storage.Stamps.set(backup);
                            updateWindow("operate");
                            await toast.hide();
                            onCanceled?.();
                        }
                    ),
                });
            };
            export const edit = async (oldTick: number, newTick: number, onCanceled?: () => unknown) =>
            {
                const backup = Storage.Stamps.get();
                Storage.Stamps.remove(oldTick);
                Storage.Stamps.add(newTick);
                updateWindow("operate");
                const toast = makePrimaryToast
                ({
                    content: $span("")(`${locale.map("Updated.")}`),
                    backwardOperator: cancelTextButton
                    (
                        async () =>
                        {
                            Storage.Stamps.set(backup);
                            updateWindow("operate");
                            await toast.hide();
                            onCanceled?.();
                        }
                    ),
                });
            };
            export const removeStamp = async (tick: number, onCanceled?: () => unknown) =>
            {
                const backup = Storage.Stamps.get();
                Storage.Stamps.remove(tick);
                updateWindow("operate");
                const toast = makePrimaryToast
                ({
                    content: $span("")(`${locale.map("Removed.")}`),
                    backwardOperator: cancelTextButton
                    (
                        async () =>
                        {
                            Storage.Stamps.set(backup);
                            updateWindow("operate");
                            await toast.hide();
                            onCanceled?.();
                        }
                    ),
                });
            };
            export const reset = async (onCanceled?: () => unknown) =>
            {
                const backup = Storage.Stamps.get();
                Storage.Stamps.removeKey();
                updateWindow("operate");
                const toast = makePrimaryToast
                ({
                    content: $span("")(`リセットしました。`),
                    backwardOperator: cancelTextButton
                    (
                        async () =>
                        {
                            Storage.Stamps.set(backup);
                            updateWindow("operate");
                            await toast.hide();
                            onCanceled?.();
                        }
                    ),
                });
            };
            export const newTimer = async (i: number, onCanceled?: () => unknown) =>
            {
                const tick = Domain.getTicks();
                const alerm: AlermTimerEntry =
                {
                    type: "timer",
                    start: tick,
                    end: tick +(i *60 *1000),
                };
                Storage.Alerms.add(alerm);
                updateWindow("operate");
                const toast = makePrimaryToast
                ({
                    content: $span("")(`${locale.map("Done!")}`),
                    backwardOperator: cancelTextButton
                    (
                        async () =>
                        {
                            Storage.Alerms.remove(alerm);
                            updateWindow("operate");
                            await toast.hide();
                            onCanceled?.();
                        }
                    ),
                });
            };
            export const newSchedule = async (title: string, end: number, onCanceled?: () => unknown) =>
            {
                const alerm: AlermScheduleEntry =
                {
                    type: "schedule",
                    title,
                    start: Domain.getTicks(),
                    end,
                };
                Storage.Alerms.add(alerm);
                updateWindow("operate");
                const toast = makePrimaryToast
                ({
                    content: $span("")(`${locale.map("Done!")}`),
                    backwardOperator: cancelTextButton
                    (
                        async () =>
                        {
                            Storage.Alerms.remove(alerm);
                            updateWindow("operate");
                            await toast.hide();
                            onCanceled?.();
                        }
                    ),
                });
            };
            export const done = async (tick: number, onCanceled?: () => unknown) =>
            {
                const backup = Storage.Stamps.get();
                Storage.Stamps.add(tick);
                updateWindow("operate");
                const toast = makePrimaryToast
                ({
                    content: $span("")(`${locale.map("Done!")}`),
                    backwardOperator: cancelTextButton
                    (
                        async () =>
                        {
                            Storage.Stamps.set(backup);
                            updateWindow("operate");
                            await toast.hide();
                            onCanceled?.();
                        }
                    ),
                });
            };
            export const removeAlert = async (item: AlermEntry, onCanceled?: () => unknown) =>
            {
                Storage.Alerms.remove(item);
                updateWindow("operate");
                const toast = makePrimaryToast
                ({
                    content: $span("")(`${locale.map("Removed.")}`),
                    backwardOperator: cancelTextButton
                    (
                        async () =>
                        {
                            Storage.Alerms.add(item);
                            updateWindow("operate");
                            await toast.hide();
                            onCanceled?.();
                        }
                    ),
                });
            };
        }
        export const cancelTextButton = (onCanceled: () => unknown) =>
        ({
            tag: "button",
            className: "text-button",
            children: label("roll-back"),
            onclick: async () =>
            {
                onCanceled();
                makeToast
                ({
                    content: $span("")(label("roll-backed")),
                    wait: 3000,
                });
            },
        });
        export const externalLink = (data: { className?: string, href: string, children: minamo.dom.Source}) =>
        ({
            tag: "a",
            className: data.className,
            href: data.href,
            children: data.children,
        });
        export const $make = minamo.dom.make;
        export const $tag = (tag: string) => (className: string | object) => (children: minamo.dom.Source) =>
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
        export const label = (label: locale.LocaleKeyType) => labelSpan
        ([
            $span("locale-parallel")(locale.parallel(label)),
            $span("locale-map")(locale.map(label)),
        ]);
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
                    const ui = popup
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
                                    children: locale.map("Cancel"),
                                    onclick: () =>
                                    {
                                        result = null;
                                        ui.close();
                                    },
                                },
                                {
                                    tag: "button",
                                    className: "default-button",
                                    children: locale.map("OK"),
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
        export const themeSettingsPopup = async (settings: Settings = Storage.Settings.get()): Promise<boolean> =>
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
                                ["auto", "light", "dark"].map
                                (
                                    async (key: "auto" | "light" | "dark") =>
                                    ({
                                        tag: "button",
                                        className: `check-button ${key === (settings.theme ?? "auto") ? "checked": ""}`,
                                        children:
                                        [
                                            await Resource.loadSvgOrCache("check-icon"),
                                            $span("")(label(<"theme.auto" | "theme.light" | "theme.dark">`theme.${key}`)),
                                        ],
                                        onclick: async () =>
                                        {
                                            if (key !== (settings.theme ?? "auto"))
                                            {
                                                settings.theme = key;
                                                Storage.Settings.set(settings);
                                                await checkButtonListUpdate();
                                                result = init !== key;
                                            }
                                        }
                                    })
                                )
                            )
                        ]
                    );
                    await checkButtonListUpdate();
                    const ui = popup
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
        export const localeSettingsPopup = async (settings: Settings = Storage.Settings.get()): Promise<boolean> =>
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
                                locale.locales.map
                                (
                                    async key =>
                                    ({
                                        tag: "button",
                                        className: `check-button ${key === (settings.locale ?? "@auto") ? "checked": ""}`,
                                        children:
                                        [
                                            await Resource.loadSvgOrCache("check-icon"),
                                            $span("")(labelSpan(locale.getLocaleName(key))),
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
                    const ui = popup
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
        export const colorSettingsPopup = async (settings = Storage.rainbowClockColorPattern.get()): Promise<boolean> =>
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
                                Object.keys(rainbowClockColorPatternMap).map
                                (
                                    async (key: rainbowClockColorPatternType) =>
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
                                                Storage.rainbowClockColorPattern.set(settings);
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
                    const ui = popup
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
        export const newTimerPopup = async (): Promise<boolean> =>
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
                                config.timerPreset.map
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
                                            await Operate.newTimer(i);
                                            result = true;
                                            ui.close();
                                        }
                                    })
                                )
                            )
                        ]
                    );
                    await checkButtonListUpdate();
                    const ui = popup
                    ({
                        // className: "add-remove-tags-popup",
                        children:
                        [
                            $tag("h2")("")(label("New Timer")),
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
        export const schedulePrompt = async (message: string, title: string, _default: number): Promise<string | null> =>
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
                    const ui = popup
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
                                    children: locale.map("Cancel"),
                                    onclick: () =>
                                    {
                                        result = null;
                                        ui.close();
                                    },
                                },
                                {
                                    tag: "button",
                                    className: "default-button",
                                    children: locale.map("OK"),
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
        export const screenCover = (data: { children?: minamo.dom.Source, onclick: () => unknown, }) =>
        {
            const dom = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "screen-cover fade-in",
                children: data.children,
                onclick: async () =>
                {
                    console.log("screen-cover.click!");
                    dom.onclick = undefined;
                    data.onclick();
                    close();
                }
            });
            const close = async () =>
            {
                dom.classList.remove("fade-in");
                dom.classList.add("fade-out");
                await minamo.core.timeout(500);
                minamo.dom.remove(dom);
            };
            minamo.dom.appendChildren(document.getElementById("screen"), dom);
            const result =
            {
                dom,
                close,
            };
            return result;
        };
        export const getScreenCoverList = () => Array.from(document.getElementsByClassName("screen-cover")) as HTMLDivElement[];
        export const getScreenCover = () => getScreenCoverList().filter((_i, ix, list) => (ix +1) === list.length)[0];
        export const hasScreenCover = () => 0 < getScreenCoverList().length;
        export const popup =
        (
            data:
            {
                className?: string,
                children: minamo.dom.Source,
                onClose?: () => Promise<unknown>
            }
        ) =>
        {
            const dom = $make(HTMLDivElement)
            ({
                tag: "div",
                className: `popup locale-parallel-off ${data.className ?? ""}`,
                children: data.children,
                onclick: async (event: MouseEvent) =>
                {
                    console.log("popup.click!");
                    event.stopPropagation();
                    //(Array.from(document.getElementsByClassName("screen-cover")) as HTMLDivElement[]).forEach(i => i.click());
                },
            });
            const close = async () =>
            {
                await data?.onClose();
                cover.close();
            };
            // minamo.dom.appendChildren(document.body, dom);
            const cover = screenCover
            ({
                children:
                [
                    dom,
                    { tag: "div", }, // レイアウト調整用のダミー要素 ( この調整がないとポップアップが小さく且つ入力要素がある場合に iPad でキーボードの下に dom が隠れてしまう。 )
                ],
                onclick: async () =>
                {
                    await data?.onClose();
                    //minamo.dom.remove(dom);
                },
            });
            const result =
            {
                dom,
                close,
            };
            return result;
        };
        export const menuButton = async (menu: minamo.dom.Source | (() => Promise<minamo.dom.Source>)) =>
        {
            let cover: { dom: HTMLDivElement, close: () => Promise<unknown> };
            const close = () =>
            {
                popup.classList.remove("show");
                cover = null;
            };
            const popup = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "menu-popup",
                children: "function" !== typeof menu ? menu: [ ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-popup.click!");
                    cover?.close();
                    close();
                },
            });
            const button = $make(HTMLButtonElement)
            ({
                tag: "button",
                className: "menu-button",
                children:
                [
                    await Resource.loadSvgOrCache("ellipsis-icon"),
                ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-button.click!");
                    if ("function" === typeof menu)
                    {
                        minamo.dom.replaceChildren(popup, await menu());
                    }
                    popup.classList.add("show");
                    cover = screenCover
                    ({
                        onclick: close,
                    });
                },
            });
            return [ button, popup, ];
        };
        export const menuItem = (children: minamo.dom.Source, onclick?: (event: MouseEvent | TouchEvent) => unknown, className?: string) =>
        ({
            tag: "button",
            className,
            children,
            onclick,
        });
        // export const menuLinkItem = (children: minamo.dom.Source, href: PageParams, className?: string) => internalLink
        // ({
        //     className,
        //     href,
        //     children,
        // });
        export const tickItem = async (tick: number, interval: number | null) => $div("tick-item flex-item")
        ([
            $div("item-header")
            ([
                $div("item-title")
                ([
                    await Resource.loadSvgOrCache("tick-icon"),
                    $div("tick-elapsed-time")
                    ([
                        $span("value monospace")(label("elapsed time")),
                    ]),
                ]),
                $div("item-operator")
                ([
                    await menuButton
                    ([
                        menuItem
                        (
                            label("Edit"),
                            async () =>
                            {
                                const result = Domain.parseDate(await dateTimePrompt(locale.map("Edit"), tick));
                                if (null !== result)
                                {
                                    const newTick = Domain.getTicks(result);
                                    if (tick !== Domain.getTicks(result))
                                    {
                                        if (0 <= newTick && newTick <= Domain.getTicks())
                                        {
                                            await Operate.edit(tick, newTick);
                                        }
                                        else
                                        {
                                            makeToast
                                            ({
                                                content: label("A date and time outside the valid range was specified."),
                                                isWideContent: true,
                                            });
                                        }
                                    }
                                }
                            }
                        ),
                        menuItem
                        (
                            label("Remove"),
                            async () => await Operate.removeStamp(tick),
                            "delete-button"
                        )
                    ]),
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
        export const alermItem = async (item: AlermEntry) => $div("alerm-item flex-item")
        ([
            $div("item-header")
            ([
                $div("item-title")
                ([
                    await Resource.loadSvgOrCache("tick-icon"),
                    $div("tick-elapsed-time")
                    ([
                        $span("value monospace")
                        (
                            "timer" === item.type ?
                                Domain.makeTimerLabel(item.end -item.start):
                                item.title
                        ),
                    ]),
                ]),
                $div("item-operator")
                ([
                    await menuButton
                    ([
                        menuItem
                        (
                            label("Edit"),
                            async () =>
                            {
                                // const result = Domain.parseDate(await dateTimePrompt(locale.map("Edit"), tick));
                                // if (null !== result)
                                // {
                                //     const newTick = Domain.getTicks(result);
                                //     if (tick !== Domain.getTicks(result))
                                //     {
                                //         if (0 <= newTick && newTick <= Domain.getTicks())
                                //         {
                                //             await Operate.edit(tick, newTick);
                                //         }
                                //         else
                                //         {
                                //             makeToast
                                //             ({
                                //                 content: label("A date and time outside the valid range was specified."),
                                //                 isWideContent: true,
                                //             });
                                //         }
                                //     }
                                // }
                            }
                        ),
                        menuItem
                        (
                            label("Remove"),
                            async () => await Operate.removeAlert(item),
                            "delete-button"
                        )
                    ]),
                ]),
            ]),
            // $div("item-information")
            // ([
            //     $div("alert-due-timestamp")
            //     ([
            //         label("Due timestamp"),
            //         $span("value monospace")(Domain.dateFullStringFromTick(item.end)),
            //     ]),
            //     $div("alert-due-rest")
            //     ([
            //         label("Rest"),
            //         $span("value monospace")(Domain.timeLongStringFromTick(item.end -Domain.getTicks())),
            //     ]),
            // ]),
        ]);
        export interface HeaderSegmentSource
        {
            icon: Resource.KeyType;
            title: string;
            menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
        }
        export interface HeaderSource
        {
            items: HeaderSegmentSource[];
            menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
            operator?: minamo.dom.Source;
        }
        export interface ScreenSource
        {
            className: string;
            header: HeaderSource;
            body: minamo.dom.Source;
        }
        const getLastSegmentClass = (data:HeaderSource, ix: number) => ix === data.items.length -1 ?
            //(! data.operator  ? "last-segment fill-header-segment": "last-segment"): undefined;
            "last-segment": undefined;
        export const screenSegmentedHeader = async (data:HeaderSource) =>
        [
            $div("progress-bar")([]),
            (
                await Promise.all
                (
                    data.items
                    .map
                    (
                        async (item, ix) =>
                            (item.menu && screenHeaderPopupSegment(item, getLastSegmentClass(data,ix))) ||
                            (true && screenHeaderLabelSegment(item, getLastSegmentClass(data,ix)))
                    )
                )
            ).reduce((a, b) => (a as any[]).concat(b), []),
            data.menu ? await menuButton(data.menu): [],
            data.operator ? $div("header-operator")(data.operator): [],
        ];
        export const getCloseButton = () => getHeaderElement().getElementsByClassName("close-button")[0] as HTMLButtonElement;
        export const screenHeaderSegmentCore = async (item: HeaderSegmentSource) =>
        [
            $div("icon")(await Resource.loadSvgOrCache(item.icon)),
            $div("segment-title")(item.title),
        ];
        export const screenHeaderLabelSegment = async (item: HeaderSegmentSource, className: string = "") =>
            $div(`segment label-segment ${className}`)(await screenHeaderSegmentCore(item));
        export const screenHeaderLinkSegment = async (item: HeaderSegmentSource, className: string = "") => $div(`segment ${className}`)
        ({
            children: await screenHeaderSegmentCore(item),
        });
        export const screenHeaderPopupSegment = async (item: HeaderSegmentSource, className: string = "") =>
        {
            let cover: { dom: HTMLDivElement, close: () => Promise<unknown> };
            const close = () =>
            {
                popup.classList.remove("show");
                cover = null;
            };
            const popup = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "menu-popup segment-popup",
                children: "function" !== typeof item.menu ? item.menu: [ ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-popup.click!");
                    cover?.close();
                    close();
                },
            });
            const segment = $make(HTMLDivElement)
            ({
                tag: "div",
                className: `segment ${className}`,
                children: await screenHeaderSegmentCore(item),
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-button.click!");
                    if ("function" === typeof item.menu)
                    {
                        minamo.dom.replaceChildren(popup, await item.menu());
                    }
                    popup.classList.add("show");
                    //popup.style.height = `${popup.offsetHeight -2}px`;
                    popup.style.width = `${popup.offsetWidth -2}px`;
                    popup.style.top = `${segment.offsetTop +segment.offsetHeight}px`;
                    popup.style.left = `${Math.max(segment.offsetLeft, 4)}px`;
                    cover = screenCover
                    ({
                        onclick: close,
                    });
                },
            });
            return [ segment, popup, ];
        };
        export const screenHeaderHomeSegment = async (applicationType: keyof typeof application): Promise<HeaderSegmentSource> =>
        ({
            icon: application[applicationType].icon,
            title: applicationType,
            menu: await Promise.all
            (
                Object.keys(application).map
                (
                    async i =>
                    menuItem
                    (
                        [ await Resource.loadSvgOrCache(application[i].icon), i, ],
                        async () => await application[i].show(),
                        applicationType === i ? "current-item": undefined
                    )
                )
            )
        });
        export const screenHeaderFlashSegmentMenu = async (flashInterval: number): Promise<minamo.dom.Source> => await Promise.all
        (
            config.flashIntervalPreset.map
            (
                async i =>
                menuItem
                (
                    [
                        await Resource.loadSvgOrCache(0 === i ? "sleep-icon": "flash-icon"),
                        labelSpan(0 === i ? locale.map("No Flash"): `${locale.map("Interval")}: ${Domain.makeTimerLabel(i)}`),
                    ],
                    async () =>
                    {
                        Storage.flashInterval.set(i);
                        await reload();
                    },
                    flashInterval === i ? "current-item": undefined
                )
            )
        );
        export const screenHeaderFlashSegment = async (flashInterval: number): Promise<HeaderSegmentSource> =>
        ({
            icon: 0 === flashInterval ? "sleep-icon": "flash-icon",
            title: 0 === flashInterval ? locale.map("No Flash"): `${locale.map("Interval")}: ${Domain.makeTimerLabel(flashInterval)}`,
            menu: await screenHeaderFlashSegmentMenu(flashInterval),
        });
        export const replaceScreenBody = (body: minamo.dom.Source) => minamo.dom.replaceChildren
        (
            document.getElementsByClassName("screen-body")[0],
            body
        );

        export module Resource
        {
            export type KeyType = keyof typeof resource;
            export const loadSvgOrCache = async (key: KeyType): Promise<SVGElement> =>
            {
                try
                {
                    return new DOMParser().parseFromString(document.getElementById(key).innerHTML, "image/svg+xml").documentElement as any;
                }
                catch(error)
                {
                    console.log({key});
                    throw error;
                }
            };
        }
        export const screenFlash = () =>
        {
            document.body.classList.add("flash");
            setTimeout(() => document.body.classList.remove("flash"), 1500);
        };
        export const fullscreenMenuItem = async () =>
            document.fullscreenEnabled ?
                (
                    null === document.fullscreenElement ?
                        menuItem
                        (
                            label("Full screen"),
                            async () => await document.body.requestFullscreen(),
                        ):
                        menuItem
                        (
                            label("Cancel full screen"),
                            async () => await document.exitFullscreen(),
                        )
                ):
                [];
                
        export const themeMenuItem = async () =>
            menuItem
            (
                label("Theme setting"),
                async () =>
                {
                    if (await themeSettingsPopup())
                    {
                        updateStyle();
                    }
                }
            );
        export const languageMenuItem = async () =>
            menuItem
            (
                label("Language setting"),
                async () =>
                {
                    if (await localeSettingsPopup())
                    {
                        locale.setLocale(Storage.Settings.get().locale);
                        await reload();
                    }
                }
            );
        export const resetMenuItem = async () =>
            menuItem
            (
                label("Reset"),
                async () => await Operate.reset(),
                "delete-button"
            );
        export const githubMenuItem = async () =>
            externalLink
            ({
                href: config.repositoryUrl,
                children: menuItem(labelSpan("GitHub")),
            });
        export const neverStopwatchScreenMenu = async () =>
        [
            await fullscreenMenuItem(),
            await themeMenuItem(),
            await languageMenuItem(),
            await resetMenuItem(),
            await githubMenuItem(),
        ];
        export const neverStopwatchScreenBody = async (ticks: number[]) =>
        ([
            $div("primary-page")
            ([
                $div("main-panel")
                ([
                    $div("capital-interval")
                    ([
                        $span("value monospace")(Domain.timeLongStringFromTick(0)),
                    ]),
                    $div("current-timestamp")
                    ([
                        $span("value monospace")(Domain.dateFullStringFromTick(Domain.getTicks())),
                    ]),
                    $div("button-list")
                    ({
                        tag: "button",
                        className: "default-button main-button long-button",
                        children: label("Stamp"),
                        onclick: async () => await Operate.stamp(Domain.getTicks())
                    }),
                ]),
            ]),
            $div("trail-page")
            ([
                $div("column-flex-list tick-list")
                (
                    await Promise.all
                    (
                        ticks.map
                        (
                            (tick, index) => tickItem
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
                    ])
                ),
            ]),
            $div("screen-bar")([]),
        ]);
        export const neverStopwatchScreen = async (ticks: number[]): Promise<ScreenSource> =>
        ({
            className: "never-stopwatch-screen",
            header:
            {
                items:
                [
                    await screenHeaderHomeSegment("Never Stopwatch"),
                    await screenHeaderFlashSegment(Storage.flashInterval.get()),
                ],
                menu: neverStopwatchScreenMenu
            },
            body: await neverStopwatchScreenBody(ticks)
        });
        let previousPrimaryStep = 0;
        export const showNeverStopwatchScreen = async () =>
        {
            const applicationTitle = "Never Stopwatch";
            document.body.classList.add("hide-scroll-bar");
            Storage.lastApplication.set(applicationTitle);
            let ticks = Storage.Stamps.get();
            const updateWindow = async (event: UpdateWindowEventEype) =>
            {
                const screen = document.getElementById("screen") as HTMLDivElement;
                const now = new Date();
                const tick = Domain.getTicks(now);
                switch(event)
                {
                    case "high-resolution-timer":
                        (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeLongStringFromTick(0 < ticks.length ? tick -ticks[0]: 0);
                        const capitalTime = Domain.dateStringFromTick(tick);
                        const capitalTimeSpan = screen.getElementsByClassName("current-timestamp")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                        if(capitalTimeSpan.innerText !== capitalTime)
                        {
                            capitalTimeSpan.innerText = capitalTime;
                        }
                        const flashInterval = Storage.flashInterval.get();
                        if (0 < flashInterval && 0 < ticks.length)
                        {
                            const elapsed = Domain.getTicks() -ticks[0];
                            const unit = flashInterval *60 *1000;
                            const primaryStep = Math.floor(elapsed / unit);
                            if (primaryStep === previousPrimaryStep +1 && (elapsed % unit) < 5 *1000)
                            {
                                screenFlash();
                            }
                            const currentColor = getSolidRainbowColor(primaryStep);
                            setFoundationColor(currentColor);
                            previousPrimaryStep = primaryStep;
                            const rate = ((Domain.getTicks() -ticks[0]) %unit) /unit;
                            const nextColor = getSolidRainbowColor(primaryStep +1);
                            setScreenBarProgress(rate, nextColor);
                            setBodyColor(nextColor);
                            getHeaderElement().classList.add("with-screen-prgress");
                        }
                        else
                        {
                            previousPrimaryStep = 0;
                            setScreenBarProgress(null);
                            getHeaderElement().classList.remove("with-screen-prgress");
                            const currentColor = getSolidRainbowColor(0);
                            setFoundationColor(currentColor);
                            setBodyColor(currentColor);
                        }
                        break;
                    case "timer":
                        setTitle(0 < ticks.length ? Domain.timeShortStringFromTick(Domain.getTicks() -ticks[0]) +" - " +applicationTitle: applicationTitle);
                        (
                            Array.from
                            (
                                (screen.getElementsByClassName("tick-list")[0] as HTMLDivElement).childNodes
                            ) as HTMLDivElement[]
                        ).forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("tick-elapsed-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeShortStringFromTick(Domain.getTicks() -ticks[index]);
                            }
                        );
                        break;
                    case "storage":
                        await reload();
                        break;
                    case "operate":
                        previousPrimaryStep = 0;
                        ticks = Storage.Stamps.get();
                        replaceScreenBody(await neverStopwatchScreenBody(ticks));
                        resizeFlexList();
                        await updateWindow("timer");
                        break;
                }
            };
            await showWindow(await neverStopwatchScreen(ticks), updateWindow);
            await updateWindow("timer");
        };
        export const countdownTimerScreenBody = async (alerts: AlermEntry[]) =>
        ([
            $div("primary-page")
            ([
                $div("main-panel")
                ([
                    $div("capital-interval")
                    ([
                        $span("value monospace")(Domain.timeLongStringFromTick(0)),
                    ]),
                    $div("current-timestamp")
                    ([
                        $span("value monospace")(Domain.dateFullStringFromTick(Domain.getTicks())),
                    ]),
                    $div("button-list")
                    ({
                        tag: "button",
                        id: "done-button",
                        className: "default-button main-button long-button",
                        children: label("Done"),
                        onclick: async () => await Operate.done(Domain.getTicks())
                    }),
                ]),
            ]),
            $div("trail-page")
            ([
                $div("button-list")
                ([
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: label("New Timer"),
                        onclick: async () => await newTimerPopup()
                    },
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: label("New Schedule"),
                        onclick: async () =>
                        {
                            await schedulePrompt(locale.map("New Schedule"), locale.map("New Schedule"), Domain.getTicks());
                        }
                    },
                ]),
                $div("column-flex-list tick-list")
                (
                    await Promise.all(alerts.map(item => alermItem(item)))
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
            $div("screen-bar")([]),
        ]);
        export const countdownTimerScreen = async (alerts: AlermEntry[]): Promise<ScreenSource> =>
        ({
            className: "countdown-timer-screen",
            header:
            {
                items:
                [
                    await screenHeaderHomeSegment("Countdown Timer"),
                    await screenHeaderFlashSegment(Storage.flashInterval.get()),
                ],
                menu: neverStopwatchScreenMenu
            },
            body: await countdownTimerScreenBody(alerts)
        });
        export const showCountdownTimerScreen = async () =>
        {
            const applicationTitle = "Countdown Timer";
            document.body.classList.add("hide-scroll-bar");
            Storage.lastApplication.set(applicationTitle);
            let alerts = Storage.Alerms.get();
            let ticks = Storage.Stamps.get();
            const updateWindow = async (event: UpdateWindowEventEype) =>
            {
                const screen = document.getElementById("screen") as HTMLDivElement;
                const now = new Date();
                const tick = Domain.getTicks(now);
                switch(event)
                {
                    case "high-resolution-timer":
                        (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeLongStringFromTick(0 < ticks.length ? tick -ticks[0]: 0);
                        const capitalTime = Domain.dateStringFromTick(tick);
                        const capitalTimeSpan = screen.getElementsByClassName("current-timestamp")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                        if(capitalTimeSpan.innerText !== capitalTime)
                        {
                            capitalTimeSpan.innerText = capitalTime;
                        }
                        const flashInterval = Storage.flashInterval.get();
                        if (0 < flashInterval && 0 < ticks.length)
                        {
                            const elapsed = Domain.getTicks() -ticks[0];
                            const unit = flashInterval *60 *1000;
                            const primaryStep = Math.floor(elapsed / unit);
                            if (primaryStep === previousPrimaryStep +1 && (elapsed % unit) < 5 *1000)
                            {
                                screenFlash();
                            }
                            const currentColor = getSolidRainbowColor(primaryStep);
                            setFoundationColor(currentColor);
                            previousPrimaryStep = primaryStep;
                            const rate = ((Domain.getTicks() -ticks[0]) %unit) /unit;
                            const nextColor = getSolidRainbowColor(primaryStep +1);
                            setScreenBarProgress(rate, nextColor);
                            setBodyColor(nextColor);
                            getHeaderElement().classList.add("with-screen-prgress");
                        }
                        else
                        {
                            previousPrimaryStep = 0;
                            setScreenBarProgress(null);
                            getHeaderElement().classList.remove("with-screen-prgress");
                            const currentColor = getSolidRainbowColor(0);
                            setFoundationColor(currentColor);
                            setBodyColor(currentColor);
                        }
                        break;
                    case "timer":
                        setTitle(0 < ticks.length ? Domain.timeShortStringFromTick(Domain.getTicks() -ticks[0]) +" - " +applicationTitle: applicationTitle);
                        (
                            Array.from
                            (
                                (screen.getElementsByClassName("tick-list")[0] as HTMLDivElement).childNodes
                            ) as HTMLDivElement[]
                        ).forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("tick-elapsed-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeShortStringFromTick(Domain.getTicks() -ticks[index]);
                            }
                        );
                        break;
                    case "storage":
                        await reload();
                        break;
                    case "operate":
                        previousPrimaryStep = 0;
                        ticks = Storage.Stamps.get();
                        replaceScreenBody(await neverStopwatchScreenBody(ticks));
                        resizeFlexList();
                        await updateWindow("timer");
                        break;
                }
            };
            await showWindow(await countdownTimerScreen(alerts), updateWindow);
            await updateWindow("timer");
        };
        export const colorMenuItem = async () =>
            menuItem
            (
                label("Color setting"),
                async () => await colorSettingsPopup(),
            );
        export const rainbowClockScreenMenu = async () =>
        [
            await fullscreenMenuItem(),
            await themeMenuItem(),
            await colorMenuItem(),
            await languageMenuItem(),
            await githubMenuItem(),
        ];
        export const rainbowClockScreenBody = async () =>
        ([
            $div("primary-page")
            ([
                $div("main-panel")
                ([
                    $div("capital-time")
                    ([
                        $span("value monospace")(Domain.timeFullCoreStringFromTick(Domain.getTime(Domain.getTicks()))),
                    ]),
                    $div("current-date")
                    ([
                        $span("value monospace")(Domain.dateCoreStringFromTick(Domain.getTicks())),
                    ]),
                ]),
            ]),
            $div("screen-bar")([]),
        ]);
        export const rainbowClockScreen = async (): Promise<ScreenSource> =>
        ({
            className: "rainbow-clock-screen",
            header:
            {
                items:
                [
                    await screenHeaderHomeSegment("Rainbow Clock"),
                ],
                menu: rainbowClockScreenMenu
            },
            body: await rainbowClockScreenBody()
        });
        export const showRainbowClockScreen = async () =>
        {
            const applicationTitle = "Rainbow Clock";
            document.body.classList.add("hide-scroll-bar");
            Storage.lastApplication.set(applicationTitle);
            const updateWindow = async (event: UpdateWindowEventEype) =>
            {
                const screen = document.getElementById("screen") as HTMLDivElement;
                const now = new Date();
                const tick = Domain.getTicks(now);
                switch(event)
                {
                    case "high-resolution-timer":
                        const capitalTime = Domain.timeLongCoreStringFromTick(Domain.getTime(tick));
                        const capitalTimeSpan = screen.getElementsByClassName("capital-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                        if(capitalTimeSpan.innerText !== capitalTime)
                        {
                            capitalTimeSpan.innerText = capitalTime;
                            setTitle(capitalTime +" - " +applicationTitle);
                            if (capitalTime.endsWith(":00:00"))
                            {
                                screenFlash();
                            }
                        }
                    break;
                    case "timer":
                        const dateString = Domain.dateCoreStringFromTick(tick) +" " +Domain.weekday(tick);
                        const currentDateSpan = screen.getElementsByClassName("current-date")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                        if(currentDateSpan.innerText !== dateString)
                        {
                            currentDateSpan.innerText = dateString;
                        }
                        const getRainbowColor = rainbowClockColorPatternMap[Storage.rainbowClockColorPattern.get()];
                        const currentColor = getRainbowColor(now.getHours());
                        setFoundationColor(currentColor);
                        const hourUnit = 60 *60 *1000;
                        const minutes = (tick % hourUnit) / hourUnit;
                        const nextColor = getRainbowColor(now.getHours() +1);
                        setScreenBarProgress(minutes, nextColor);
                        setBodyColor(nextColor);
                        break;
                    case "storage":
                        await reload();
                        break;
                    case "operate":
                        await updateWindow("timer");
                        break;
                }
            };
            await showWindow(await rainbowClockScreen(), updateWindow);
            await updateWindow("timer");
        };
        export const updateTitle = () =>
        {
            document.title = Array.from(getHeaderElement().getElementsByClassName("segment-title"))
                ?.map((div: HTMLDivElement) => div.innerText)
                // ?.reverse()
                ?.join(" / ")
                ?? applicationTitle;
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
                document.addEventListener
                (
                    "scroll",
                    () =>
                    {
                        if (document.body.scrollTop <= 0)
                        {
                            Render.updateWindow?.("scroll");
                        }
                    }
                );
            }
            document.body.style.removeProperty("background-color");
            document.getElementById("screen").style.removeProperty("background-color");
            document.getElementById("screen").className = `${screen.className} screen`;
            minamo.dom.replaceChildren
            (
                getHeaderElement(),
                await screenSegmentedHeader(screen.header)
            );
            minamo.dom.replaceChildren
            (
                document.getElementById("screen-body"),
                screen.body
            );
            updateTitle();
            //minamo.core.timeout(100);
            resizeFlexList();
        };
        export interface Toast
        {
            dom: HTMLDivElement;
            timer: number | null;
            hide: ()  => Promise<unknown>;
        }
        export const makeToast =
        (
            data:
            {
                content: minamo.dom.Source,
                backwardOperator?: minamo.dom.Source,
                forwardOperator?: minamo.dom.Source,
                isWideContent?: boolean,
                wait?: number,
            }
        ): Toast =>
        {
            const dom = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "item slide-up-in",
                children: data.isWideContent ?
                [
                    data.backwardOperator,
                    data.content,
                    data.forwardOperator,
                ].filter(i => undefined !== i):
                [
                    data.backwardOperator ?? $span("dummy")([]),
                    data.content,
                    data.forwardOperator ?? $span("dummy")([]),
                ],
            });
            const hideRaw = async (className: string, wait: number) =>
            {
                if (null !== result.timer)
                {
                    clearTimeout(result.timer);
                    result.timer = null;
                }
                if (dom.parentElement)
                {
                    dom.classList.remove("slide-up-in");
                    dom.classList.add(className);
                    await minamo.core.timeout(wait);
                    minamo.dom.remove(dom);
                    // 以下は Safari での CSS バグをクリアする為の細工。本質的には必要の無い呼び出し。
                    if (document.getElementById("screen-toast").getElementsByClassName("item").length <= 0)
                    {
                        await minamo.core.timeout(10);
                        updateWindow("operate");
                    }
                }
            };
            const wait = data.wait ?? 5000;
            const result =
            {
                dom,
                timer: 0 < wait ? setTimeout(() => hideRaw("slow-slide-down-out", 500), wait): null,
                hide: async () => await hideRaw("slide-down-out", 250),
            };
            document.getElementById("screen-toast").appendChild(dom);
            setTimeout(() => dom.classList.remove("slide-up-in"), 250);
            return result;
        };
        let latestPrimaryToast: Toast;
        export const makePrimaryToast =
        (
            data:
            {
                content: minamo.dom.Source,
                backwardOperator?: minamo.dom.Source,
                forwardOperator?: minamo.dom.Source,
                wait?: number,
            }
        ): Toast =>
        {
            if (latestPrimaryToast)
            {
                latestPrimaryToast.hide();
            }
            return latestPrimaryToast = makeToast(data);
        };
        export const getProgressElement = () => document.getElementById("screen-header").getElementsByClassName("progress-bar")[0] as HTMLDivElement;
        export const setScreenBarProgress = (percent: null | number, color?: string) =>
        {
            const screenBar = document.getElementsByClassName("screen-bar")[0] as HTMLDivElement;
            if (color)
            {
                if (screenBar.style.backgroundColor !== color)
                {
                    screenBar.style.backgroundColor = color;
                }
            }
            if (null !== percent)
            {
                const percentString = percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
                if (window.innerHeight < window.innerWidth)
                {
                    if ( ! screenBar.classList.contains("horizontal"))
                    {
                        screenBar.classList.add("horizontal");
                    }
                    if (screenBar.classList.contains("vertical"))
                    {
                        screenBar.classList.remove("vertical");
                    }
                    if (screenBar.style.height !== "initial")
                    {
                        screenBar.style.height = "initial";
                    }
                    if (screenBar.style.width !== percentString)
                    {
                        screenBar.style.width = percentString;
                    }
                }
                else
                {
                    if ( ! screenBar.classList.contains("vertical"))
                    {
                        screenBar.classList.add("vertical");
                    }
                    if (screenBar.classList.contains("horizontal"))
                    {
                        screenBar.classList.remove("horizontal");
                    }
                    if (screenBar.style.width !== "initial")
                    {
                        screenBar.style.width = "initial";
                    }
                    if (screenBar.style.height !== percentString)
                    {
                        screenBar.style.height = percentString;
                    }
                }
                if (screenBar.style.display !== "block")
                {
                    screenBar.style.display = "block";
                }
            }
            else
            {
                if (screenBar.style.display !== "none")
                {
                    screenBar.style.display = "none";
                }
            }
        };
        export const resizeFlexList = () =>
        {
            const minColumns = 1 +Math.floor(window.innerWidth / 780);
            const maxColumns = Math.min(12, Math.max(minColumns, Math.floor(window.innerWidth / 450)));
            const FontRemUnit = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const border = FontRemUnit *26 +10;
            (Array.from(document.getElementsByClassName("menu-popup")) as HTMLDivElement[]).forEach
            (
                header =>
                {
                    header.classList.toggle("locale-parallel-on", 2 <= minColumns);
                    header.classList.toggle("locale-parallel-off", minColumns < 2);
                }
            );
            [document.getElementById("screen-toast") as HTMLDivElement].forEach
            (
                header =>
                {
                    header.classList.toggle("locale-parallel-on", 2 <= minColumns);
                    header.classList.toggle("locale-parallel-off", minColumns < 2);
                }
            );
            (Array.from(document.getElementsByClassName("button-list")) as HTMLDivElement[]).forEach
            (
                header =>
                {
                    header.classList.toggle("locale-parallel-on", true);
                    header.classList.toggle("locale-parallel-off", false);
                }
            );
            (Array.from(document.getElementsByClassName("column-flex-list")) as HTMLDivElement[]).forEach
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
                        list.style.height = undefined;
                    }
                    else
                    {
                        const height = window.innerHeight -list.offsetTop;
                        const itemHeight = (list.childNodes[0] as HTMLElement).offsetHeight +1;
                        const columns = Math.min(maxColumns, Math.ceil(length / Math.max(1.0, Math.floor(height / itemHeight))));
                        const row = Math.max(Math.ceil(length /columns), Math.min(length, Math.floor(height / itemHeight)));
                        list.style.height = `${row *itemHeight}px`;
                        list.classList.add(`max-column-${columns}`);
                    }
                    if (0 < length)
                    {
                        const itemWidth = Math.min(window.innerWidth, (list.childNodes[0] as HTMLElement).offsetWidth);
                        list.classList.toggle("locale-parallel-on", border < itemWidth);
                        list.classList.toggle("locale-parallel-off", itemWidth <= border);
                    }
                    list.classList.toggle("empty-list", length <= 0);
                }
            );
            (Array.from(document.getElementsByClassName("row-flex-list")) as HTMLDivElement[]).forEach
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
                        list.classList.add(`max-column-${columns}`);
                        const itemWidth = Math.min(window.innerWidth, (list.childNodes[0] as HTMLElement).offsetWidth);
                        list.classList.toggle("locale-parallel-on", border < itemWidth);
                        list.classList.toggle("locale-parallel-off", itemWidth <= border);
                    }
                    list.classList.toggle("empty-list", length <= 0);
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
                        (Array.from(document.getElementsByClassName("popup")) as HTMLDivElement[])
                            .filter((_i, ix, list) => (ix +1) === list.length)
                            .forEach(popup => (Array.from(popup.getElementsByClassName("default-button")) as HTMLButtonElement[])?.[0]?.click());
                        break;
                    case "Escape":
                        (getScreenCover() ?? getCloseButton())?.click();
                        break;
                }
                const focusedElementTagName = document.activeElement?.tagName?.toLowerCase() ?? "";
                if (["input", "textarea"].indexOf(focusedElementTagName) < 0)
                {
                    switch(event.key.toLowerCase())
                    {
                        case "f":
                            if(null === document.fullscreenElement)
                            {
                                document.body.requestFullscreen();
                            }
                            else
                            {
                                document.exitFullscreen();
                            }
                            break;
                    }
                }
            }
        };
    }
    const originalStyle = document.getElementById("style").innerText;
    const makeRegExpPart = (text: string) => text.replace(/([\\\/\.\+\?\*\[\]\(\)\{\}\|])/gmu, "\\$1");
    export const updateStyle = () =>
    {
        const setting = Storage.Settings.get().theme ?? "auto";
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark": "light";
        const theme = "auto" === setting ? system: setting;
        let style = originalStyle;
        Object.keys(config.theme.original).forEach
        (
            key => style = style.replace
            (
                new RegExp
                (
                    makeRegExpPart(config.theme.original[key]),
                    "gmu"
                ),
                key
            )
        );
        Object.keys(config.theme.original).forEach
        (
            key => style = style.replace
            (
                new RegExp
                (
                    makeRegExpPart(key),
                    "gmu"
                ),
                config.theme[theme][key] ?? config.theme.original[key]
            )
        );
        if (document.getElementById("style").innerText !== style)
        {
            document.getElementById("style").innerText = style;
        }
    };
    export const start = async () =>
    {
        console.log("start!!!");
        locale.setLocale(Storage.Settings.get().locale);
        // window.onpopstate = () => showPage();
        window.addEventListener('resize', Render.onWindowResize);
        window.addEventListener('focus', Render.onWindowFocus);
        window.addEventListener('blur', Render.onWindowBlur);
        window.addEventListener('storage', Render.onUpdateStorage);
        window.addEventListener('compositionstart', Render.onCompositionStart);
        window.addEventListener('compositionend', Render.onCompositionEnd);
        window.addEventListener('keydown', Render.onKeydown);
        document.getElementById("screen-header").addEventListener
        (
            'click',
            async () =>
            {
                const body = document.getElementById("screen-body");
                let top = body.scrollTop;
                for(let i = 0; i < 25; ++i)
                {
                    top *= 0.6;
                    body.scrollTo(0, top);
                    await minamo.core.timeout(10);
                }
                body.scrollTo(0, 0);
            }
        );
        window.matchMedia('(prefers-color-scheme: dark)').addListener(updateStyle);
        updateStyle();
        await showPage(Storage.lastApplication.get());
    };
    export const showPage = async (applicationType: keyof typeof application) =>
    {
        window.scrollTo(0,0);
        document.getElementById("screen-body").scrollTo(0,0);
        await application[applicationType].show();
    };
    export const reload = async () => await showPage(Storage.lastApplication.get());
}
