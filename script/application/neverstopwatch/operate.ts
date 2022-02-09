import { Clockworks, tektite } from "../..";
import { Tektite } from "../../../tektite.js/script/tektite-index";
import { Base } from "../../base";
import { Storage } from "../../storage";
import { Domain } from "../../domain";
import { Render } from "../../render";
export module Operate
{
    export const stamp = async (tick: number, onCanceled?: () => unknown) =>
    {
        const backup = Storage.NeverStopwatch.Stamps.get();
        Storage.NeverStopwatch.Stamps.add(tick);
        tektite.screen.update("operate");
        tektite.flash();
        const toast = tektite.screen.toast.make
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Stamped!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.NeverStopwatch.Stamps.set(backup);
                    tektite.screen.update("operate");
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
        tektite.screen.update("operate");
        const toast = tektite.screen.toast.make
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.NeverStopwatch.Stamps.set(backup);
                    tektite.screen.update("operate");
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
        tektite.screen.update("operate");
        const toast = tektite.screen.toast.make
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Updated.")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.NeverStopwatch.Stamps.set(backup);
                    tektite.screen.update("operate");
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
            tektite.screen.update("operate");
        }
        const toast = tektite.screen.toast.make
        ({
            content: Tektite.$span("")(`${Clockworks.localeMap("Removed.")}`),
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
                        tektite.screen.update("operate");
                    }
                    await toast.hide();
                    onCanceled?.();
                }
            ),
        });
    };
    export const removeAllStamps = async () =>
    {
        if (Render.systemConfirm(Clockworks.localeMap("This action cannot be undone. Do you want to continue?")))
        {
            Storage.NeverStopwatch.Stamps.removeKey();
            tektite.screen.update("operate");
            tektite.screen.toast.make({ content: Tektite.$span("")(`${Clockworks.localeMap("Removed all stamps!")}`), });
        }
    };
}
