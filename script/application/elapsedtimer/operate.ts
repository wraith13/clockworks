import { Clockworks, tektite } from "../..";
import { Type } from "../../type";
import { Base } from "../../base";
import { Storage } from "../../storage";
import { Domain } from "../../domain";
import { Render } from "../../render";
export module Operate
{
    export const newEvent = async (title: string, tick: number, onCanceled?: () => unknown) =>
    {
        const event: Type.EventEntry =
        {
            title,
            tick,
        };
        Storage.ElapsedTimer.Events.add(event);
        tektite.screen.updateWindow("operate");
        const toast = tektite.toast.makePrimary
        ({
            content: tektite.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.ElapsedTimer.Events.remove(event);
                    tektite.screen.updateWindow("operate");
                    await toast.hide();
                    onCanceled?.();
                }
            ),
        });
    };
    export const save = async (item: Type.EventEntry, onCanceled?: () => unknown) =>
    {
        Storage.ElapsedTimer.Events.add(item);
        tektite.screen.updateWindow("operate");
        const toast = tektite.toast.makePrimary
        ({
            content: tektite.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.ElapsedTimer.Events.remove(item);
                    tektite.screen.updateWindow("operate");
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
        tektite.screen.updateWindow("operate");
        const toast = tektite.toast.makePrimary
        ({
            content: tektite.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.ElapsedTimer.Events.remove(newSchedule);
                    Storage.ElapsedTimer.Events.add(oldSchedule);
                    tektite.screen.updateWindow("operate");
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
            tektite.screen.updateWindow("operate");
        }
        const toast = tektite.toast.makePrimary
        ({
            content: tektite.$span("")(`${Clockworks.localeMap("Removed.")}`),
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
                        tektite.screen.updateWindow("operate");
                    }
                    await toast.hide();
                    onCanceled?.();
                }
            ),
        });
    };
    export const removeAllEvents = async () =>
    {
        if (Render.systemConfirm(Clockworks.localeMap("This action cannot be undone. Do you want to continue?")))
        {
            Storage.ElapsedTimer.Events.removeKey();
            tektite.screen.updateWindow("operate");
            tektite.toast.makePrimary({ content: tektite.$span("")(`${Clockworks.localeMap("Removed all alarms!")}`), });
        }
    };
}
