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
import { Render as CountdownTimerRender } from "../countdowntimer/render";
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
    export const screenHeaderEventSegment = async (item: Type.EventEntry | null, alarms: Type.EventEntry[]): Promise<RenderBase.HeaderSegmentSource> =>
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
                        [ await Resource.loadIconOrCache("tektite-tick-icon"), Tektite.$labelSpan(i.title), Tektite.monospace(tektite.date.dateStringFromTick(i.tick)), ],
                        Domain.makePageParams("ElapsedTimer", i),
                        JSON.stringify(item) === JSON.stringify(i) ? "current-item": undefined,
                    )
                )
        )
    });
    export const elapsedTimerScreenMenu = async () =>
    [
        await RenderBase.fullscreenMenuItem(),
        await RenderBase.themeMenuItem(),
        await RenderBase.progressBarStyleMenuItem(),
        await RenderBase.languageMenuItem(),
        await RenderBase.resetElapsedTimerMenuItem(),
        await RenderBase.githubMenuItem(),
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
                            Tektite.monospace("current-title", (item ?? events[0]).title),
                            Tektite.monospace("current-due-timestamp", tektite.date.dateStringFromTick((item ?? events[0]).tick)),
                        ]: [],
                        Tektite.monospace("capital-interval", tektite.date.format("smart-time", 0)),
                        Tektite.monospace("current-timestamp", tektite.date.dateStringFromTick(Domain.getTicks())),
                    ]):
                    Tektite.$div("current-item")
                    ([
                        Tektite.monospace("capital-interval", tektite.date.format("smart-time", 0)),
                        Tektite.monospace("current-timestamp", tektite.date.dateStringFromTick(Domain.getTicks())),
                    ]),
                await RenderBase.flashIntervalLabel
                (
                    await RenderBase.screenHeaderFlashSegment
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
            footer: await RenderBase.itemFooter(item, "CountdownTimer", item => item.title, Storage.ElapsedTimer.Events.isSaved, Operate.save),
        },
        trail: null !== item ?
            undefined:
            [
                Tektite.$div("tektite-horizontal-button-list")
                ([
                    {
                        tag: "button",
                        className: "tektite-main-button tektite-long-button",
                        children: label("New Event"),
                        onclick: async () =>
                        {
                            const result = await CountdownTimerRender.eventPrompt(Clockworks.localeMap("New Event"), Clockworks.localeMap("New Event"), Domain.getAppropriateTicks());
                            if (result)
                            {
                                if (Domain.getTicks() < result.tick)
                                {
                                    await Operate.newEvent(result.title, result.tick);
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
                Tektite.$div("tektite-row-flex-list event-list")
                (
                    await Promise.all(events.map(item => CountdownTimerRender.eventItem(item)))
                ),
                Tektite.$div("description")
                (
                    Tektite.$tag("ul")("tektite-locale-parallel-off")
                    ([
                        Tektite.$tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        Tektite.$tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                    ])
                ),
            ],
    });
    export const elapsedTimerScreen = async (item: Type.EventEntry | null, events: Type.EventEntry[]): Promise<RenderBase.ScreenSource> =>
    ({
        className: "elapsed-timer-screen",
        header: null === item ?
        {
            items:
            [
                await RenderBase.screenHeaderHomeSegment(),
                await RenderBase.screenHeaderApplicationSegment("ElapsedTimer"),
            ],
            menu: elapsedTimerScreenMenu,
            parent: { },
        }:
        {
            items:
            [
                await RenderBase.screenHeaderHomeSegment(),
                await RenderBase.screenHeaderApplicationSegment("ElapsedTimer"),
                await screenHeaderEventSegment(item, events),
            ],
            menu: Storage.ElapsedTimer.Events.isSaved(item) ? () => CountdownTimerRender.eventItemMenu(item): undefined,
            parent: { application: "ElapsedTimer" },
        },
        body: await elapsedTimerScreenBody(item, events)
    });
    let previousPrimaryStep = 0;
    export const showElapsedTimerScreen = async (item: Type.EventEntry | null) =>
    {
        const applicationTitle = Type.applicationList["ElapsedTimer"].title;
        let events = Storage.ElapsedTimer.Events.get();
        const updateScreen = async (event: Tektite.UpdateScreenEventEype) =>
        {
            const screen = tektite.screen.getElement();
            const now = new Date();
            const tick = Domain.getTicks(now);
            const current = item ?? events[0] ?? null;
            const flashInterval = Storage.ElapsedTimer.flashInterval.get();
            switch(event)
            {
                case "high-resolution-timer":
                    (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = tektite.date.format("smart-time", tick -(current?.tick ?? tick));
                    const capitalTime = tektite.date.dateStringFromTick(tick);
                    const capitalTimeSpan = screen.getElementsByClassName("current-timestamp")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                    minamo.dom.setProperty(capitalTimeSpan, "innerText", capitalTime);
                    if (0 < flashInterval && null !== current)
                    {
                        const elapsed = tick -current.tick;
                        const unit = flashInterval; // *60 *1000;
                        const primaryStep = Math.floor(elapsed / unit);
                        if (primaryStep === previousPrimaryStep +1 && (elapsed % unit) < 5 *1000)
                        {
                            tektite.flash();
                        }
                        const currentColor = Color.getSolidRainbowColor(primaryStep);
                        tektite.setBackgroundColor(currentColor);
                        previousPrimaryStep = primaryStep;
                        const rate = ((tick -current.tick) %unit) /unit;
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
                    tektite.setTitle(tektite.date.timeShortStringFromTick(tick -(current?.tick ?? tick)) +" - " +applicationTitle);
                    const eventListDiv = minamo.dom.getDivsByClassName(screen, "event-list")[0];
                    if (eventListDiv)
                    {
                        minamo.dom.getChildNodes<HTMLDivElement>(eventListDiv)
                        .forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("event-elapsed-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText =
                                    tektite.date.timeShortStringFromTick(tick -events[index].tick);
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
                    events = Storage.ElapsedTimer.Events.get();
                    await tektite.screen.replaceBody(await elapsedTimerScreenBody(item, events));
                    tektite.screen.resizeFlexList();
                    await updateScreen("timer");
                    await tektite.screen.scrollToOffset(document.getElementById("tektite-screen-body"), 0);
                    tektite.screen.adjustPageFooterPosition();
                    break;
            }
        };
        await RenderBase.showScreen(await elapsedTimerScreen(item, events), updateScreen);
        await updateScreen("timer");
    };
}