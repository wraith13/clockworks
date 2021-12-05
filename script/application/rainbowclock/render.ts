import { minamo } from "../../../nephila/minamo.js";
import { Clockworks, tektite } from "../..";
import { Tektite } from "../../../tektite.js/script";
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
    export const timezoneItem = async (item: Type.TimezoneEntry) => $div("timezone-item flex-item")
    ([
        $div("item-header")
        ([
            tektite.internalLink
            ({
                className: "item-title",
                href: Domain.makePageParams("RainbowClock", item),
                children:
                [
                    await Resource.loadSvgOrCache("tektite-pin-icon"),
                    $div("tick-elapsed-time")([$span("value monospace")(item.title),]),
                ]
            }),
            $div("item-operator")
            ([
                await tektite.menu.button(await timezoneItemMenu(item)),
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
                const ui = tektite.screen.popup
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
            "delete-button"
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
                ]),
            ]),
            $div("page-footer")
            ([
                null !== item ?
                    $div("button-list")
                    ([
                        tektite.internalLink
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
                                onclick: async () => await RenderBase.sharePopup(item.title),
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
    ]);
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
                await RenderBase.screenHeaderTimezoneSegment(item, timezones),
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
        const updateWindow = async (event: Tektite.UpdateWindowEventEype) =>
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
                        tektite.setTitle(capitalTime +" - " +applicationTitle);
                        if (capitalTime.endsWith(":00"))
                        {
                            const flashInterval = Storage.RainbowClock.flashInterval.get();
                            if (0 < flashInterval)
                            {
                                if (0 === (tick % flashInterval))
                                {
                                    tektite.screen.flash();
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
                    Tektite.setBackgroundColor(currentColor);
                    const hourUnit = 60 *60 *1000;
                    const minutes = (tick % hourUnit) / hourUnit;
                    const nextColor = getRainbowColor(currentNow.getHours() +1);
                    RenderBase.setProgress(minutes, nextColor);
                    Tektite.setBodyColor(Color.mixColors(currentColor, nextColor, minutes));
                    break;
                case "storage":
                    await RenderBase.reload();
                    break;
                case "operate":
                    timezones = Storage.RainbowClock.Timezone.get();
                    tektite.screen.replaceBody(await rainbowClockScreenBody(item, timezones));
                    RenderBase.resizeFlexList();
                    await updateWindow("timer");
                    await tektite.screen.scrollToOffset(document.getElementById("screen-body"), 0);
                    tektite.screen.adjustPageFooterPosition();
                    break;
            }
        };
        await RenderBase.showWindow(await rainbowClockScreen(item, timezones), updateWindow);
        await updateWindow("timer");
    };
}