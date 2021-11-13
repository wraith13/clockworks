import { Clockworks } from "../..";
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
        Clockworks.tektite.screen.updateWindow("operate");
        const toast = Clockworks.tektite.toast.makePrimary
        ({
            content: Render.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.RainbowClock.Timezone.remove(item);
                    Clockworks.tektite.screen.updateWindow("operate");
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
        Clockworks.tektite.screen.updateWindow("operate");
        const toast = Clockworks.tektite.toast.makePrimary
        ({
            content: Render.$span("")(`${Clockworks.localeMap("Saved!")}`),
            backwardOperator: Render.cancelTextButton
            (
                async () =>
                {
                    Storage.RainbowClock.Timezone.remove(newTimezone);
                    Storage.RainbowClock.Timezone.add(oldTimezone);
                    Clockworks.tektite.screen.updateWindow("operate");
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
            Clockworks.tektite.screen.updateWindow("operate");
        }
        const toast = Clockworks.tektite.toast.makePrimary
        ({
            content: Render.$span("")(`${Clockworks.localeMap("Removed.")}`),
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
                        Clockworks.tektite.screen.updateWindow("operate");
                    }
                    await toast.hide();
                    onCanceled?.();
                }
            ),
        });
    };
    export const reset = async () =>
    {
        if (Render.systemConfirm(Clockworks.localeMap("This action cannot be undone. Do you want to continue?")))
        {
            Storage.RainbowClock.Timezone.removeKey();
            Clockworks.tektite.screen.updateWindow("operate");
            Clockworks.tektite.toast.makePrimary({ content: Render.$span("")(`${Clockworks.localeMap("Initialized timezone list!")}`), });
        }
    };
}
