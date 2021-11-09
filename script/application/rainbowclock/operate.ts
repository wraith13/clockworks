import { Clockworks } from "../..";
import { Locale } from "../../locale";
import { Type } from "../../type";
import { Base } from "../../base";
import { Storage } from "../../storage";
import { Domain } from "../../domain";
import { Render } from "../../render";
export module Operate
{
    export const add = async (item: Type.TimezoneEntry, onCanceled?: () => unknown) =>
    {
        Storage.RainbowClock.Timezone.add(item);
        Render.updateWindow("operate");
        const toast = Clockworks.tektite.toast.makePrimary
        ({
            content: Render.$span("")(`${Locale.map("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.RainbowClock.Timezone.remove(item);
                    Render.updateWindow("operate");
                    await toast.hide();
                    onCanceled?.();
                }
            ),
        });
    };
    export const save = add;
    export const edit = async (item: Type.TimezoneEntry, title: string, offset: number, onCanceled?: () => unknown) =>
    {
        const oldTimezone = item;
        const newTimezone: Type.TimezoneEntry =
        {
            title,
            offset,
        };
        Storage.RainbowClock.Timezone.remove(oldTimezone);
        Storage.RainbowClock.Timezone.add(newTimezone);
        Render.updateWindow("operate");
        const toast = Clockworks.tektite.toast.makePrimary
        ({
            content: Render.$span("")(`${Locale.map("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.RainbowClock.Timezone.remove(newTimezone);
                    Storage.RainbowClock.Timezone.add(oldTimezone);
                    Render.updateWindow("operate");
                    await toast.hide();
                    onCanceled?.();
                }
            ),
        });
    };
    export const remove = async (item: Type.TimezoneEntry, onCanceled?: () => unknown) =>
    {
        // const urlParams = getUrlParams(location.href)["item"];
        const isOpend = !! Base.getUrlHash(location.href).split("/")[1];
        Storage.RainbowClock.Timezone.remove(item);
        if (isOpend)
        {
            Render.showUrl({ application: "RainbowClock", });
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
                    Storage.RainbowClock.Timezone.add(item);
                    if (isOpend)
                    {
                        Render.showUrl(Domain.makePageParams("RainbowClock", item));
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
    export const reset = async () =>
    {
        if (Render.systemConfirm(Locale.map("This action cannot be undone. Do you want to continue?")))
        {
            Storage.RainbowClock.Timezone.removeKey();
            Render.updateWindow("operate");
            Clockworks.tektite.toast.makePrimary({ content: Render.$span("")(`${Locale.map("Initialized timezone list!")}`), });
        }
    };
}
