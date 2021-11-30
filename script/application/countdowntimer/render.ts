import { minamo } from "../../minamo.js";
import { Clockworks, tektite } from "../..";
import { Tektite } from "../../../tektite.js/script";
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
                    async i => tektite.menu.linkItem
                    (
                        [ await Resource.loadSvgOrCache("tick-icon"), labelSpan(alarmTitle(i)), $span("value monospace")(Domain.dateStringFromTick(i.end)), ],
                        Domain.makePageParams("CountdownTimer", i),
                        JSON.stringify(item) === JSON.stringify(i) ? "current-item": undefined,
                    )
                )
        )
    });
    export const alarmTitle = (item: Type.AlarmEntry) => "timer" === item.type ?
        `${Domain.makeTimerLabel(item.end -item.start)} ${Clockworks.localeMap("Timer")}`:
        item.title;
    export const alarmItem = async (item: Type.AlarmEntry) => $div("alarm-item flex-item")
    ([
        $div("item-header")
        ([
            tektite.internalLink
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
                await tektite.menu.button(await alarmItemMenu(item)),
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
                    label("Edit start time"),
                    async () =>
                    {
                        const result = await RenderBase.dateIimePrompt(Clockworks.localeMap("Edit start time"), item.start);
                        if (null !== result)
                        {
                            if (item.start !== result)
                            {
                                if (result < Domain.getTicks())
                                {
                                    await Operate.edit(item, item.title, result, item.end);
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
                )
            ]:
            [],
        tektite.menu.item
        (
            label("Remove"),
            async () => await Operate.removeAlarm(item),
            "delete-button"
        )
    ];
    export const eventItem = async (item: Type.EventEntry) => $div("event-item flex-item")
    ([
        $div("item-header")
        ([
            tektite.internalLink
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
                await tektite.menu.button(await eventItemMenu(item)),
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
            async () => await RenderBase.Operate.ElapsedTimer.remove(item),
            "delete-button"
        )
    ];
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
                                        await Operate.newTimer(i);
                                        result = true;
                                        ui.close();
                                    }
                                })
                            )
                        ),
                    ]
                );
                await checkButtonListUpdate();
                const ui = tektite.screen.popup
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
                                    const tick = await RenderBase.timePrompt(Clockworks.localeMap("input a time"), 0);
                                    if (null !== tick)
                                    {
                                        const minutes = tick /(60 *1000);
                                        Storage.CountdownTimer.recentlyTimer.add(minutes);
                                        await Operate.newTimer(minutes);
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
                const ui = tektite.screen.popup
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
                                    await Operate.done(current);
                                }
                                else
                                {
                                    await Operate.doneTemprary(current);
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
                        tektite.internalLink
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
                                onclick: async () => await RenderBase.sharePopup(alarmTitle(item)),
                            }:
                            {
                                tag: "button",
                                className: "main-button long-button",
                                children: "保存 / Save",
                                onclick: async () => await Operate.save(item),
                            }
                    ]):
                    await tektite.screen.downPageLink(),
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
                            const result = await eventPrompt(Clockworks.localeMap("New Schedule"), Clockworks.localeMap("New Schedule"), Domain.getAppropriateTicks());
                            if (result)
                            {
                                if (Domain.getTicks() < result.tick)
                                {
                                    await Operate.newSchedule(result.title, result.tick);
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
                        $tag("li")("")([label("You can use links like these too:"), [ "1500ms", "90s", "3m", "1h", "1d" ].map(i => ({ tag: "a", style: "margin-inline-start:0.5em;", href: Domain.makeNewTimerUrl(i), children: `${Domain.makeTimerLabel(Domain.parseTimer(i))} ${Clockworks.localeMap("Timer")}`, }))]),
                    ])
                ),
            ]),
    ]);
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
        document.body.classList.add("hide-scroll-bar");
        let alarms = Storage.CountdownTimer.Alarms.get();
        let lashFlashAt = 0;
        const updateWindow = async (event: Tektite.UpdateWindowEventEype) =>
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
                                tektite.screen.flash();
                                lashFlashAt = tick;
                            }
                            previousPrimaryStep = primaryStep;
                        }
                        const cycle = "timer" === current.type ? 3000: 10000;
                        if (rest <= 0 && lashFlashAt +cycle <= tick)
                        {
                            tektite.screen.flash();
                            lashFlashAt = tick;
                        }
                        const currentColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                        Tektite.setBackgroundColor(currentColor);
                        const span = current.end - current.start;
                        const rate = Math.min(tick - current.start, span) /span;
                        const nextColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get() +1);
                        RenderBase.setProgress(rate, nextColor);
                        // setBodyColor(nextColor);
                        tektite.header.getElement().classList.add("with-screen-prgress");
                    }
                    else
                    {
                        previousPrimaryStep = 0;
                        RenderBase.setProgress(null);
                        tektite.header.getElement().classList.remove("with-screen-prgress");
                        const currentColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                        Tektite.setBackgroundColor(currentColor);
                        // setBodyColor(currentColor);
                    }
                    break;
                case "timer":
                    tektite.setTitle(current ? Domain.timeShortStringFromTick(Math.max(current.end -tick, 0)) +" - " +applicationTitle: applicationTitle);
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
                        Tektite.setBodyColor(Color.mixColors(currentColor, nextColor, rate));
                    }
                    else
                    {
                        const currentColor = Color.getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                        Tektite.setBodyColor(currentColor);
                    }
                    break;
                case "storage":
                    await RenderBase.reload();
                    break;
                case "operate":
                    previousPrimaryStep = 0;
                    alarms = Storage.CountdownTimer.Alarms.get();
                    tektite.screen.replaceBody(await countdownTimerScreenBody(item, alarms));
                    RenderBase.resizeFlexList();
                    await updateWindow("timer");
                    await tektite.screen.scrollToOffset(document.getElementById("screen-body"), 0);
                    tektite.screen.adjustPageFooterPosition();
                    break;
            }
        };
        await RenderBase.showWindow(await countdownTimerScreen(item, alarms), updateWindow);
        await updateWindow("timer");
    };
}