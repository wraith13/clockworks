import { Clockworks } from "../..";
import { Locale } from "../../locale";
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
        Render.updateWindow("operate");
        Clockworks.tektite.screenFlash();
        const toast = Clockworks.tektite.toast.makePrimary
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
        const toast = Clockworks.tektite.toast.makePrimary
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
        const toast = Clockworks.tektite.toast.makePrimary
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
        const toast = Clockworks.tektite.toast.makePrimary
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
            Clockworks.tektite.toast.makePrimary({ content: Render.$span("")(`${Locale.map("Removed all stamps!")}`), });
        }
    };
}
