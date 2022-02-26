import { minamo } from "../../../nephila/minamo.js";
import { Clockworks, tektite } from "../..";
import { Tektite } from "../../../tektite.js/script/tektite-index";
import { Type } from "../../type";
import { Base } from "../../base";
import { Color } from "../../color";
import { Storage } from "../../storage";
import { Domain } from "../../domain";
import { Resource } from "../../render/resource";
import { Render as RenderBase } from "../../render";
import { Operate } from "./operate";
import config from "../../../resource/config.json";
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
    export const screenHeaderTimezoneSegment = async (item: Type.TimezoneEntry | null, timezones: Type.TimezoneEntry[]): Promise<RenderBase.HeaderSegmentSource> =>
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
                        [ await Resource.loadIconOrCache("tektite-tick-icon"), Tektite.$labelSpan(i.title), Tektite.monospace(Domain.timezoneOffsetString(i.offset)), ],
                        Domain.makePageParams("RainbowClock", i),
                        JSON.stringify(item) === JSON.stringify(i) ? "current-item": undefined,
                    )
                )
        )
    });
    export const timezoneItem = async (item: Type.TimezoneEntry) => $div("timezone-item tektite-title-item tektite-flex-item")
    ([
        $div("tektite-item-header")
        ([
            tektite.internalLink
            ({
                className: "tektite-item-title",
                href: Domain.makePageParams("RainbowClock", item),
                children:
                [
                    await Resource.loadIconOrCache("tektite-pin-icon"),
                    Tektite.monospace("tick-elapsed-time", item.title),
                ]
            }),
            $div("tektite-item-operator")
            ([
                await tektite.menu.button(await timezoneItemMenu(item)),
            ]),
        ]),
        $div("tektite-item-panel")
        ([
            $div("item-panel-body")
            ([
                Tektite.monospace("item-utc-offset", Domain.timezoneOffsetString(item.offset)),
                Tektite.monospace("item-date", tektite.date.format("YYYY-MM-DD", Domain.getUTCTicks() -item.offset)),
                Tektite.monospace("item-time", tektite.date.format("HH:MM:SS.mmm", tektite.date.getTime(Domain.getUTCTicks() -item.offset))),
            ]),
            $div("item-time-bar")([]),
        ])
    ]);
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
        return await tektite.screen.prompt
        ({
            title: message,
            content:
            [
                inputTitle,
                selectOffset,
            ],
            onCommit: () =>
            ({
                title: inputTitle.value,
                offset: Number.parseInt(selectOffset.value),
            }),
        });
    };
    export const timezoneItemMenu = async (item: Type.TimezoneEntry): Promise<minamo.dom.Source> =>
    [
        tektite.menu.item
        (
            label("Edit"),
            async () =>
            {
                const result = await timezonePrompt(Clockworks.localeMap("Edit"), item.title, item.offset);
                if (null !== result)
                {
                    if (item.title !== result.title || item.offset !== result.offset)
                    {
                        await Operate.edit(item, result.title, result.offset);
                    }
                }
            }
        ),
        tektite.menu.item
        (
            label("Remove"),
            async () => await Operate.remove(item),
            "tektite-delete-button"
        )
    ];
    export const rainbowClockScreenMenu = async () =>
    [
        await RenderBase.fullscreenMenuItem(),
        await RenderBase.themeMenuItem(),
        await RenderBase.progressBarStyleMenuItem(),
        await RenderBase.colorMenuItem(),
        await RenderBase.languageMenuItem(),
        await RenderBase.resetRainbowClockMenuItem(),
        await RenderBase.githubMenuItem(),
    ];
    export const rainbowClockScreenBody = async (item: Type.TimezoneEntry | null, timezones: Type.TimezoneEntry[]) =>
    ({
        primary:
        {
            body:[
                null !== item ?
                    $div("current-title")
                    ([
                        $span("value")(item.title),
                    ]):
                    [],
                Tektite.monospace
                (
                    "current-date",
                    tektite.date.format
                    (
                        "YYYY-MM-DD",
                        null !== item ?
                            Domain.getUTCTicks() -item.offset:
                            Domain.getTicks()
                    )
                ),
                Tektite.monospace
                (
                    "capital-time",
                    tektite.date.format
                    (
                        "HH:MM:SS.mmm",
                        tektite.date.getTime
                        (
                            null !== item ?
                                Domain.getUTCTicks() -item.offset:
                                Domain.getTicks()
                        )
                    )
                ),
                null !== item ?
                    Tektite.monospace("current-utc-offset", Domain.timezoneOffsetString(item.offset)):
                    [],
                await RenderBase.flashIntervalLabel
                (
                    await RenderBase.screenHeaderFlashSegment
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
            ],
            footer: await RenderBase.itemFooter
            (
                item,
                "RainbowClock",
                item => item.title,
                Storage.RainbowClock.Timezone.isSaved,
                Operate.save
            ),
        },
        trail:
        [
            $div("tektite-horizontal-button-list")
            ([
                {
                    tag: "button",
                    className: "tektite-main-button tektite-long-button",
                    children: label("New Time zone"),
                    onclick: async () =>
                    {
                        const result = await timezonePrompt(Clockworks.localeMap("New Time zone"), Clockworks.localeMap("New Time zone"), new Date().getTimezoneOffset());
                        if (result)
                        {
                            await Operate.add({ title: result.title, offset: result.offset, });
                        }
                    }
                },
            ]),
            $div("tektite-row-flex-list timezone-list")
            (
                await Promise.all(timezones.map(item => timezoneItem(item)))
            ),
            $div("description")
            (
                $tag("ul")("tektite-locale-parallel-off")
                ([
                    $tag("li")("")(label("Not support daylight savings time.")),
                    $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                ])
            ),
        ]
    });
    export const rainbowClockScreen = async (item: Type.TimezoneEntry | null, timezones: Type.TimezoneEntry[]): Promise<RenderBase.ScreenSource> =>
    ({
        className: "rainbow-clock-screen",
        header: null === item ?
        {
            items:
            [
                await RenderBase.screenHeaderHomeSegment(),
                await RenderBase.screenHeaderApplicationSegment("RainbowClock"),
            ],
            menu: rainbowClockScreenMenu,
            parent: { },
        }:
        {
            items:
            [
                await RenderBase.screenHeaderHomeSegment(),
                await RenderBase.screenHeaderApplicationSegment("RainbowClock"),
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
        let timezones = Storage.RainbowClock.Timezone.get();
        const updateScreen = async (event: Tektite.UpdateScreenEventEype) =>
        {
            const screen = tektite.screen.getElement();
            const now = new Date();
            const tick = null !== item ?
                (Domain.getUTCTicks(now) -(item.offset *Domain.utcOffsetRate)):
                Domain.getTicks(now);
            const currentNow = new Date(tick);
            switch(event)
            {
                case "high-resolution-timer":
                    const capitalTime = tektite.date.format("HH:MM:SS", tektite.date.getTime(tick));
                    const capitalTimeSpan = screen.getElementsByClassName("capital-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                    if (minamo.dom.setProperty(capitalTimeSpan, "innerText", capitalTime).isUpdate)
                    {
                        tektite.setTitle(capitalTime +" - " +applicationTitle);
                        if (capitalTime.endsWith(":00"))
                        {
                            const flashInterval = Storage.RainbowClock.flashInterval.get();
                            if (0 < flashInterval)
                            {
                                if (0 === (tick % flashInterval))
                                {
                                    tektite.flash();
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
                                    const panel = minamo.dom.getDivsByClassName(dom, "tektite-item-panel")[0];
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
                                    minamo.dom.setProperty(minamo.dom.getDivsByClassName(minamo.dom.getDivsByClassName(panel, "item-date")[0], "value")[0], "innerText", tektite.date.format("YYYY-MM-DD www", currentTick));
                                    minamo.dom.getDivsByClassName(minamo.dom.getDivsByClassName(panel, "item-time")[0], "value")[0].innerText = tektite.date.format("HH:MM:SS", tektite.date.getTime(currentTick));
                                }
                            );
                        }
                    }
                    break;
                case "timer":
                    const dateString = tektite.date.format("YYYY-MM-DD www", tick);
                    const currentDateSpan = screen.getElementsByClassName("current-date")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                    minamo.dom.setProperty(currentDateSpan, "innerText", dateString);
                    const getRainbowColor = Type.rainbowClockColorPatternMap[Storage.RainbowClock.colorPattern.get()];
                    const currentColor = getRainbowColor(currentNow.getHours());
                    tektite.setBackgroundColor(currentColor);
                    const hourUnit = 60 *60 *1000;
                    const minutes = (tick % hourUnit) / hourUnit;
                    const nextColor = getRainbowColor(currentNow.getHours() +1);
                    RenderBase.setProgress(minutes, nextColor);
                    tektite.setWindowColor(Color.mixColors(currentColor, nextColor, minutes));
                    break;
                case "storage":
                    await RenderBase.reload();
                    break;
                case "operate":
                    timezones = Storage.RainbowClock.Timezone.get();
                    await tektite.screen.replaceBody(await rainbowClockScreenBody(item, timezones));
                    tektite.screen.resizeFlexList();
                    await updateScreen("timer");
                    await tektite.screen.scrollToOffset(document.getElementById("tektite-screen-body"), 0);
                    tektite.screen.adjustPageFooterPosition();
                    break;
            }
        };
        await RenderBase.showScreen(await rainbowClockScreen(item, timezones), updateScreen);
        await updateScreen("timer");
    };
}