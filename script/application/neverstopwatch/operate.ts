import { Clockworks } from "../..";
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
        Clockworks.tektite.screen.updateWindow("operate");
        Clockworks.tektite.screen.flash();
        const toast = Clockworks.tektite.toast.makePrimary
        ({
            content: Render.$span("")(`${Clockworks.localeMap("Stamped!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.NeverStopwatch.Stamps.set(backup);
                    Clockworks.tektite.screen.updateWindow("operate");
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
        Clockworks.tektite.screen.updateWindow("operate");
        const toast = Clockworks.tektite.toast.makePrimary
        ({
            content: Render.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.NeverStopwatch.Stamps.set(backup);
                    Clockworks.tektite.screen.updateWindow("operate");
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
        Clockworks.tektite.screen.updateWindow("operate");
        const toast = Clockworks.tektite.toast.makePrimary
        ({
            content: Render.$span("")(`${Clockworks.localeMap("Updated.")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.NeverStopwatch.Stamps.set(backup);
                    Clockworks.tektite.screen.updateWindow("operate");
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
            Clockworks.tektite.screen.updateWindow("operate");
        }
        const toast = Clockworks.tektite.toast.makePrimary
        ({
            content: Render.$span("")(`${Clockworks.localeMap("Removed.")}`),
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
                        Clockworks.tektite.screen.updateWindow("operate");
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
            Clockworks.tektite.screen.updateWindow("operate");
            Clockworks.tektite.toast.makePrimary({ content: Render.$span("")(`${Clockworks.localeMap("Removed all stamps!")}`), });
        }
    };
}
