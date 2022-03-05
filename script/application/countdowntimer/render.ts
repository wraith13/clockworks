import { minamo } from "../../../nephila/minamo.js";
import { Clockworks, tektite } from "../..";
import { Tektite } from "../../../tektite.js/script/tektite-index";
import { Type } from "../../type";
// import { Base } from "../../base";
import { Color } from "../../color";
import { Storage } from "../../storage";
import { Domain } from "../../domain";
import { Resource } from "../../render/resource";
import { Render as RenderBase } from "../../render";
import { Operate } from "./operate";
// import config from "../../../resource/config.json";
export module Render
{
    export const $make = minamo.dom.make;
    export const $tag = minamo.dom.tag;
    export const $div = $tag("div");
    export const $span = $tag("span");
    export const labelSpan = $span("label");
    export const label = (label: Clockworks.LocaleKeyType) => labelSpan
    ([
        $span("locale-parallel")(Clockworks.localeParallel(label)),
        $span("locale-map")(Clockworks.localeMap(label)),
    ]);
    export const screenHeaderAlarmSegment = async (item: Type.AlarmEntry | null, alarms: Type.AlarmEntry[]): Promise<RenderBase.HeaderSegmentSource> =>
    ({
        icon: "tektite-tick-icon",
        title: alarmTitle(item),
        menu: await Promise.all
        (
            alarms
                .concat([item])
                .sort(minamo.core.comparer.make([i => i.end]))
                .filter((i, ix, list) => ix === list.map(a => JSON.stringify(a)).indexOf(JSON.stringify(i)))
                .map
                (
                    async i => tektite.menu.linkItem
                    (
                        [ await Resource.loadIconOrCache("tektite-tick-icon"), labelSpan(alarmTitle(i)), Tektite.monospace(tektite.date.format("YYYY-MM-DD HH:MM:SS", i.end)), ],
                        Domain.makePageParams("CountdownTimer", i),
                        JSON.stringify(item) === JSON.stringify(i) ? "tektite-current-item": undefined,
                    )
                )
        )
    });
    export const alarmTitle = (item: Type.AlarmEntry) => "timer" === item.type ?
        `${tektite.date.format("formal-time", item.end, item.start)} ${Clockworks.localeMap("Timer")}`:
        item.title;
    export const alarmItem = async (item: Type.AlarmEntry) => $div("alarm-item tektite-title-item tektite-flex-item")
    ([
        $div("tektite-item-header")
        ([
            tektite.internalLink
            ({
                className: "tektite-item-title",
                href: Domain.makePageParams("CountdownTimer", item),
                children:
                [
                    await Resource.loadIconOrCache("tektite-tick-icon"),
                    Tektite.monospace("tick-elapsed-time", alarmTitle(item)),
                ]
            }),
            $div("tektite-item-operator")
            ([
                await tektite.menu.button(await alarmItemMenu(item)),
            ]),
        ]),
        $div("tektite-item-information")
        ([
            Tektite.monospace("alarm-due-timestamp", label("Due timestamp"), tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", item.end)),
            Tektite.monospace("alarm-due-rest", label("Rest"), tektite.date.format("long-time", item.end, "rest")),
        ]),
    ]);
    export const alarmItemMenu = async (item: Type.AlarmEntry) =>
    [
        "schedule" === item.type ?
            [
                tektite.menu.item
                (
                    label("Edit"),
                    async () =>
                    {
                        const result = await eventPrompt(Clockworks.localeMap("Edit"), item.title, item.end);
                        if (null !== result)
                        {
                            if (item.title !== result.title || item.end !== result.tick)
                            {
                                if (Domain.getTicks() < result.tick)
                                {
                                    await Operate.edit(item, result.title, item.start, result.tick);
                                }
                                else
                                {
                                    tektite.screen.toast.make
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
                    label("Edit start time"),
                    async () =>
                    {
                        const result = await RenderBase.dateTimeTickPrompt(Clockworks.localeMap("Edit start time"), item.start);
                        if (null !== result && item.start !== result)
                        {
                            if (result < Domain.getTicks())
                            {
                                await Operate.edit(item, item.title, result, item.end);
                            }
                            else
                            {
                                tektite.screen.toast.make
                                ({
                                    content: label("A date and time outside the valid range was specified."),
                                    isWideContent: true,
                                });
                            }
                        }
                    }
                )
            ]:
            [],
        tektite.menu.item
        (
            label("Remove"),
            async () => await Operate.removeAlarm(item),
            "tektite-delete-button"
        )
    ];
    export const eventItem = async (item: Type.EventEntry) => $div("event-item tektite-title-item tektite-flex-item")
    ([
        $div("tektite-item-header")
        ([
            tektite.internalLink
            ({
                className: "tektite-item-title",
                href: Domain.makePageParams("ElapsedTimer", item),
                children:
                [
                    await Resource.loadIconOrCache("tektite-tick-icon"),
                    Tektite.monospace("tick-elapsed-time", item.title),
                ]
            }),
            $div("tektite-item-operator")
            ([
                await tektite.menu.button(await eventItemMenu(item)),
            ]),
        ]),
        $div("tektite-item-information")
        ([
            Tektite.monospace("event-timestamp", label("Timestamp"), tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", item.tick)),
            Tektite.monospace("event-elapsed-time", label("Elapsed time"), tektite.date.format("long-time", item.tick, "elapsed")),
        ]),
    ]);
    export const eventItemMenu = async (item: Type.EventEntry) =>
    [
        tektite.menu.item
        (
            label("Edit"),
            async () =>
            {
                const result = await eventPrompt(Clockworks.localeMap("Edit"), item.title, item.tick);
                if (null !== result)
                {
                    if (item.title !== result.title || item.tick !== result.tick)
                    {
                        if (result.tick < Domain.getTicks())
                        {
                            await RenderBase.Operate.ElapsedTimer.edit(item, result.title, result.tick);
                        }
                        else
                        {
                            tektite.screen.toast.make
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
            async () => await RenderBase.Operate.ElapsedTimer.remove(item),
            "tektite-delete-button"
        )
    ];
    export const newTimerPopup = async (): Promise<boolean> =>
        await tektite.screen.popup<boolean>
        (
            async (instance: Tektite.PopupInstance<boolean>) =>
            {
                const checkButtonList = $make(HTMLDivElement)({ className: "tektite-check-button-list" });
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
                                    className: `tektite-check-button`,
                                    children:
                                    [
                                        await Resource.loadIconOrCache("tektite-check-icon"),
                                        $span("")(labelSpan(tektite.date.format("formal-time", i))),
                                    ],
                                    onclick: async () =>
                                    {
                                        await Operate.newTimer(i);
                                        instance.set(true).close();
                                    }
                                })
                            )
                        ),
                    ]
                );
                await checkButtonListUpdate();
                return {
                    initialValue: false,
                    // className: "add-remove-tags-popup",
                    children:
                    [
                        tektite.screen.popupTitle(label("New Timer")),
                        checkButtonList,
                        $div("tektite-popup-operator")
                        ([
                            {
                                tag: "button",
                                className: "tektite-cancel-button",
                                children: label("input a time"),
                                onclick: async () =>
                                {
                                    const tick = await RenderBase.timePrompt(Clockworks.localeMap("input a time"), 0);
                                    if (null !== tick)
                                    {
                                        const minutes = tick /(60 *1000);
                                        Storage.CountdownTimer.recentlyTimer.add(minutes);
                                        await Operate.newTimer(minutes);
                                        instance.set(true).close();
                                    }
                                }
                            },
                            RenderBase.closeButton(() => instance.close()),
                        ])
                    ],
                };
            }
        );
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
            value: tektite.date.format("YYYY-MM-DD", tick),
            required: "",
        });
        const inputTime = $make(HTMLInputElement)
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
                inputTitle,
                inputDate,
                inputTime,
            ],
            onCommit: () =>
            ({
                title: inputTitle.value,
                tick: tektite.date.parseDate(`${inputDate.value}T${inputTime.value}`)?.getTime() ?? tick,
            }),
        });
    };
    export const countdownTimerScreenMenu = async () =>
    [
        await RenderBase.fullscreenMenuItem(),
        await RenderBase.themeMenuItem(),
        await RenderBase.progressBarStyleMenuItem(),
        await RenderBase.languageMenuItem(),
        await RenderBase.resetCountdownTimerMenuItem(),
        await RenderBase.githubMenuItem(),
    ];
    export const countdownTimerScreenBody = async (item: Type.AlarmEntry | null, alarms: Type.AlarmEntry[]) =>
    ({
        primary:
        {
            body:
            [
                (item ?? alarms[0]) ?
                    $div
                    (
                        "timer" === (item ?? alarms[0]).type ?
                            "tektite-current-item timer-item":
                            "tektite-current-item schedule-item"
                    )
                    ([
                        (item ?? alarms[0]) ?
                        [
                            Tektite.monospace("current-title", alarmTitle(item ?? alarms[0])),
                            "timer" === (item ?? alarms[0]).type ?
                                Tektite.monospace("current-due-timestamp", tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", (item ?? alarms[0]).end)):
                                Tektite.monospace("current-due-timestamp", tektite.date.format("YYYY-MM-DD HH:MM:SS", (item ?? alarms[0]).end)),
                        ]: [],
                        Tektite.monospace("capital-interval", tektite.date.format("long-time", 0)),
                        Tektite.monospace("current-timestamp", tektite.date.format("YYYY-MM-DD HH:MM:SS", Domain.getTicks())),
                    ]):
                    $div("tektite-current-item")
                    ([
                        Tektite.monospace("capital-interval", tektite.date.format("long-time", 0)),
                        Tektite.monospace("current-timestamp", tektite.date.format("YYYY-MM-DD HH:MM:SS", Domain.getTicks())),
                    ]),
                await RenderBase.flashIntervalLabel
                (
                    await RenderBase.screenHeaderFlashSegment
                    (
                        Storage.CountdownTimer.recentlyFlashInterval.add,
                        Domain.getFlashIntervalPreset()
                            .concat(Storage.CountdownTimer.recentlyFlashInterval.get())
                            .sort(minamo.core.comparer.make([i => i]))
                            .filter((i, ix, list) => ix === list.indexOf(i)),
                        Storage.CountdownTimer.flashInterval.get(),
                        Storage.CountdownTimer.flashInterval.set,
                        "tektite-flash-icon",
                        "00:00:00 only"
                    )
                ),
                $div("tektite-horizontal-button-list")
                ({
                    tag: "button",
                    id: "done-button",
                    className: "tektite-default-button tektite-main-button tektite-long-button",
                    children: label("Done"),
                    onclick: async () =>
                    {
                        const current = item ?? alarms[0];
                        if (current)
                        {
                            if (Storage.CountdownTimer.Alarms.isSaved(item))
                            {
                                await Operate.done(current);
                            }
                            else
                            {
                                await Operate.doneTemprary(current);
                            }
                        }
                    }
                }),
            ],
            footer: await RenderBase.itemFooter
            (
                item,
                "CountdownTimer",
                alarmTitle,
                Storage.CountdownTimer.Alarms.isSaved,
                Operate.save
            )
        },
        trail: null !== item ?
            undefined:
            [
                $div("tektite-horizontal-button-list")
                ([
                    {
                        tag: "button",
                        className: "tektite-main-button tektite-long-button",
                        children: label("New Timer"),
                        onclick: async () => await newTimerPopup(),
                    },
                    {
                        tag: "button",
                        className: "tektite-main-button tektite-long-button",
                        children: label("New Schedule"),
                        onclick: async () =>
                        {
                            const result = await eventPrompt(Clockworks.localeMap("New Schedule"), Clockworks.localeMap("New Schedule"), Domain.getAppropriateTicks());
                            if (result)
                            {
                                if (Domain.getTicks() < result.tick)
                                {
                                    await Operate.newSchedule(result.title, result.tick);
                                }
                                else
                                {
                                    tektite.screen.toast.make
                                    ({
                                        content: label("A date and time outside the valid range was specified."),
                                        isWideContent: true,
                                    });
                                }
                            }
                        }
                    },
                ]),
                $div("tektite-row-flex-list alarm-list")
                (
                    await Promise.all(alarms.map(item => alarmItem(item)))
                ),
                $div("description")
                (
                    $tag("ul")("tektite-locale-parallel-off")
                    ([
                        $tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                        $tag("li")("")([label("You can use links like these too:"), [ "1500ms", "90s", "3m", "1h", "1d" ].map(i => ({ tag: "a", style: "margin-inline-start:0.5em;", href: Domain.makeNewTimerUrl(i), children: `${tektite.date.format("formal-time", Domain.parseTimer(i))} ${Clockworks.localeMap("Timer")}`, }))]),
                    ])
                ),
            ]
    });
    let previousPrimaryStep = 0;
    export const countdownTimerScreen = async (item: Type.AlarmEntry | null, alarms: Type.AlarmEntry[]): Promise<RenderBase.ScreenSource> =>
    ({
        className: "countdown-timer-screen",
        header: null === item ?
        {
            items:
            [
                await RenderBase.screenHeaderHomeSegment(),
                await RenderBase.screenHeaderApplicationSegment("CountdownTimer"),
            ],
            menu: countdownTimerScreenMenu,
            parent: { },
        }:
        {
            items:
            [
                await RenderBase.screenHeaderHomeSegment(),
                await RenderBase.screenHeaderApplicationSegment("CountdownTimer"),
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
        let alarms = Storage.CountdownTimer.Alarms.get();
        let lashFlashAt = 0;
        const updateScreen = async (event: Tektite.UpdateScreenEventEype) =>
        {
            const screen = tektite.screen.getElement();
            const now = new Date();
            const tick = Domain.getTicks(now);
            const current = item ?? alarms[0] ?? null;
            switch(event)
            {
                case "high-resolution-timer":
                    (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText =
                        tektite.date.format("long-time", current?.end, "clip-rest", tick);
                    const capitalTime = tektite.date.format("YYYY-MM-DD HH:MM:SS", tick);
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
                                tektite.flash();
                                lashFlashAt = tick;
                            }
                            previousPrimaryStep = primaryStep;
                        }
                        const cycle = "timer" === current.type ? 3000: 10000;
                        if (rest <= 0 && lashFlashAt +cycle <= tick)
                        {
                            tektite.flash();
                            lashFlashAt = tick;
                        }
                        const currentColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                        tektite.setBackgroundColor(currentColor);
                        const span = current.end - current.start;
                        const rate = Math.min(tick - current.start, span) /span;
                        const nextColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get() +1);
                        RenderBase.setProgress(rate, nextColor);
                    }
                    else
                    {
                        previousPrimaryStep = 0;
                        RenderBase.setProgress(null);
                        const currentColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                        tektite.setBackgroundColor(currentColor);
                    }
                    break;
                case "timer":
                    tektite.setTitle(current ? tektite.date.format("short-time", current.end, "clip-rest", tick) +" - " +applicationTitle: applicationTitle);
                    const alarmListDiv = minamo.dom.getDivsByClassName(screen, "alarm-list")[0];
                    if (alarmListDiv)
                    {
                        minamo.dom.getChildNodes<HTMLDivElement>(alarmListDiv)
                        .forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("alarm-due-rest")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText =
                                    tektite.date.format("short-time", alarms[index].end, "clip-rest", tick);
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
                        tektite.setWindowColor(Color.mixColors(currentColor, nextColor, rate));
                    }
                    else
                    {
                        const currentColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                        tektite.setWindowColor(currentColor);
                    }
                    break;
                case "storage":
                    await RenderBase.reload();
                    break;
                case "operate":
                    previousPrimaryStep = 0;
                    alarms = Storage.CountdownTimer.Alarms.get();
                    await tektite.screen.replaceBody(await countdownTimerScreenBody(item, alarms));
                    tektite.screen.resizeFlexList();
                    await updateScreen("timer");
                    await tektite.screen.scrollToOffset(document.getElementById("tektite-screen-body"), 0);
                    tektite.screen.adjustPageFooterPosition();
                    break;
            }
        };
        await RenderBase.showScreen(await countdownTimerScreen(item, alarms), updateScreen);
        await updateScreen("timer");
    };
}