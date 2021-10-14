import { minamo } from "../minamo.js";
import { Locale } from "../locale";
import { Type } from "../type";
import { Base } from "../base";
import { Storage } from "../storage";
import { Domain } from "../domain";
import { Render } from "./";
import { Operate as RainbowClockOperate } from "../application/rainbowclock/operate";
import config from "../../resource/config.json";
export module Operate
{
    export const copyToClipboard = (text: string, displayText = `"${text}"`) =>
    {
        const pre = minamo.dom.make(HTMLPreElement)
        ({
            children: text,
        });
        document.body.appendChild(pre);
        document.getSelection().selectAllChildren(pre);
        document.execCommand("copy");
        document.body.removeChild(pre);
        Render.makeToast({ content: `Copied ${displayText} to the clipboard.`,});
    };
    export const RainbowClock = RainbowClockOperate;
    export module NeverStopwatch
    {
        export const stamp = async (tick: number, onCanceled?: () => unknown) =>
        {
            const backup = Storage.NeverStopwatch.Stamps.get();
            Storage.NeverStopwatch.Stamps.add(tick);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Stamped!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.NeverStopwatch.Stamps.set(backup);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const save = async (tick: number, onCanceled?: () => unknown) =>
        {
            const backup = Storage.NeverStopwatch.Stamps.get();
            Storage.NeverStopwatch.Stamps.add(tick);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Saved!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.NeverStopwatch.Stamps.set(backup);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const edit = async (oldTick: number, newTick: number, onCanceled?: () => unknown) =>
        {
            const backup = Storage.NeverStopwatch.Stamps.get();
            Storage.NeverStopwatch.Stamps.remove(oldTick);
            Storage.NeverStopwatch.Stamps.add(newTick);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Updated.")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.NeverStopwatch.Stamps.set(backup);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const removeStamp = async (tick: number, onCanceled?: () => unknown) =>
        {
            // const urlParams = getUrlParams(location.href)["item"];
            const isOpend = !! Base.getUrlHash(location.href).split("/")[1];
            const backup = Storage.NeverStopwatch.Stamps.get();
            Storage.NeverStopwatch.Stamps.remove(tick);
            if (isOpend)
            {
                Render.showUrl({ application: "NeverStopwatch", });
            }
            else
            {
                Render.updateWindow("operate");
            }
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Removed.")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.NeverStopwatch.Stamps.set(backup);
                        if (isOpend)
                        {
                            Render.showUrl(Domain.makePageParams("NeverStopwatch", tick));
                        }
                        else
                        {
                            Render.updateWindow("operate");
                        }
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const removeAllStamps = async () =>
        {
            if (Render.systemConfirm(Locale.map("This action cannot be undone. Do you want to continue?")))
            {
                Storage.NeverStopwatch.Stamps.removeKey();
                Render.updateWindow("operate");
                Render.makePrimaryToast({ content: Render.$span("")(`${Locale.map("Removed all stamps!")}`), });
            }
        };
    }
    export module CountdownTimer
    {
        export const newTimer = async (i: number, onCanceled?: () => unknown) =>
        {
            const tick = Domain.getTicks();
            const alarm: Type.AlarmTimerEntry =
            {
                type: "timer",
                start: tick,
                end: tick +i,
            };
            Storage.CountdownTimer.Alarms.add(alarm);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Saved!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.CountdownTimer.Alarms.remove(alarm);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const newSchedule = async (title: string, end: number, onCanceled?: () => unknown) =>
        {
            const alarm: Type.AlarmScheduleEntry =
            {
                type: "schedule",
                title,
                start: Domain.getTicks(),
                end,
            };
            Storage.CountdownTimer.Alarms.add(alarm);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Saved!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.CountdownTimer.Alarms.remove(alarm);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const save = async (item: Type.AlarmEntry, onCanceled?: () => unknown) =>
        {
            Storage.CountdownTimer.Alarms.add(item);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Saved!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.CountdownTimer.Alarms.remove(item);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const edit = async (item: Type.AlarmScheduleEntry, title: string, start: number, end: number, onCanceled?: () => unknown) =>
        {
            const oldSchedule = item;
            const newSchedule: Type.AlarmScheduleEntry =
            {
                type: item.type,
                title,
                start,
                end,
            };
            Storage.CountdownTimer.Alarms.remove(oldSchedule);
            Storage.CountdownTimer.Alarms.add(newSchedule);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Saved!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.CountdownTimer.Alarms.remove(newSchedule);
                        Storage.CountdownTimer.Alarms.add(oldSchedule);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const done = async (item: Type.AlarmEntry, onCanceled?: () => unknown) =>
        {
            Storage.CountdownTimer.Alarms.remove(item);
            if ("schedule" === item.type)
            {
                Storage.ElapsedTimer.Events.add({ title: item.title, tick: item.end, });
            }
            const color = Storage.CountdownTimer.ColorIndex.get();
            Storage.CountdownTimer.ColorIndex.set((color +1) % config.rainbowColorSet.length);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Done!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.CountdownTimer.Alarms.add(item);
                        if ("schedule" === item.type)
                        {
                            Storage.ElapsedTimer.Events.remove({ title: item.title, tick: item.end, });
                        }
                        Storage.CountdownTimer.ColorIndex.set(color);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const doneTemprary = async (item: Type.AlarmEntry, onCanceled?: () => unknown) =>
        {
            const color = Storage.CountdownTimer.ColorIndex.get();
            Storage.CountdownTimer.ColorIndex.set((color +1) % config.rainbowColorSet.length);
            Render.showUrl({ application: "CountdownTimer", });
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Done!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.CountdownTimer.ColorIndex.set(color);
                        Render.showUrl(Domain.makePageParams("CountdownTimer", item));
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const removeAlarm = async (item: Type.AlarmEntry, onCanceled?: () => unknown) =>
        {
            // const urlParams = getUrlParams(location.href)["item"];
            const isOpend = !! Base.getUrlHash(location.href).split("/")[1];
            Storage.CountdownTimer.Alarms.remove(item);
            if (isOpend)
            {
                Render.showUrl({ application: "CountdownTimer", });
            }
            else
            {
                Render.updateWindow("operate");
            }
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Removed.")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.CountdownTimer.Alarms.add(item);
                        if (isOpend)
                        {
                            Render.showUrl(Domain.makePageParams("CountdownTimer", item));
                        }
                        else
                        {
                            Render.updateWindow("operate");
                        }
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const removeAllAlarms = async () =>
        {
            if (Render.systemConfirm(Locale.map("This action cannot be undone. Do you want to continue?")))
            {
                Storage.CountdownTimer.Alarms.removeKey();
                Render.updateWindow("operate");
                Render.makePrimaryToast({ content: Render.$span("")(`${Locale.map("Removed all alarms!")}`), });
            }
        };
    }
    export module ElapsedTimer
    {
        export const newEvent = async (title: string, tick: number, onCanceled?: () => unknown) =>
        {
            const event: Type.EventEntry =
            {
                title,
                tick,
            };
            Storage.ElapsedTimer.Events.add(event);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Saved!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.ElapsedTimer.Events.remove(event);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const save = async (item: Type.EventEntry, onCanceled?: () => unknown) =>
        {
            Storage.ElapsedTimer.Events.add(item);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Saved!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.ElapsedTimer.Events.remove(item);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const edit = async (item: Type.EventEntry, title: string, tick: number, onCanceled?: () => unknown) =>
        {
            const oldSchedule = item;
            const newSchedule: Type.EventEntry =
            {
                title,
                tick,
            };
            Storage.ElapsedTimer.Events.remove(oldSchedule);
            Storage.ElapsedTimer.Events.add(newSchedule);
            Render.updateWindow("operate");
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Saved!")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.ElapsedTimer.Events.remove(newSchedule);
                        Storage.ElapsedTimer.Events.add(oldSchedule);
                        Render.updateWindow("operate");
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const remove = async (item: Type.EventEntry, onCanceled?: () => unknown) =>
        {
            // const urlParams = getUrlParams(location.href)["item"];
            const isOpend = !! Base.getUrlHash(location.href).split("/")[1];
            Storage.ElapsedTimer.Events.remove(item);
            if (isOpend)
            {
                Render.showUrl({ application: "ElapsedTimer", });
            }
            else
            {
                Render.updateWindow("operate");
            }
            const toast = Render.makePrimaryToast
            ({
                content: Render.$span("")(`${Locale.map("Removed.")}`),
                backwardOperator: Render.cancelTextButton
                (
                    async () =>
                    {
                        Storage.ElapsedTimer.Events.add(item);
                        if (isOpend)
                        {
                            Render.showUrl(Domain.makePageParams("ElapsedTimer", item));
                        }
                        else
                        {
                            Render.updateWindow("operate");
                        }
                        await toast.hide();
                        onCanceled?.();
                    }
                ),
            });
        };
        export const removeAllEvents = async () =>
        {
            if (Render.systemConfirm(Locale.map("This action cannot be undone. Do you want to continue?")))
            {
                Storage.ElapsedTimer.Events.removeKey();
                Render.updateWindow("operate");
                Render.makePrimaryToast({ content: Render.$span("")(`${Locale.map("Removed all alarms!")}`), });
            }
        };
    }
}
