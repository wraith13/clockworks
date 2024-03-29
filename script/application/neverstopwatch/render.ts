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
    export const screenHeaderStampSegment = async (item: number, ticks: number[]): Promise<RenderBase.HeaderSegmentSource> =>
    ({
        icon: "tektite-tick-icon",
        title: tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", item),
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
                        [ await Resource.loadIconOrCache("tektite-tick-icon"), Tektite.monospace(tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", i)), ],
                        Domain.makePageParams("NeverStopwatch", i),
                        item === i ? "tektite-current-item": undefined,
                    )
                )
        )
    });
    export const stampItem = async (tick: number, interval: number | null) => Tektite.$div("stamp-item tektite-title-item tektite-flex-item")
    ([
        Tektite.$div("tektite-item-header")
        ([
            tektite.internalLink
            ({
                className: "tektite-item-title",
                href: Domain.makePageParams("NeverStopwatch", tick),
                children:
                [
                    await Resource.loadIconOrCache("tektite-tick-icon"),
                    Tektite.monospace("tick-elapsed-time", label("Elapsed time")),
                ]
            }),
            Tektite.$div("tektite-item-operator")
            ([
                await tektite.menu.button(await stampItemMenu(tick)),
            ]),
        ]),
        Tektite.$div("tektite-item-information")
        ([
            Tektite.monospace("tick-timestamp", label("Timestamp"), tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", tick)),
            Tektite.monospace("tick-interval", label("Interval"), tektite.date.format("long-time", interval)),
        ]),
    ]);
    export const stampItemMenu = async (tick: number) =>
    [
        tektite.menu.item
        (
            label("Edit"),
            async () =>
            {
                const newTick = await RenderBase.dateTimeTickPrompt(Clockworks.localeMap("Edit"), tick);
                if (null !== newTick && tick !== newTick)
                {
                    if (0 <= newTick && newTick <= Domain.getTicks())
                    {
                        await Operate.edit(tick, newTick);
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
        ),
        tektite.menu.item
        (
            label("Remove"),
            async () => await Operate.removeStamp(tick),
            "tektite-delete-button"
        )
    ];
    export const neverStopwatchScreenMenu = async () =>
    [
        await RenderBase.fullscreenMenuItem(),
        await RenderBase.themeMenuItem(),
        await RenderBase.progressBarStyleMenuItem(),
        await RenderBase.languageMenuItem(),
        await RenderBase.resetNeverStopwatchMenuItem(),
        await RenderBase.githubMenuItem(),
    ];
    export const neverStopwatchScreenBody = async (item: number | null, ticks: number[]) =>
    ({
        primary:
        {
            body:
            [
                Tektite.$div("tektite-current-item")
                ([
                    Tektite.monospace
                    (   "previous-timestamp",
                        null !== item ?
                            tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", item):
                            (
                                0 < ticks.length ?
                                tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", ticks[0]):
                                ""
                            )
                    ),
                    Tektite.monospace("capital-interval", tektite.date.format("long-time", 0)),
                    Tektite.monospace("current-timestamp", tektite.date.format("YYYY-MM-DD HH:MM:SS.mmm", Domain.getTicks())),
                ]),
                await RenderBase.flashIntervalLabel
                (
                    await RenderBase.screenHeaderFlashSegment
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
                Tektite.$div("tektite-horizontal-button-list")
                ({
                    tag: "button",
                    className: "tektite-default-button tektite-main-button tektite-long-button",
                    children: label("Stamp"),
                    onclick: async () => await Operate.stamp(Domain.getTicks())
                }),
            ],
            footer: await RenderBase.itemFooter(item, "NeverStopwatch", () => "Elapsed Time / 経過時間", Storage.NeverStopwatch.Stamps.isSaved, Operate.save),
        },
        trail: null !== item ?
            undefined:
            [
                Tektite.$div("tektite-row-flex-list stamp-list")
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
                    Tektite.$tag("ul")("tektite-locale-parallel-off")
                    ([
                        Tektite.$tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        Tektite.$tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                        Tektite.$tag("li")("")([label("You can use a link like this too:"), { tag: "a", style: "margin-inline-start:0.5em;", href: Domain.makeStampUrl("new"), children: Clockworks.localeMap("Stamp"), }, ]),
                    ])
                ),
            ]
    });
    export const neverStopwatchScreen = async (item: number | null, ticks: number[]): Promise<RenderBase.ScreenSource> =>
    ({
        className: "never-stopwatch-screen",
        header: null === item ?
        {
            items:
            [
                await RenderBase.screenHeaderHomeSegment(),
                await RenderBase.screenHeaderApplicationSegmentMenu("NeverStopwatch"),
                // await screenHeaderFlashSegment(Storage.NeverStopwatch.flashInterval.get()),
            ],
            menu: neverStopwatchScreenMenu,
            parent: { },
        }:
        {
            items:
            [
                await RenderBase.screenHeaderHomeSegment(),
                await RenderBase.screenHeaderApplicationSegment("NeverStopwatch"),
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
        let ticks = Storage.NeverStopwatch.Stamps.get();
        const updateScreen = async (event: Tektite.UpdateScreenEventEype) =>
        {
            const screen = tektite.screen.getElement();
            const now = new Date();
            const tick = Domain.getTicks(now);
            const current = item ?? ticks[0] ?? null;
            const flashInterval = Storage.NeverStopwatch.flashInterval.get();
            switch(event)
            {
                case "high-resolution-timer":
                    (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText =
                        tektite.date.format("long-time", current, "clip-elapsed", tick);
                    const capitalTime = tektite.date.format("YYYY-MM-DD HH:MM:SS", tick);
                    const capitalTimeSpan = screen.getElementsByClassName("current-timestamp")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                    minamo.dom.setProperty(capitalTimeSpan, "innerText", capitalTime);
                    if (0 < flashInterval && null !== current)
                    {
                        const elapsed = Domain.getTicks() -current;
                        const unit = flashInterval; // *60 *1000;
                        const primaryStep = Math.floor(elapsed / unit);
                        if (primaryStep === previousPrimaryStep +1 && (elapsed % unit) < 5 *1000)
                        {
                            tektite.flash();
                        }
                        const currentColor = Color.getSolidRainbowColor(primaryStep);
                        tektite.setBackgroundColor(currentColor);
                        previousPrimaryStep = primaryStep;
                        const rate = ((Domain.getTicks() -current) %unit) /unit;
                        const nextColor = Color.getSolidRainbowColor(primaryStep +1);
                        RenderBase.setProgress(rate, nextColor);
                    }
                    else
                    {
                        previousPrimaryStep = 0;
                        RenderBase.setProgress(null);
                        const currentColor = Color.getSolidRainbowColor(0);
                        tektite.setBackgroundColor(currentColor);
                    }
                    break;
                case "timer":
                    tektite.setTitle(tektite.date.format("short-time", current, "clip-elapsed", tick) +" - " +applicationTitle);
                    const stampListDiv = minamo.dom.getDivsByClassName(screen, "stamp-list")[0];
                    if (stampListDiv)
                    {
                        minamo.dom.getChildNodes<HTMLDivElement>(stampListDiv)
                        .forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("tick-elapsed-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = tektite.date.format("short-time", ticks[index], "elapsed");
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
                        tektite.setWindowColor(Color.mixColors(currentColor, nextColor, rate));
                    }
                    else
                    {
                        const currentColor = Color.getSolidRainbowColor(0);
                        tektite.setWindowColor(currentColor);
                    }
                    break;
                case "storage":
                    await RenderBase.reload();
                    break;
                case "operate":
                    previousPrimaryStep = 0;
                    ticks = Storage.NeverStopwatch.Stamps.get();
                    await tektite.screen.replaceBody(await neverStopwatchScreenBody(item, ticks));
                    tektite.screen.resizeFlexList();
                    tektite.screen.adjustPageFooterPosition();
                    await updateScreen("timer");
                    break;
                case "focus":
                    Clockworks.checkApplicationUpdate();
                    break;
            }
        };
        await RenderBase.showScreen(await neverStopwatchScreen(item, ticks), updateScreen);
        await updateScreen("timer");
    };
}