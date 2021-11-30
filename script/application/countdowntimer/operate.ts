import { Clockworks, tektite } from "../..";
import { Tektite } from "../../../tektite.js/script";
import { Type } from "../../type";
import { Base } from "../../base";
import { Storage } from "../../storage";
import { Domain } from "../../domain";
import { Render } from "../../render";
import config from "../../../resource/config.json";
export module Operate
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
        tektite.screen.updateWindow("operate");
        const toast = tektite.toast.makePrimary
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.CountdownTimer.Alarms.remove(alarm);
                    tektite.screen.updateWindow("operate");
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
        tektite.screen.updateWindow("operate");
        const toast = tektite.toast.makePrimary
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.CountdownTimer.Alarms.remove(alarm);
                    tektite.screen.updateWindow("operate");
                    await toast.hide();
                    onCanceled?.();
                }
            ),
        });
    };
    export const save = async (item: Type.AlarmEntry, onCanceled?: () => unknown) =>
    {
        Storage.CountdownTimer.Alarms.add(item);
        tektite.screen.updateWindow("operate");
        const toast = tektite.toast.makePrimary
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.CountdownTimer.Alarms.remove(item);
                    tektite.screen.updateWindow("operate");
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
        tektite.screen.updateWindow("operate");
        const toast = tektite.toast.makePrimary
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.CountdownTimer.Alarms.remove(newSchedule);
                    Storage.CountdownTimer.Alarms.add(oldSchedule);
                    tektite.screen.updateWindow("operate");
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
        tektite.screen.updateWindow("operate");
        const toast = tektite.toast.makePrimary
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Done!")}`),
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
                    tektite.screen.updateWindow("operate");
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
        const toast = tektite.toast.makePrimary
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Done!")}`),
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
            tektite.screen.updateWindow("operate");
        }
        const toast = tektite.toast.makePrimary
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Removed.")}`),
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
                        tektite.screen.updateWindow("operate");
                    }
                    await toast.hide();
                    onCanceled?.();
                }
            ),
        });
    };
    export const removeAllAlarms = async () =>
    {
        if (Render.systemConfirm(Clockworks.localeMap("This action cannot be undone. Do you want to continue?")))
        {
            Storage.CountdownTimer.Alarms.removeKey();
            tektite.screen.updateWindow("operate");
            tektite.toast.makePrimary({ content: Tektite.$span("")(`${Clockworks.localeMap("Removed all alarms!")}`), });
        }
    };
}
